#!/usr/bin/env bash
# =============================================================================
# Backfill Release — process existing git history and create releases
# =============================================================================
# For each commit in history, identifies feat/fix/BREAKING CHANGE commits
# and creates release tags + CHANGELOG entries as if the hook had been
# active from day one.
#
# Unlike the post-commit hook, this does NOT create intermediate release
# commits (to avoid git conflicts with package.json changes in history).
# Instead it tags the original commits directly and creates one final
# release commit.
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_JSONS=(
  "$REPO_ROOT/backend/package.json"
  "$REPO_ROOT/frontend/package.json"
  "$REPO_ROOT/admin/package.json"
)
CHANGELOG="$REPO_ROOT/CHANGELOG.md"
TAG_PREFIX="v"

# Ensure we're on main/master
BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
  echo "❌ Must be on main/master. Currently on: $BRANCH"
  exit 1
fi

# Ensure working directory is clean
if ! git -C "$REPO_ROOT" diff --quiet; then
  echo "❌ Working directory is not clean. Commit or stash changes first."
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Backfill Release — processing full history"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Read starting version from the first commit's package.json
START_VERSION="0.0.0"
ROOT_TREE="$(git -C "$REPO_ROOT" rev-list --max-parents=0 HEAD)"
for pj_rel in "backend/package.json" "frontend/package.json" "admin/package.json"; do
  ver="$(git -C "$REPO_ROOT" show "${ROOT_TREE}:${pj_rel}" 2>/dev/null | jq -r '.version // empty' 2>/dev/null || true)"
  if [[ -n "$ver" ]]; then
    START_VERSION="$ver"
    break
  fi
done

echo "  Starting version: $START_VERSION"
echo ""

# Process all commits oldest-first, except the last one (our own release scripts commit)
CURRENT_VERSION="$START_VERSION"
ALL_COMMITS=""
declare -a RELEASES=()          # array of "version|sha|date|msg|scope|description|type"
declare -a CHANGELOG_ENTRIES=() # array of strings (multi-line)

# --- Helper: semver bump ---------------------------------------------------
semver_bump() {
  local v="$1" t="$2"
  local M m p
  IFS='.' read -r M m p <<< "$v"
  case "$t" in
    major) echo "$((M+1)).0.0" ;;
    minor) echo "$M.$((m+1)).0" ;;
    patch) echo "$M.$m.$((p+1))" ;;
  esac
}

SKIP_COMMIT="0784e6a"  # the "feat: add automated release scripts and git hooks" commit

while IFS=$'\t' read -r sha date msg body; do
  # Skip the release scripts commit
  if echo "$sha" | grep -q "^${SKIP_COMMIT}"; then
    echo "  (skipping self: ${sha:0:7} — $msg)"
    continue
  fi

  bump_type="none"
  is_feat=false
  is_fix=false
  is_refactor=false
  is_breaking=false

  # Check BREAKING CHANGE
  if printf "%s\n%s" "$msg" "$body" | grep -qi "BREAKING CHANGE"; then
    is_breaking=true
    bump_type="major"
  fi

  # Check conventional commit type
  if echo "$msg" | grep -qE "^feat(\(.*\))?!?:"; then
    is_feat=true
    [[ "$bump_type" == "none" ]] && bump_type="minor"
  elif echo "$msg" | grep -qE "^fix(\(.*\))?!?:"; then
    is_fix=true
    [[ "$bump_type" == "none" ]] && bump_type="patch"
  elif echo "$msg" | grep -qE "^refactor(\(.*\))?!?:"; then
    is_refactor=true
    [[ "$bump_type" == "none" ]] && bump_type="patch"
  fi

  if [[ "$bump_type" == "none" ]]; then
    echo "  ⏭  ${sha:0:7}  no release: $msg"
    continue
  fi

  NEW_VERSION="$(semver_bump "$CURRENT_VERSION" "$bump_type")"

  scope=""
  sc_regex='^[a-zA-Z_]+\(([^)]+)\)'
  if [[ "$msg" =~ $sc_regex ]]; then
    scope="${BASH_REMATCH[1]}"
  fi

  desc="$(echo "$msg" | sed -E 's/^[a-zA-Z_]+(\([^)]*\))?!?:[[:space:]]*//')"
  date_fmt="$(date -r "$date" '+%Y-%m-%d' 2>/dev/null || date -j -f "%s" "$date" '+%Y-%m-%d' 2>/dev/null || echo "$(date '+%Y-%m-%d')")"

  echo "  ✅ ${sha:0:7}  v${CURRENT_VERSION} → v${NEW_VERSION}  ($bump_type)  $msg"

  RELEASES+=("${NEW_VERSION}|${sha}|${date_fmt}|${msg}|${scope}|${desc}|${bump_type}")

  # Build CHANGELOG entry
  entry="## [${NEW_VERSION}] - ${date_fmt}\n\n"
  if $is_breaking; then
    entry+="### BREAKING CHANGES\n"
    bc_line="$(printf "%s\n%s" "$msg" "$body" | grep -i "BREAKING CHANGE" | head -1 | sed 's/^BREAKING CHANGE:[[:space:]]*//I')"
    if [[ -n "$scope" ]]; then
      entry+="- **${scope}**: ${bc_line:-$desc}\n"
    else
      entry+="- ${bc_line:-$desc}\n"
    fi
    entry+="\n"
  fi
  if $is_feat; then
    entry+="### Features\n"
    if [[ -n "$scope" ]]; then
      entry+="- **${scope}**: ${desc}\n"
    else
      entry+="- ${desc}\n"
    fi
    entry+="\n"
  fi
  if $is_fix; then
    entry+="### Bug Fixes\n"
    if [[ -n "$scope" ]]; then
      entry+="- **${scope}**: ${desc}\n"
    else
      entry+="- ${desc}\n"
    fi
    entry+="\n"
  fi
  if $is_refactor; then
    entry+="### Refactors\n"
    if [[ -n "$scope" ]]; then
      entry+="- **${scope}**: ${desc}\n"
    else
      entry+="- ${desc}\n"
    fi
    entry+="\n"
  fi

  CHANGELOG_ENTRIES+=("$entry")
  CURRENT_VERSION="$NEW_VERSION"
done < <(git -C "$REPO_ROOT" log --reverse --format="%H%x09%ct%x09%s%x09%b")

if [[ ${#RELEASES[@]} -eq 0 ]]; then
  echo ""
  echo "❌ No relevant commits found in history."
  exit 0
fi

FINAL_VERSION="$CURRENT_VERSION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Creating CHANGELOG.md, tags, and bump..."
echo "  Final version: $FINAL_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Create CHANGELOG.md ---
HEADER="# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
CHANGELOG_CONTENT="$HEADER"
for entry in "${CHANGELOG_ENTRIES[@]}"; do
  CHANGELOG_CONTENT+="$entry"
done
printf "%b" "$CHANGELOG_CONTENT" > "$CHANGELOG"
echo "  ✓ CHANGELOG.md created (${#RELEASES[@]} entries)"

# --- Bump package.json files ---
for pj in "${PACKAGE_JSONS[@]}"; do
  if [[ -f "$pj" ]]; then
    jq --arg v "$FINAL_VERSION" '.version = $v' "$pj" > "${pj}.tmp" && mv "${pj}.tmp" "$pj"
    echo "  ✓ $(basename "$(dirname "$pj")")/package.json → $FINAL_VERSION"
  fi
done

# --- Create git tags on original commits ---
for release in "${RELEASES[@]}"; do
  IFS='|' read -r ver sha dt msg scp dsc typ <<< "$release"
  if git -C "$REPO_ROOT" rev-parse "${TAG_PREFIX}${ver}" >/dev/null 2>&1; then
    echo "  ⏭  tag ${TAG_PREFIX}${ver} already exists"
  else
    git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${ver}" "$sha" -m "Release ${ver}" -m "Based on: ${msg}" >/dev/null 2>&1
    echo "  ✓ tag ${TAG_PREFIX}${ver} → ${sha:0:7}"
  fi
done

# --- Create final release commit ---
git -C "$REPO_ROOT" add "${PACKAGE_JSONS[@]}" "$CHANGELOG"

if git -C "$REPO_ROOT" diff --cached --quiet; then
  echo "  ⏭  nothing to commit (versions already up to date)"
else
  # Check if last commit is already a release commit for this version
  LAST_MSG="$(git -C "$REPO_ROOT" log -1 --pretty=%s 2>/dev/null || true)"
  if echo "$LAST_MSG" | grep -qE "^chore\(release\): bump version to ${FINAL_VERSION}$"; then
    echo "  ⏭  release commit already at HEAD"
  else
    git -C "$REPO_ROOT" commit --no-verify \
      -m "chore(release): bump version to ${FINAL_VERSION}" \
      -m "Backfill: ${#RELEASES[@]} releases processed from history" \
      --quiet
    echo "  ✓ release commit created"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Backfill complete!"
echo "  Commits processed: ${#RELEASES[@]}"
echo "  Final version:     $FINAL_VERSION"
echo "  CHANGELOG:         ${#CHANGELOG_ENTRIES[@]} entries"
echo "  Tags created:      ${#RELEASES[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run the following to push:"
echo "  git push --follow-tags origin main"
