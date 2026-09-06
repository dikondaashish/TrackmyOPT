#!/usr/bin/env bash
# Mirror canonical skills (.agents/skills) into tool-specific local folders.
# Only .agents/skills is committed to GitHub. Mirrors stay local (.gitignore).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/.agents/skills"

for dest in \
  "$ROOT/.claude/skills" \
  "$ROOT/.cursor/skills" \
  "$ROOT/.github/skills"
do
  mkdir -p "$dest"
  rsync -a --delete \
    --exclude 'README.md' \
    --exclude 'hatch-pet/' \
    "$SRC/" "$dest/"
  echo "synced → $dest"
done

if [[ "${SYNC_HOME:-}" == "1" ]]; then
  for dest in \
    "$HOME/.cursor/skills" \
    "$HOME/.codex/skills" \
    "$HOME/.agents/skills"
  do
    mkdir -p "$dest"
    rsync -a --exclude 'hatch-pet/' "$SRC/" "$dest/"
    echo "synced → $dest"
  done
fi

echo "done. canonical skills: $(find "$SRC" -name SKILL.md ! -path '*/hatch-pet/*' | wc -l | tr -d ' ')"
