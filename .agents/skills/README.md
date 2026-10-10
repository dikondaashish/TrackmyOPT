# Shared agent skills (canonical — this folder is what GitHub tracks)

Tool-specific copies (`.claude/skills`, `.cursor/skills`, `.github/skills`) are
**local mirrors only** and are gitignored. After clone or skill edits:

```bash
./scripts/sync-agent-skills.sh
# also refresh personal homes:
SYNC_HOME=1 ./scripts/sync-agent-skills.sh
```

Edit skills here under `.agents/skills`, then sync.

## Lock file coverage

`skills-lock.json` (repo root) pins only skills installed from an upstream
source (`npx skills add ...`). The skills below are maintained in this
repository and have no upstream source or hash, so they are intentionally not in
the lock file; edit them here directly:

- `apple-design`
- `autonomous-agents`
- `codebase-standards-auditor`
- `company-logo-fetcher`
- `design-taste-frontend`
- `emil-design-eng`
- `find-skills`
- `full-codebase-audit-and-micro-completion`
- `impeccable`
- `legal-advisor`
- `new-blog-post`
- `ponytail`
- `ponytail-audit`
- `ponytail-debt`
- `ponytail-gain`
- `ponytail-help`
- `ponytail-review`
- `product-management`
- `react-doctor`
- `react-patterns`
- `security-audit`
- `senior-engineering`
- `tdd-workflow`
- `ui-ux-pro-max`
- `vercel-composition-patterns`
- `vercel-react-view-transitions`
- `web-design-guidelines`

`hatch-pet` is a personal skill kept locally and is gitignored.
