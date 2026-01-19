import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// NOTE: In a real production environment, this would:
// 1. Fetch data from Reddit (r/USCIS, r/f1visa) or check USCIS Case Status APIs.
// 2. Cache the results in a database (like Redis or Postgres) for 1-6 hours.
// 3. Serve the cached data to minimize API rate limits and latency.

// For now, we simulate "real" live data by generating it dynamically based on realistic parameters.
// This mimics the structure of a real response.

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRecentTimestamp(hoursAgo: number) {
    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo === 1) return '1 hour ago';
    if (hoursAgo < 24) return `${hoursAgo} hours ago`;
    const days = Math.floor(hoursAgo / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
}

export async function GET(request: NextRequest) {
    // Simulate network latency
    // await new Promise(resolve => setTimeout(resolve, 500)); 

    // Realistic "Live" Stats
    const data = {
        'opt-apply': {
            mainStat: { value: getRandomInt(85, 95), label: 'Average Approval Time', unit: 'days' },
            secondaryStat: { value: getRandomInt(10, 25), label: 'Approvals in 24h' },
            trend: Math.random() > 0.5 ? 'faster' : 'stable',
            recentReports: [
                { value: getRandomInt(40, 50), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(0, 3)), positive: true },
                { value: getRandomInt(55, 65), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(3, 8)), positive: true },
                { value: getRandomInt(70, 90), label: 'RFE received', timestamp: getRecentTimestamp(getRandomInt(12, 24)), positive: false },
                { value: getRandomInt(50, 60), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(24, 48)), positive: true },
            ],
            lastUpdated: new Date().toISOString(),
        },
        'opt-clock': {
            mainStat: { value: getRandomInt(25, 45), label: 'Avg. Time to Find Job', unit: 'days' },
            secondaryStat: { value: getRandomInt(20, 35), label: 'Found jobs this week' },
            trend: 'faster',
            recentReports: [
                { value: getRandomInt(10, 20), label: 'days to employment', timestamp: getRecentTimestamp(getRandomInt(1, 5)), positive: true },
                { value: getRandomInt(40, 60), label: 'days to employment', timestamp: getRecentTimestamp(getRandomInt(6, 12)), positive: true },
                { value: getRandomInt(20, 30), label: 'days to employment', timestamp: getRecentTimestamp(getRandomInt(24, 30)), positive: true },
                { value: getRandomInt(50, 70), label: 'days (still searching)', timestamp: getRecentTimestamp(getRandomInt(24, 48)), positive: false },
            ],
            lastUpdated: new Date().toISOString(),
        },
        'stem-apply': {
            mainStat: { value: getRandomInt(90, 110), label: 'Average Approval Time', unit: 'days' },
            secondaryStat: { value: getRandomInt(8, 18), label: 'Approvals in 24h' },
            trend: 'stable',
            recentReports: [
                { value: getRandomInt(70, 80), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(2, 6)), positive: true },
                { value: getRandomInt(85, 95), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(8, 12)), positive: true },
                { value: getRandomInt(95, 120), label: 'RFE received', timestamp: getRecentTimestamp(getRandomInt(24, 36)), positive: false },
                { value: getRandomInt(65, 75), label: 'days to approval', timestamp: getRecentTimestamp(getRandomInt(48, 72)), positive: true },
            ],
            lastUpdated: new Date().toISOString(),
        },
        'stem-clock': {
            mainStat: { value: getRandomInt(10, 25), label: 'Avg. Document Upload', unit: 'days' },
            secondaryStat: { value: getRandomInt(30, 60), label: 'Uploads this week' },
            trend: 'faster',
            recentReports: [
                { value: getRandomInt(5, 10), label: 'days to upload I-983', timestamp: getRecentTimestamp(getRandomInt(0, 2)), positive: true },
                { value: getRandomInt(12, 18), label: 'days to upload docs', timestamp: getRecentTimestamp(getRandomInt(4, 10)), positive: true },
                { value: getRandomInt(15, 25), label: 'days to upload docs', timestamp: getRecentTimestamp(getRandomInt(24, 30)), positive: true },
                { value: getRandomInt(8, 15), label: 'days to upload I-983', timestamp: getRecentTimestamp(getRandomInt(24, 48)), positive: true },
            ],
            lastUpdated: new Date().toISOString(),
        },
    };

    return NextResponse.json(data);
}
