import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

async function signOut(request: Request) {
  try {
    console.log('🚪 Signout route called');
    const cookieStore = cookies();
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              console.log('🗑️ Removing cookie:', name);
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.error('Cookie set error:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              console.log('🗑️ Clearing cookie:', name);
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              console.error('Cookie remove error:', error);
            }
          },
        },
      }
    );

    // Sign out from Supabase - this clears all auth cookies
    console.log('🔓 Calling Supabase signOut...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Supabase signout error:', error);
    } else {
      console.log('✅ Supabase signout successful');
    }

    // Check if this is from the extension (no redirect needed)
    const url = new URL(request.url);
    const fromExtension = url.searchParams.get('from') === 'extension';
    
    if (fromExtension) {
      // For extension, just return success message
      console.log('📱 Signout from extension - returning success');
      return NextResponse.json({ ok: true, message: 'Signed out successfully' });
    }

    // For web, redirect to home page
    console.log('🌐 Signout from web - redirecting to home');
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('❌ Signout route error:', error);
    
    // Check if this is from the extension
    const url = new URL(request.url);
    const fromExtension = url.searchParams.get('from') === 'extension';
    
    if (fromExtension) {
      return NextResponse.json({ ok: true, message: 'Signed out (with errors)' });
    }
    
    // Even if there's an error, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function POST(request: Request) {
  return signOut(request);
}

export async function GET(request: Request) {
  return signOut(request);
}

