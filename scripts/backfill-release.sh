#!/usr/bin/env bash
# =============================================================================
# Backfill Release — process existing git history and create releases
# =============================================================================
# Groups commits by day and creates one release per day. For each day,
# determines the highest bump type (major > minor > patch) and lists all
# changes accumulated.
#
# Rules:
#   BREAKING CHANGE (in body/footer) → major bump (day-level)
#   feat(...)                         → minor bump (day-level)
#   fix(...) / refactor(...)          → patch bump (day-level)
#   other                             → skipped
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
TMPDIR="${TMPDIR:-/tmp}/backfill-release-$$"

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
echo "  Backfill Release — daily grouping, full history"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup on exit
cleanup() {
  rm -rf "$TMPDIR"
}
trap cleanup EXIT
mkdir -p "$TMPDIR"

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

# --- Helper: bump priority -------------------------------------------------
bump_priority() {
  case "$1" in
    major) echo 3 ;;
    minor) echo 2 ;;
    patch) echo 1 ;;
    *)     echo 0 ;;
  esac
}

# --- Helper: max of two bump types -----------------------------------------
max_bump() {
  local p1 p2
  p1="$(bump_priority "$1")"
  p2="$(bump_priority "$2")"
  if (( p1 >= p2 )); then
    echo "$1"
  else
    echo "$2"
  fi
}

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

SKIP_COMMIT="0784e6a"

# =============================================================================
# PHASE 1: Collect all commits, write per-day bullet files
# =============================================================================
# Structure:
#   $TMPDIR/dates           — sorted list of unique dates (YYYY-MM-DD)
#   $TMPDIR/by-date/<date>/bump       — max bump type for the day
#   $TMPDIR/by-date/<date>/sha        — first commit sha for the day
#   $TMPDIR/by-date/<date>/breaking   — bullet lines
#   $TMPDIR/by-date/<date>/features   — bullet lines
#   $TMPDIR/by-date/<date>/fixes      — bullet lines
#   $TMPDIR/by-date/<date>/refactors  — bullet lines

while IFS=$'\t' read -r sha epoch msg body; do
  # Skip the release scripts commit
  if echo "$sha" | grep -q "^${SKIP_COMMIT}"; then
    echo "  (skipping self: ${sha:0:7} — $msg)"
    continue
  fi

  # Determine date string YYYY-MM-DD
  date_fmt="$(date -r "$epoch" '+%Y-%m-%d' 2>/dev/null || date -j -f "%s" "$epoch" '+%Y-%m-%d' 2>/dev/null || echo "$(date '+%Y-%m-%d')")"

  # Determine bump type and category
  bump_type="none"
  is_feat=false
  is_fix=false
  is_refactor=false
  is_breaking=false

  # Also skip release commits
  if echo "$msg" | grep -qE "^chore\(release\):"; then
    echo "  ⏭  ${sha:0:7}  release commit: $msg"
    continue
  fi

  if printf "%s\n%s" "$msg" "$body" | grep -qi "BREAKING CHANGE"; then
    is_breaking=true
    bump_type="major"
  fi

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

  # Extract scope and description
  scope=""
  sc_regex='^[a-zA-Z_]+\(([^)]+)\)'
  if [[ "$msg" =~ $sc_regex ]]; then
    scope="${BASH_REMATCH[1]}"
  fi

  desc="$(echo "$msg" | sed -E 's/^[a-zA-Z_]+(\([^)]*\))?!?:[[:space:]]*//')"

  # Build bullet line
  local bullet=""
  if $is_breaking; then
    bc_line="$(printf "%s\n%s" "$msg" "$body" | grep -i "BREAKING CHANGE" | head -1 | sed 's/^BREAKING CHANGE:[[:space:]]*//I')"
    if [[ -n "$scope" ]]; then
      bullet="- **${scope}**: ${bc_line:-$desc}"
    else
      bullet="- ${bc_line:-$desc}"
    fi
  else
    if [[ -n "$scope" ]]; then
      bullet="- **${scope}**: ${desc}"
    else
      bullet="- ${desc}"
    fi
  fi

  echo "  ✅ ${sha:0:7}  ($date_fmt)  $bump_type  $msg"

  # Ensure date directory exists
  mkdir -p "$TMPDIR/by-date/$date_fmt"

  # Track first SHA for this date (first commit seen wins since processed oldest-first)
  if [[ ! -f "$TMPDIR/by-date/$date_fmt/sha" ]]; then
    echo "$sha" > "$TMPDIR/by-date/$date_fmt/sha"
  fi

  # Register this date in the master date list (only first time)
  if [[ ! -f "$TMPDIR/by-date/$date_fmt/bump" ]]; then
    echo "$bump_type" > "$TMPDIR/by-date/$date_fmt/bump"
    echo "$date_fmt" >> "$TMPDIR/dates"
  else
    # Update max bump for the day
    local current_max
    current_max="$(cat "$TMPDIR/by-date/$date_fmt/bump")"
    max_bump "$current_max" "$bump_type" > "$TMPDIR/by-date/$date_fmt/bump"
  fi

  # Append bullet to the right section file
  if $is_breaking; then
    echo "$bullet" >> "$TMPDIR/by-date/$date_fmt/breaking"
  elif $is_feat; then
    echo "$bullet" >> "$TMPDIR/by-date/$date_fmt/features"
  elif $is_fix; then
    echo "$bullet" >> "$TMPDIR/by-date/$date_fmt/fixes"
  elif $is_refactor; then
    echo "$bullet" >> "$TMPDIR/by-date/$date_fmt/refactors"
  fi

done < <(git -C "$REPO_ROOT" log --reverse --format="%H%x09%ct%x09%s%x09%b")

if [[ ! -f "$TMPDIR/dates" ]]; then
  echo ""
  echo "❌ No relevant commits found in history."
  exit 0
fi

# =============================================================================
# PHASE 2: Build CHANGELOG entries and tags (one per day)
# =============================================================================
CURRENT_VERSION="$START_VERSION"
CHANGELOG_ENTRIES_FILE="$TMPDIR/changelog-entries"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Building releases (one per day)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Track releases for tagging
RELEASES_FILE="$TMPDIR/releases"
: > "$RELEASES_FILE"

while read -r date_fmt; do
  local_bump="$(cat "$TMPDIR/by-date/$date_fmt/bump")"
  local_sha="$(cat "$TMPDIR/by-date/$date_fmt/sha")"

  NEW_VERSION="$(semver_bump "$CURRENT_VERSION" "$local_bump")"

  echo "  📅 $date_fmt: v${CURRENT_VERSION} → v${NEW_VERSION} ($local_bump)"

  echo "${NEW_VERSION}|${local_sha}|${date_fmt}|${local_bump}" >> "$RELEASES_FILE"

  # Build CHANGELOG entry for this day
  echo "## [${NEW_VERSION}] - ${date_fmt}" >> "$CHANGELOG_ENTRIES_FILE"
  echo "" >> "$CHANGELOG_ENTRIES_FILE"

  # Breaking changes
  if [[ -f "$TMPDIR/by-date/$date_fmt/breaking" ]]; then
    echo "### BREAKING CHANGES" >> "$CHANGELOG_ENTRIES_FILE"
    cat "$TMPDIR/by-date/$date_fmt/breaking" >> "$CHANGELOG_ENTRIES_FILE"
    echo "" >> "$CHANGELOG_ENTRIES_FILE"
  fi

  # Features
  if [[ -f "$TMPDIR/by-date/$date_fmt/features" ]]; then
    echo "### Features" >> "$CHANGELOG_ENTRIES_FILE"
    cat "$TMPDIR/by-date/$date_fmt/features" >> "$CHANGELOG_ENTRIES_FILE"
    echo "" >> "$CHANGELOG_ENTRIES_FILE"
  fi

  # Bug Fixes
  if [[ -f "$TMPDIR/by-date/$date_fmt/fixes" ]]; then
    echo "### Bug Fixes" >> "$CHANGELOG_ENTRIES_FILE"
    cat "$TMPDIR/by-date/$date_fmt/fixes" >> "$CHANGELOG_ENTRIES_FILE"
    echo "" >> "$CHANGELOG_ENTRIES_FILE"
  fi

  # Refactors
  if [[ -f "$TMPDIR/by-date/$date_fmt/refactors" ]]; then
    echo "### Refactors" >> "$CHANGELOG_ENTRIES_FILE"
    cat "$TMPDIR/by-date/$date_fmt/refactors" >> "$CHANGELOG_ENTRIES_FILE"
    echo "" >> "$CHANGELOG_ENTRIES_FILE"
  fi

  CURRENT_VERSION="$NEW_VERSION"
done < "$TMPDIR/dates"

FINAL_VERSION="$CURRENT_VERSION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Writing CHANGELOG.md, creating tags..."
echo "  Final version: $FINAL_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Write CHANGELOG.md ---
HEADER="# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
printf "%b" "$HEADER" > "$CHANGELOG"
cat "$CHANGELOG_ENTRIES_FILE" >> "$CHANGELOG"
echo "  ✓ CHANGELOG.md created"

# --- Bump package.json files ---
for pj in "${PACKAGE_JSONS[@]}"; do
  if [[ -f "$pj" ]]; then
    jq --arg v "$FINAL_VERSION" '.version = $v' "$pj" > "${pj}.tmp" && mv "${pj}.tmp" "$pj"
    echo "  ✓ $(basename "$(dirname "$pj")")/package.json → $FINAL_VERSION"
  fi
done

# --- Create git tags on the first commit of each day ---
while IFS='|' read -r ver sha dt bmp; do
  if git -C "$REPO_ROOT" rev-parse "${TAG_PREFIX}${ver}" >/dev/null 2>&1; then
    echo "  ⏭  tag ${TAG_PREFIX}${ver} already exists, deleting and recreating"
    git -C "$REPO_ROOT" tag -d "${TAG_PREFIX}${ver}" 2>/dev/null || true
  fi
  git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${ver}" "$sha" \
    -m "Release ${ver}" \
    -m "Daily release: ${dt}" >/dev/null 2>&1
  echo "  ✓ tag ${TAG_PREFIX}${ver} → ${sha:0:7} ($dt)"
done < "$RELEASES_FILE"

# --- Create final release commit ---
git -C "$REPO_ROOT" add "${PACKAGE_JSONS[@]}" "$CHANGELOG"

if git -C "$REPO_ROOT" diff --cached --quiet; then
  echo "  ⏭  nothing to commit (versions already up to date)"
else
  RELEASE_COUNT="$(wc -l < "$RELEASES_FILE" | tr -d ' ')"
  git -C "$REPO_ROOT" commit --no-verify \
    -m "chore(release): bump version to ${FINAL_VERSION}" \
    -m "Backfill: ${RELEASE_COUNT} daily releases processed from history" \
    --quiet
  echo "  ✓ release commit created"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Backfill complete!"
echo "  Final version:    $FINAL_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run the following to push:"
echo "  git push --follow-tags origin main"
