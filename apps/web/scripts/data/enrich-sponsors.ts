
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_FILINGS_URL || !process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY) {
    console.error("Missing primary or filings Supabase credentials in .env.local");
    process.exit(1);
}

const primaryUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const primaryKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const filingsUrl = process.env.SUPABASE_FILINGS_URL;
const filingsKey = process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY;

const supabase = createClient(
    primaryUrl,
    primaryKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
const filingsSupabase = createClient(
    filingsUrl,
    filingsKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// Load Suspicious Addresses
const SUSPICIOUS_ADDR_PATH = path.join(__dirname, '../data/suspicious_addresses.json');
let suspiciousData: Record<string, any> = {};

try {
    const fileContent = fs.readFileSync(SUSPICIOUS_ADDR_PATH, 'utf-8');
    suspiciousData = JSON.parse(fileContent);
    console.log(`Loaded ${Object.keys(suspiciousData).length} suspicious address clusters.`);
} catch (_e) {
    console.warn("Could not load suspicious_addresses.json.");
}

function normalizeAddress(addr: string): string {
    if (!addr) return "";
    let normalized = addr.toLowerCase().trim();
    normalized = normalized.replace(/\bsuite\b/g, "ste")
        .replace(/\bfloor\b/g, "fl")
        .replace(/\bbuilding\b/g, "bldg");
    normalized = normalized.replace(/[.,]/g, "");
    return normalized;
}

function checkVirtualOffice(addr1: string, city: string) {
    if (!addr1 || !city) return false;
    const key = `${normalizeAddress(addr1)}, ${normalizeAddress(city)}`;
    return !!suspiciousData[key];
}

interface SponsorIntelligenceRow {
    sponsor_id: string;
    employer_address1: string;
    employer_city: string;
    employer_state: string;
    top_law_firm: string;
    entry_level_percent: number;
}

async function main() {
    console.log("Starting Database Enrichment...");

    // 1. Fetch Aggregated Data from View
    // Fetch in batches of 1000 to manage memory
    let offset = 0;
    const limit = 200; // Smaller batch for complex view query
    let hasMore = true;
    let totalUpdated = 0;

    while (hasMore) {
        console.log(`Fetching sponsors batch offset ${offset}...`);

        // 1. Fetch Batch of Sponsor IDs (Fast)
        const { data: sponsors, error: sponsorsError } = await supabase
            .from('h1b_sponsors')
            .select('id, name')
            .order('id')
            .range(offset, offset + limit - 1);

        if (sponsorsError || !sponsors || sponsors.length === 0) {
            hasMore = false;
            break;
        }

        const sponsorIds = sponsors.map(s => s.id);

        // 2. Fetch filing aggregates from the server-only filings project.
        // The secondary project intentionally has no cross-project FK to sponsors.
        const { data: intelData, error: intelError } = await filingsSupabase
            .from('filing_intelligence_agg')
            .select('sponsor_id, employer_address1, employer_city, employer_state, top_law_firm, entry_level_percent')
            .in('sponsor_id', sponsorIds);

        if (intelError) {
            console.error("Error fetching intelligence RPC:", intelError);
            offset += limit;
            continue;
        }

        // Map intel data by ID for easy lookup
        // Explicitly cast the RPC response to our interface
        const safeIntelData = (intelData as unknown as SponsorIntelligenceRow[]) || [];
        const intelMap = new Map<string, SponsorIntelligenceRow>(
            safeIntelData.map(d => [d.sponsor_id, d])
        );

        // 3. Process and Update
        const updates = sponsors.map(sponsor => {
            const row = intelMap.get(sponsor.id);
            // Fallback if view doesn't return row (unlikely but possible if view changes)
            if (!row) return null;

            const isVirtual = checkVirtualOffice(row.employer_address1 || "", row.employer_city || "");

            return {
                id: sponsor.id,
                name: sponsor.name,
                address_line1: row.employer_address1,
                city: row.employer_city,
                state: row.employer_state,
                top_law_firm: row.top_law_firm,
                entry_level_percent: row.entry_level_percent,
                is_virtual_office: isVirtual,
            };
        }).filter((u): u is NonNullable<typeof u> => u !== null);

        if (updates.length > 0) {
            const { error: updateError } = await supabase
                .from('h1b_sponsors')
                .upsert(updates, { onConflict: 'id', ignoreDuplicates: false });

            if (updateError) {
                console.error("Error updating batch:", updateError);
            } else {
                totalUpdated += updates.length;
            }
        }

        offset += limit;
    }

    console.log(`Finished! enriched ${totalUpdated} sponsors.`);
}

main();
