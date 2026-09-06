# Shared agent skills (canonical — this folder is what GitHub tracks)

Tool-specific copies (`.claude/skills`, `.cursor/skills`, `.github/skills`) are
**local mirrors only** and are gitignored. After clone or skill edits:

```bash
./scripts/sync-agent-skills.sh
# also refresh personal homes:
SYNC_HOME=1 ./scripts/sync-agent-skills.sh
```

Edit skills here under `.agents/skills`, then sync.
