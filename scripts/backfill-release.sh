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

SKIP_COMMIT="0784e6a"  # the "feat: add automated release scripts and git hooks" commit

# =============================================================================
# PHASE 1: Collect all relevant commits grouped by date
# =============================================================================
# For each day, we accumulate all changes into arrays.
# We use an associative array keyed by date, storing:
#   - max_bump type for the day
#   - list of changes grouped by section (breaking, feat, fix, refactor)

declare -A DAY_BUMPS=()           # date → bump_type
declare -A DAY_BREAKING=()        # date → bullet lines (newline separated)
declare -A DAY_FEATURES=()        # date → bullet lines
declare -A DAY_FIXES=()           # date → bullet lines
declare -A DAY_REFACTORS=()       # date → bullet lines
declare -a SORTED_DATES=()        # sorted list of unique dates
declare -A DAY_FIRST_SHA=()       # date → first commit sha for tagging

while IFS=$'\t' read -r sha date msg body; do
  # Skip the release scripts commit
  if echo "$sha" | grep -q "^${SKIP_COMMIT}"; then
    echo "  (skipping self: ${sha:0:7} — $msg)"
    continue
  fi

  # Determine date string YYYY-MM-DD
  date_fmt="$(date -r "$date" '+%Y-%m-%d' 2>/dev/null || date -j -f "%s" "$date" '+%Y-%m-%d' 2>/dev/null || echo "$(date '+%Y-%m-%d')")"

  # Determine bump type and category
  bump_type="none"
  is_feat=false
  is_fix=false
  is_refactor=false
  is_breaking=false

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

  # Track first SHA for this date
  if [[ -z "${DAY_FIRST_SHA[$date_fmt]:-}" ]]; then
    DAY_FIRST_SHA[$date_fmt]="$sha"
  fi

  # Initialize day if new
  if [[ -z "${DAY_BUMPS[$date_fmt]:-}" ]]; then
    DAY_BUMPS[$date_fmt]="$bump_type"
    SORTED_DATES+=("$date_fmt")
  else
    # Update max bump for the day
    local current_max="${DAY_BUMPS[$date_fmt]}"
    DAY_BUMPS[$date_fmt]="$(max_bump "$current_max" "$bump_type")"
  fi

  # Append bullet to the right section
  if $is_breaking; then
    DAY_BREAKING[$date_fmt]="${DAY_BREAKING[$date_fmt]:-}${bullet}\n"
  elif $is_feat; then
    DAY_FEATURES[$date_fmt]="${DAY_FEATURES[$date_fmt]:-}${bullet}\n"
  elif $is_fix; then
    DAY_FIXES[$date_fmt]="${DAY_FIXES[$date_fmt]:-}${bullet}\n"
  elif $is_refactor; then
    DAY_REFACTORS[$date_fmt]="${DAY_REFACTORS[$date_fmt]:-}${bullet}\n"
  fi

done < <(git -C "$REPO_ROOT" log --reverse --format="%H%x09%ct%x09%s%x09%b")

if [[ ${#SORTED_DATES[@]} -eq 0 ]]; then
  echo ""
  echo "❌ No relevant commits found in history."
  exit 0
fi

# =============================================================================
# PHASE 2: Build CHANGELOG entries and tags (one per day)
# =============================================================================
CURRENT_VERSION="$START_VERSION"
declare -a CHANGELOG_ENTRIES=()
declare -a RELEASES=()  # "version|sha|date|bump_type"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Building releases (one per day)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for date_fmt in "${SORTED_DATES[@]}"; do
  local_bump="${DAY_BUMPS[$date_fmt]}"
  local_sha="${DAY_FIRST_SHA[$date_fmt]}"
  local_breaking="${DAY_BREAKING[$date_fmt]:-}"
  local_features="${DAY_FEATURES[$date_fmt]:-}"
  local_fixes="${DAY_FIXES[$date_fmt]:-}"
  local_refactors="${DAY_REFACTORS[$date_fmt]:-}"

  NEW_VERSION="$(semver_bump "$CURRENT_VERSION" "$local_bump")"

  echo "  📅 $date_fmt: v${CURRENT_VERSION} → v${NEW_VERSION} ($local_bump)"

  RELEASES+=("${NEW_VERSION}|${local_sha}|${date_fmt}|${local_bump}")

  # Build CHANGELOG entry for this day
  entry="## [${NEW_VERSION}] - ${date_fmt}\n\n"

  if [[ -n "$local_breaking" ]]; then
    entry+="### BREAKING CHANGES\n"
    entry+="${local_breaking}"
    entry+="\n"
  fi

  if [[ -n "$local_features" ]]; then
    entry+="### Features\n"
    entry+="${local_features}"
    entry+="\n"
  fi

  if [[ -n "$local_fixes" ]]; then
    entry+="### Bug Fixes\n"
    entry+="${local_fixes}"
    entry+="\n"
  fi

  if [[ -n "$local_refactors" ]]; then
    entry+="### Refactors\n"
    entry+="${local_refactors}"
    entry+="\n"
  fi

  CHANGELOG_ENTRIES+=("$entry")
  CURRENT_VERSION="$NEW_VERSION"
done

FINAL_VERSION="$CURRENT_VERSION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Writing CHANGELOG.md, creating tags..."
echo "  Total days: ${#SORTED_DATES[@]}"
echo "  Final version: $FINAL_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Write CHANGELOG.md ---
HEADER="# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
CHANGELOG_CONTENT="$HEADER"
for entry in "${CHANGELOG_ENTRIES[@]}"; do
  CHANGELOG_CONTENT+="$entry"
done
printf "%b" "$CHANGELOG_CONTENT" > "$CHANGELOG"
echo "  ✓ CHANGELOG.md created (${#CHANGELOG_ENTRIES[@]} day-entries)"

# --- Bump package.json files ---
for pj in "${PACKAGE_JSONS[@]}"; do
  if [[ -f "$pj" ]]; then
    jq --arg v "$FINAL_VERSION" '.version = $v' "$pj" > "${pj}.tmp" && mv "${pj}.tmp" "$pj"
    echo "  ✓ $(basename "$(dirname "$pj")")/package.json → $FINAL_VERSION"
  fi
done

# --- Create git tags on the first commit of each day ---
for release in "${RELEASES[@]}"; do
  IFS='|' read -r ver sha dt bmp <<< "$release"
  if git -C "$REPO_ROOT" rev-parse "${TAG_PREFIX}${ver}" >/dev/null 2>&1; then
    echo "  ⏭  tag ${TAG_PREFIX}${ver} already exists"
  else
    git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${ver}" "$sha" \
      -m "Release ${ver}" \
      -m "Daily release: ${dt}" >/dev/null 2>&1
    echo "  ✓ tag ${TAG_PREFIX}${ver} → ${sha:0:7} ($dt)"
  fi
done

# --- Create final release commit ---
git -C "$REPO_ROOT" add "${PACKAGE_JSONS[@]}" "$CHANGELOG"

if git -C "$REPO_ROOT" diff --cached --quiet; then
  echo "  ⏭  nothing to commit (versions already up to date)"
else
  LAST_MSG="$(git -C "$REPO_ROOT" log -1 --pretty=%s 2>/dev/null || true)"
  if echo "$LAST_MSG" | grep -qE "^chore\(release\): bump version to ${FINAL_VERSION}$"; then
    echo "  ⏭  release commit already at HEAD"
  else
    git -C "$REPO_ROOT" commit --no-verify \
      -m "chore(release): bump version to ${FINAL_VERSION}" \
      -m "Backfill: ${#SORTED_DATES[@]} daily releases processed from history" \
      --quiet
    echo "  ✓ release commit created"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Backfill complete!"
echo "  Days processed:   ${#SORTED_DATES[@]}"
echo "  Final version:    $FINAL_VERSION"
echo "  CHANGELOG:        ${#CHANGELOG_ENTRIES[@]} daily entries"
echo "  Tags created:     ${#RELEASES[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run the following to push:"
echo "  git push --follow-tags origin main"
