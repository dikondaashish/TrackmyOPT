import suspiciousAddresses from '@/data/suspicious_addresses.json';

type VirtualOfficeData = {
    count: number;
    samples: string[];
    risk_level: 'HIGH' | 'MEDIUM';
    type: string;
};

// Type assertion for the imported JSON
const CLUSTER_DATA = suspiciousAddresses as Record<string, VirtualOfficeData>;

export function normalizeAddress(addr: string): string {
    if (!addr) return "";
    let normalized = addr.toLowerCase().trim();
    normalized = normalized.replace(/\bsuite\b/g, "ste")
        .replace(/\bfloor\b/g, "fl")
        .replace(/\bbuilding\b/g, "bldg");
    normalized = normalized.replace(/[.,]/g, ""); // Remove dots and commas
    return normalized;
}

export function getVirtualOfficeStatus(address1: string, city: string): VirtualOfficeData | null {
    if (!address1 || !city) return null;

    const key = `${normalizeAddress(address1)}, ${normalizeAddress(city)}`;
    return CLUSTER_DATA[key] || null;
}
