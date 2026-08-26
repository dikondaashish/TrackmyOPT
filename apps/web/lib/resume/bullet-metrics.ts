const METRIC_PATTERNS = [
    /(?:[$€£]\s*\d|\d[\d,.]*\s*%)/i,
    /\b\d+(?:\.\d+)?\s*(?:\+|x\b|k\b|m\b|b\b)/i,
    /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|seconds?|minutes?|hours?|days?|weeks?|months?)\b/i,
    /\b\d+(?:\.\d+)?\s*(?:users?|customers?|servers?|racks?|tickets?|incidents?|requests?|devices?|systems?|sites?|locations?|engineers?|teams?|applications?|machines?|nodes?|endpoints?|deployments?|projects?|cases?|records?|files?|workloads?|orders?|shipments?)\b/i,
    /\b\d+(?:\.\d+)?\s*(?:gb|tb|pb|kw|mw)\b/i,
    /\b\d+(?:\.\d+)?\s*[/]\s*\d+(?:\.\d+)?\b/i,
    /\b\d+(?:\.\d+)?\s*(?:-|–|to)\s*\d+(?:\.\d+)?\b/i,
];

function normalizeMetricText(text: string): string {
    return text
        .replace(/\\([%$&#_])/g, "$1")
        .replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g, "$1")
        .replace(/[{}~]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Extract item bodies, including bullets that wrap across multiple LaTeX lines. */
export function extractLatexBulletBodies(latex: string): string[] {
    const bullets: string[] = [];
    let current: string[] | null = null;

    const flush = () => {
        if (!current) return;
        const bullet = current.join(" ").replace(/\s+/g, " ").trim();
        if (bullet) bullets.push(bullet);
        current = null;
    };

    for (const line of latex.split(/\r?\n/)) {
        const item = line.match(/^\s*\\item(?:\s*\[[^\]]*\])?\s*(.*)$/);
        if (item) {
            flush();
            current = [item[1] ?? ""];
            continue;
        }

        if (!current) continue;
        if (/^\s*\\end\{(?:itemize|enumerate|rBullets)\}/.test(line)) {
            flush();
            continue;
        }
        if (!/^\s*%/.test(line)) current.push(line.trim());
    }
    flush();

    return bullets;
}

export function bulletHasMeasurableMetric(bullet: string): boolean {
    const normalized = normalizeMetricText(bullet);
    return METRIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

export interface BulletMetricsSummary {
    total: number;
    withMetrics: number;
    ratio: number;
}

export function analyzeLatexBulletMetrics(latex: string): BulletMetricsSummary {
    const bullets = extractLatexBulletBodies(latex);
    const withMetrics = bullets.filter(bulletHasMeasurableMetric).length;
    return {
        total: bullets.length,
        withMetrics,
        ratio: bullets.length > 0 ? withMetrics / bullets.length : 0,
    };
}
