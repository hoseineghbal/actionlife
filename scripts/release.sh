#!/usr/bin/env bash
# =============================================================================
# Automated Release Script
# =============================================================================
# Reads the latest commit message, bumps version based on conventional
# commits rules, updates CHANGELOG.md, and creates a git tag.
#
# Rules:
#   BREAKING CHANGE (in body/footer) → major bump
#   feat(...)                         → minor bump
#   fix(...)                          → patch bump
#   other                             → no release
# =============================================================================

set -euo pipefail

# --- Config ----------------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_JSONS=(
  "$REPO_ROOT/backend/package.json"
  "$REPO_ROOT/frontend/package.json"
  "$REPO_ROOT/admin/package.json"
)
CHANGELOG="$REPO_ROOT/CHANGELOG.md"
TAG_PREFIX="v"

# --- Helper: semver bump ---------------------------------------------------
semver_bump() {
  local version="$1"   # expects "X.Y.Z"
  local bump_type="$2" # major|minor|patch

  local major minor patch
  IFS='.' read -r major minor patch <<< "$version"

  case "$bump_type" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "$major.$((minor + 1)).0" ;;
    patch) echo "$major.$minor.$((patch + 1))" ;;
    *)     echo "$version" ;;
  esac
}

# --- Helper: get current version (use backend as source of truth) ----------
get_current_version() {
  # Use the first package.json that has a version field
  for pj in "${PACKAGE_JSONS[@]}"; do
    if [[ -f "$pj" ]]; then
      jq -r '.version // empty' "$pj" | head -1
      return
    fi
  done
  echo "0.0.0"
}

# --- Helper: update a package.json version ---------------------------------
update_package_json() {
  local file="$1"
  local new_version="$2"
  if [[ -f "$file" ]]; then
    # Use a temp file for jq atomic write
    jq --arg v "$new_version" '.version = $v' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    echo "    ✓ $file  →  $new_version"
  fi
}

# --- Helper: format date ---------------------------------------------------
get_date() {
  date '+%Y-%m-%d'
}

# --- Helper: extract scope from commit message (if any) --------------------
extract_scope() {
  local msg="$1"
  # matches "type(scope):" or "type(scope)!:"
  local scope_regex='^[a-zA-Z_]+\(([^)]+)\)'
  if [[ "$msg" =~ $scope_regex ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
}

# --- Helper: extract description (first line without prefix) ---------------
extract_description() {
  local msg="$1"
  # Remove optional scope notation like feat(scope): desc  →  desc
  # Also handles "!" for breaking changes: "feat(scope)!: desc"
  local cleaned
  cleaned="$(echo "$msg" | sed -E 's/^[a-zA-Z_]+(\([^)]*\))?!?:[[:space:]]*//')"
  echo "$cleaned"
}

# --- Main ------------------------------------------------------------------
main() {
  # 1. Determine branch — only release on main
  local branch
  branch="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" != "main" && "$branch" != "master" ]]; then
    echo "🔹 Not on main/master ($branch). Skipping release."
    exit 0
  fi

  # 2. Read the latest commit
  local last_commit_msg last_commit_body
  last_commit_msg="$(git -C "$REPO_ROOT" log -1 --pretty=%s)"
  last_commit_body="$(git -C "$REPO_ROOT" log -1 --pretty=%b)"

  # 3. Prevent recursive release (skip if this is already a release commit)
  if echo "$last_commit_msg" | grep -qE "^chore\(release\):"; then
    echo "🔹 Release commit detected. Skipping."
    exit 0
  fi

  # 4. Determine bump type
  local bump_type="none"
  local is_feat=false
  local is_fix=false
  local is_breaking=false

  # Check for BREAKING CHANGE in body or footer
  if printf "%s\n%s" "$last_commit_msg" "$last_commit_body" | grep -qi "BREAKING CHANGE"; then
    is_breaking=true
    bump_type="major"
  fi

  # Check commit type from subject
  if echo "$last_commit_msg" | grep -qE "^feat(\(.*\))?!?:"; then
    is_feat=true
    [[ "$bump_type" == "none" ]] && bump_type="minor"
  elif echo "$last_commit_msg" | grep -qE "^fix(\(.*\))?!?:"; then
    is_fix=true
    [[ "$bump_type" == "none" ]] && bump_type="patch"
  fi

  if [[ "$bump_type" == "none" ]]; then
    echo "🔹 No feat/fix/BREAKING CHANGE detected. Skipping release."
    exit 0
  fi

  # 5. Read current version & compute new version
  local current_version new_version
  current_version="$(get_current_version)"
  new_version="$(semver_bump "$current_version" "$bump_type")"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Release: $current_version → $new_version"
  echo "  Commit:  ${last_commit_msg:0:72}"
  echo "  Bump:    $bump_type"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 6. Update all package.json files
  for pj in "${PACKAGE_JSONS[@]}"; do
    update_package_json "$pj" "$new_version"
  done

  # 7. Parse commit details for CHANGELOG
  local scope description
  scope="$(extract_scope "$last_commit_msg")"
  description="$(extract_description "$last_commit_msg")"
  local date_today
  date_today="$(get_date)"

  # 8. Build CHANGELOG entry
  local changelog_entry=""
  changelog_entry+="## [${new_version}] - ${date_today}\n\n"

  # Breaking changes section
  if $is_breaking; then
    changelog_entry+="### BREAKING CHANGES\n"
    local bc_msg
    bc_msg="$(printf "%s\n%s" "$last_commit_msg" "$last_commit_body" | grep -i "BREAKING CHANGE" | head -1 | sed 's/^BREAKING CHANGE:[[:space:]]*//I')"
    if [[ -n "$scope" ]]; then
      changelog_entry+="- **${scope}**: ${bc_msg:-$description}\n"
    else
      changelog_entry+="- ${bc_msg:-$description}\n"
    fi
    changelog_entry+="\n"
  fi

  # Features section
  if $is_feat; then
    changelog_entry+="### Features\n"
    if [[ -n "$scope" ]]; then
      changelog_entry+="- **${scope}**: ${description}\n"
    else
      changelog_entry+="- ${description}\n"
    fi
    changelog_entry+="\n"
  fi

  # Bug Fixes section
  if $is_fix; then
    changelog_entry+="### Bug Fixes\n"
    if [[ -n "$scope" ]]; then
      changelog_entry+="- **${scope}**: ${description}\n"
    else
      changelog_entry+="- ${description}\n"
    fi
    changelog_entry+="\n"
  fi

  # 9. Write CHANGELOG.md
  local header="# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
  if [[ ! -f "$CHANGELOG" ]]; then
    printf "%b%s" "$header" "$changelog_entry" > "$CHANGELOG"
  else
    # Find the first version entry line (starts with "## ") and insert before it
    local insert_line
    insert_line="$(grep -n '^## ' "$CHANGELOG" | head -1 | cut -d: -f1)"
    if [[ -n "$insert_line" ]]; then
      head -n "$((insert_line - 1))" "$CHANGELOG" > "${CHANGELOG}.tmp"
      printf "%b" "$changelog_entry" >> "${CHANGELOG}.tmp"
      tail -n +"$insert_line" "$CHANGELOG" >> "${CHANGELOG}.tmp"
      mv "${CHANGELOG}.tmp" "$CHANGELOG"
    else
      # No existing version entries — append
      printf "%b" "$changelog_entry" >> "$CHANGELOG"
    fi
  fi
  echo "    ✓ CHANGELOG.md updated"

  # 10. Stage all changed files
  git -C "$REPO_ROOT" add "${PACKAGE_JSONS[@]}" "$CHANGELOG"

  # 11. Commit release
  git -C "$REPO_ROOT" commit \
    --no-verify \
    -m "chore(release): bump version to ${new_version}" \
    -m "Release ${new_version}" \
    --quiet
  echo "    ✓ Release commit created"

  # 12. Create annotated tag
  git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${new_version}" \
    -m "Release ${new_version}" \
    -m "Based on: ${last_commit_msg}"
  echo "    ✓ Tag ${TAG_PREFIX}${new_version} created"

  echo ""
  echo "✅ Release ${new_version} complete!"
}

main "$@"
