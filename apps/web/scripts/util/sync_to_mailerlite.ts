import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local from apps/web
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MAILERLITE_API_KEY) {
  console.error('Missing required environment variables in apps/web/.env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getGroupId(groupName: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.mailerlite.com/api/v2/groups', {
      headers: { 'X-MailerLite-ApiKey': MAILERLITE_API_KEY! }
    });
    
    // Use text() and then regex or a safe parser to avoid precision loss
    // but since we just need the "id" field, let's try reading it as text first
    const text = await response.text();
    // Simple regex to find the id for the group name
    const groups = JSON.parse(text);
    const group = groups.find((g: any) => g.name.toLowerCase() === groupName.toLowerCase());
    
    // MailerLite v2 IDs are returned as numbers in JSON, but we must treat them as strings
    if (group) {
      // Find the raw ID in the text to be absolutely sure
      const idMatch = text.match(new RegExp(`"id":(\\d+),"name":"${groupName}"`, 'i'));
      return idMatch ? idMatch[1] : String(group.id);
    }
    return null;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return null;
  }
}

async function syncUsers() {
  console.log('Fetching all users from auth.users (admin)...');
  
  let allUsers: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      console.error('Error fetching users:', error);
      break;
    }

    if (!users || users.length === 0) break;

    allUsers = [...allUsers, ...users];
    
    // Check if there are more pages
    if (users.length < perPage) break;
    page++;
  }

  console.log(`Found ${allUsers.length} total users in Auth.`);

  const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name');
  const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

  let actualGroupId: string | null = MAILERLITE_GROUP_ID || null;
  if (actualGroupId && isNaN(Number(actualGroupId))) {
    actualGroupId = await getGroupId(actualGroupId);
    console.log(`Resolved Group ID: ${actualGroupId}`);
  }

  console.log('Starting migration to MailerLite...');

  for (const user of allUsers) {
    try {
      const email = user.email;
      if (!email) continue;

      const profile = profileMap.get(user.id);
      const metadata = user.user_metadata || {};
      
      // Comprehensive name field mapping
      let firstName = profile?.first_name || metadata.first_name || metadata.firstName || '';
      let lastName = profile?.last_name || metadata.last_name || metadata.lastName || '';

      // If still empty, try parsing from common 'name' or 'full_name' fields
      if (!firstName) {
        const fullName = metadata.full_name || metadata.fullName || metadata.name || '';
        if (fullName) {
          const parts = fullName.split(' ');
          firstName = parts[0];
          if (parts.length > 1 && !lastName) {
            lastName = parts.slice(1).join(' ');
          }
        }
      }

      const payload: any = {
        email,
        fields: {
          name: firstName,
          last_name: lastName,
        },
        resubscribe: true
      };

      if (actualGroupId) {
        payload.groups = [actualGroupId];
      }

      // Add to global subscribers with group assignment and retry logic
      let synced = false;
      let retries = 0;
      while (!synced && retries < 3) {
        try {
          const response = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-MailerLite-ApiKey': MAILERLITE_API_KEY!,
            },
            body: JSON.stringify(payload)
          });

          if (response.status === 429) {
             console.log(`⚠️ Rate limited for ${email}. Waiting 5 seconds (retry ${retries + 1})...`);
             await new Promise(resolve => setTimeout(resolve, 5000));
             retries++;
             continue;
          }

          if (!response.ok) {
            const err = await response.json();
            console.error(`❌ Failed ${email}:`, err);
            break;
          } else {
            console.log(`✅ Synced: ${email}`);
            synced = true;
          }
        } catch (err: any) {
           console.error(`❌ Error ${email}:`, err.message);
           break;
        }
      }
    } catch (err: any) {
      console.error(`❌ Unexpected error for ${user.email}:`, err.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('Bulk synchronization complete.');
}

syncUsers();
