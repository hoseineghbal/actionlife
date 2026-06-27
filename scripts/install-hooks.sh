#!/usr/bin/env bash
# =============================================================================
# Install Git Hooks
# =============================================================================
# Configures git to use scripts/githooks/ as the hooks directory.
# This way hooks are tracked in git and persist across clones.
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_DIR="scripts/githooks"

if [[ ! -f "$REPO_ROOT/$HOOK_DIR/post-commit" ]]; then
  echo "❌ Hook not found at $HOOK_DIR/post-commit"
  echo "   Make sure the hook file exists."
  exit 1
fi

git -C "$REPO_ROOT" config core.hooksPath "$HOOK_DIR"

echo "✅ Git hooks configured: core.hooksPath = $HOOK_DIR"
echo ""
echo "Active hooks:"
ls -la "$REPO_ROOT/$HOOK_DIR/"
echo ""
echo "The release hook will now run automatically after every commit on main/master."
echo "To test it manually:  bash scripts/release.sh"
echo ""
echo "To disable automatic releases, run:"
echo "  git config --unset core.hooksPath"
