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
#
# Daily grouping:
#   - Only ONE version bump per day
#   - All changes on the same day are accumulated into one CHANGELOG entry
#   - Version bump reflects the HIGHEST severity change of the day
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
  local version="$1"   # expects "X.Y.Z" after stripping prefix
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
  local scope_regex='^[a-zA-Z_]+\(([^)]+)\)'
  if [[ "$msg" =~ $scope_regex ]]; then
    echo "${BASH_REMATCH[1]}"
  fi
}

# --- Helper: extract description (first line without prefix) ---------------
extract_description() {
  local msg="$1"
  local cleaned
  cleaned="$(echo "$msg" | sed -E 's/^[a-zA-Z_]+(\([^)]*\))?!?:[[:space:]]*//')"
  echo "$cleaned"
}

# --- Helper: parse latest CHANGELOG entry's date and version ---------------
# Returns: "version|date" or empty if no entries exist
parse_latest_changelog_entry() {
  if [[ ! -f "$CHANGELOG" ]]; then
    echo ""
    return
  fi
  # Match first "## [X.Y.Z] - YYYY-MM-DD" line
  local line
  line="$(grep -m1 '^## \[.*\] - [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}' "$CHANGELOG" || true)"
  if [[ -z "$line" ]]; then
    echo ""
    return
  fi
  local ver date_part
  ver="$(echo "$line" | sed -E 's/^## \[(.*)\] - .*/\1/')"
  date_part="$(echo "$line" | sed -E 's/^## \[.*\] - (.*)/\1/')"
  echo "${ver}|${date_part}"
}

# --- Helper: get bump priority number --------------------------------------
# higher number = more severe
bump_priority() {
  case "$1" in
    major) echo 3 ;;
    minor) echo 2 ;;
    patch) echo 1 ;;
    *)     echo 0 ;;
  esac
}

# --- Helper: determine the highest bump between two types ------------------
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

# --- Helper: find CHANGELOG insert position for today's entry --------------
# Returns line number of the first "## [" line, or empty
get_changelog_insert_line() {
  if [[ ! -f "$CHANGELOG" ]]; then
    echo ""
    return
  fi
  grep -n '^## \[' "$CHANGELOG" | head -1 | cut -d: -f1
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
  local last_commit_msg last_commit_body last_commit_sha
  last_commit_msg="$(git -C "$REPO_ROOT" log -1 --pretty=%s)"
  last_commit_body="$(git -C "$REPO_ROOT" log -1 --pretty=%b)"
  last_commit_sha="$(git -C "$REPO_ROOT" log -1 --pretty=%H)"

  # 3. Prevent recursive release (skip if this is already a release commit)
  if echo "$last_commit_msg" | grep -qE "^chore\(release\):"; then
    echo "🔹 Release commit detected. Skipping."
    exit 0
  fi

  # 4. Determine bump type for this commit
  local new_bump_type="none"
  local is_feat=false
  local is_fix=false
  local is_refactor=false
  local is_breaking=false

  if printf "%s\n%s" "$last_commit_msg" "$last_commit_body" | grep -qi "BREAKING CHANGE"; then
    is_breaking=true
    new_bump_type="major"
  fi

  if echo "$last_commit_msg" | grep -qE "^feat(\(.*\))?!?:"; then
    is_feat=true
    [[ "$new_bump_type" == "none" ]] && new_bump_type="minor"
  elif echo "$last_commit_msg" | grep -qE "^fix(\(.*\))?!?:"; then
    is_fix=true
    [[ "$new_bump_type" == "none" ]] && new_bump_type="patch"
  elif echo "$last_commit_msg" | grep -qE "^refactor(\(.*\))?!?:"; then
    is_refactor=true
    [[ "$new_bump_type" == "none" ]] && new_bump_type="patch"
  fi

  if [[ "$new_bump_type" == "none" ]]; then
    echo "🔹 No feat/fix/BREAKING CHANGE detected. Skipping release."
    exit 0
  fi

  # 5. Parse commit details
  local scope description
  scope="$(extract_scope "$last_commit_msg")"
  description="$(extract_description "$last_commit_msg")"
  local date_today
  date_today="$(get_date)"

  # 6. Check if we already have a release for today
  local latest_entry
  latest_entry="$(parse_latest_changelog_entry)"
  local existing_version="" existing_date=""

  if [[ -n "$latest_entry" ]]; then
    existing_version="$(echo "$latest_entry" | cut -d'|' -f1)"
    existing_date="$(echo "$latest_entry" | cut -d'|' -f2)"
  fi

  # 7. Determine version and whether this is a new day or same day
  local current_version new_version effective_bump
  current_version="$(get_current_version)"

  if [[ "$existing_date" == "$date_today" && -n "$existing_version" ]]; then
    # ── SAME DAY: append to existing entry ─────────────────────────────
    local existing_bump="patch"

    # Heuristic: determine existing bump from version increment
    # Compare current version with what it would be after downgrade
    local prev_major prev_minor prev_patch
    IFS='.' read -r prev_major prev_minor prev_patch <<< "$current_version"

    # Try to guess the bump type by checking known previous version patterns
    # We check if current version could have been a minor or patch bump
    local minor_check="$prev_major.$((prev_minor - 1)).0"
    local patch_check="$prev_major.$prev_minor.$((prev_patch - 1))"
    local major_check="$((prev_major - 1)).0.0"

    # Simple heuristic: if patch > 0, it was at least a patch bump
    # If minor > 0 and patch == 0, it was a minor bump
    if (( prev_patch > 0 )); then
      existing_bump="patch"
    elif (( prev_minor > 0 )); then
      existing_bump="minor"
    elif (( prev_major > 0 )); then
      existing_bump="major"
    fi

    effective_bump="$(max_bump "$existing_bump" "$new_bump_type")"

    # If severity increased, bump version further
    if [[ "$effective_bump" != "$existing_bump" ]]; then
      # We need to bump from the previous day's version, not current
      # But since current already incorporates today's bump, 
      # we need to figure out yesterday's version
      # For simplicity: use current version as base, bump further
      new_version="$(semver_bump "$current_version" "$new_bump_type")"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Day upgrade: $current_version → $new_version"
      echo "  Severity increased: $existing_bump → $effective_bump"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      # Update package.json files
      for pj in "${PACKAGE_JSONS[@]}"; do
        update_package_json "$pj" "$new_version"
      done
    else
      new_version="$current_version"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "  Same-day update: $new_version"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    # Build the new bullet line for this commit
    local new_bullet=""
    if $is_breaking; then
      local bc_msg
      bc_msg="$(printf "%s\n%s" "$last_commit_msg" "$last_commit_body" | grep -i "BREAKING CHANGE" | head -1 | sed 's/^BREAKING CHANGE:[[:space:]]*//I')"
      new_bullet="- **${scope}**: ${bc_msg:-$description}"
    elif $is_feat; then
      new_bullet="- **${scope}**: ${description}"
    elif $is_fix; then
      new_bullet="- **${scope}**: ${description}"
    elif $is_refactor; then
      new_bullet="- **${scope}**: ${description}"
    fi

    # Append the new bullet to today's CHANGELOG entry
    # Find the right section in today's entry and append
    local section=""
    if $is_breaking; then
      section="### BREAKING CHANGES"
    elif $is_feat; then
      section="### Features"
    elif $is_fix; then
      section="### Bug Fixes"
    elif $is_refactor; then
      section="### Refactors"
    fi

    # Find the line number of today's entry's section header and insert after it
    local entry_start_line section_line
    entry_start_line="$(grep -n "^## \[${existing_version}\] - ${date_today}" "$CHANGELOG" | head -1 | cut -d: -f1)"
    if [[ -n "$entry_start_line" ]]; then
      # Check if this section already exists in today's entry
      local next_entry_line
      next_entry_line="$(grep -n '^## \[' "$CHANGELOG" | awk -F: -v start="$entry_start_line" '$1 > start {print $1; exit}')"
      if [[ -z "$next_entry_line" ]]; then
        next_entry_line="$(wc -l < "$CHANGELOG" | tr -d ' ')"
        ((next_entry_line++))
      fi

      local section_exists
      section_exists="$(sed -n "${entry_start_line},${next_entry_line}p" "$CHANGELOG" | grep -c "^${section}$" || true)"

      if [[ "$section_exists" -gt 0 ]]; then
        # Section exists — insert bullet after the section header
        # Find the section header line within today's entry range
        section_line="$(grep -n "^${section}$" "$CHANGELOG" | awk -F: -v start="$entry_start_line" -v end="$next_entry_line" '$1 >= start && $1 <= end {print $1; exit}')"
        # Insert new bullet right after section header (sorted bullets don't matter)
        sed -i '' "${section_line}a\\
${new_bullet}
" "$CHANGELOG"
      else
        # Section doesn't exist — add section header + bullet
        # Insert before the next entry or at end of today's entry
        local insert_after
        # Find the last line of today's entry (before next entry or EOF)
        if [[ -n "$next_entry_line" ]] && (( next_entry_line <= $(wc -l < "$CHANGELOG" | tr -d ' ') )); then
          insert_after="$((next_entry_line - 1))"
        else
          insert_after="$(wc -l < "$CHANGELOG" | tr -d ' ')"
        fi
        # Append section header and bullet
        sed -i '' "${insert_after}a\\
\\
${section}\\
${new_bullet}
" "$CHANGELOG"
      fi
    fi

  else
    # ── NEW DAY: create new entry ──────────────────────────────────────
    new_version="$(semver_bump "$current_version" "$new_bump_type")"
    effective_bump="$new_bump_type"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  New day release: $current_version → $new_version"
    echo "  Commit:  ${last_commit_msg:0:72}"
    echo "  Bump:    $effective_bump"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Update all package.json files
    for pj in "${PACKAGE_JSONS[@]}"; do
      update_package_json "$pj" "$new_version"
    done

    # Build full CHANGELOG entry
    local changelog_entry=""
    changelog_entry+="## [${new_version}] - ${date_today}\n\n"

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

    if $is_feat; then
      changelog_entry+="### Features\n"
      if [[ -n "$scope" ]]; then
        changelog_entry+="- **${scope}**: ${description}\n"
      else
        changelog_entry+="- ${description}\n"
      fi
      changelog_entry+="\n"
    fi

    if $is_fix; then
      changelog_entry+="### Bug Fixes\n"
      if [[ -n "$scope" ]]; then
        changelog_entry+="- **${scope}**: ${description}\n"
      else
        changelog_entry+="- ${description}\n"
      fi
      changelog_entry+="\n"
    fi

    if $is_refactor; then
      changelog_entry+="### Refactors\n"
      if [[ -n "$scope" ]]; then
        changelog_entry+="- **${scope}**: ${description}\n"
      else
        changelog_entry+="- ${description}\n"
      fi
      changelog_entry+="\n"
    fi

    # Write CHANGELOG.md
    local header="# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n"
    if [[ ! -f "$CHANGELOG" ]]; then
      printf "%b%s" "$header" "$changelog_entry" > "$CHANGELOG"
    else
      local insert_line
      insert_line="$(get_changelog_insert_line)"
      if [[ -n "$insert_line" ]]; then
        head -n "$((insert_line - 1))" "$CHANGELOG" > "${CHANGELOG}.tmp"
        printf "%b" "$changelog_entry" >> "${CHANGELOG}.tmp"
        tail -n +"$insert_line" "$CHANGELOG" >> "${CHANGELOG}.tmp"
        mv "${CHANGELOG}.tmp" "$CHANGELOG"
      else
        printf "%b" "$changelog_entry" >> "$CHANGELOG"
      fi
    fi
    echo "    ✓ CHANGELOG.md updated"
  fi

  # 8. Stage all changed files
  git -C "$REPO_ROOT" add "${PACKAGE_JSONS[@]}" "$CHANGELOG"

  # 9. Commit or amend release
  if [[ "$existing_date" == "$date_today" && -n "$existing_version" ]]; then
    # Same day — amend the previous release commit or create new commit
    local last_commit_is_release
    last_commit_is_release="$(git -C "$REPO_ROOT" log -1 --pretty=%s | grep -cE "^chore\(release\):" || true)"
    
    if [[ "$new_version" != "$current_version" ]]; then
      # Version changed — need to update tag too
      # Delete old tag if exists
      git -C "$REPO_ROOT" tag -d "${TAG_PREFIX}${existing_version}" 2>/dev/null || true
      
      if [[ "$last_commit_is_release" -gt 0 ]]; then
        # Amend existing release commit
        git -C "$REPO_ROOT" commit --amend --no-verify \
          -m "chore(release): bump version to ${new_version}" \
          -m "Daily release ${new_version}" \
          --quiet
        echo "    ✓ Release commit amended → $new_version"
        # Force update tag
        git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${new_version}" \
          -m "Release ${new_version}" \
          -f
        echo "    ✓ Tag ${TAG_PREFIX}${new_version} updated"
      else
        git -C "$REPO_ROOT" commit --no-verify \
          -m "chore(release): bump version to ${new_version}" \
          -m "Daily release ${new_version}" \
          --quiet
        echo "    ✓ Release commit created → $new_version"
        git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${new_version}" \
          -m "Release ${new_version}"
        echo "    ✓ Tag ${TAG_PREFIX}${new_version} created"
      fi
    else
      # Same version — just amend to include new changelog content
      if [[ "$last_commit_is_release" -gt 0 ]]; then
        git -C "$REPO_ROOT" commit --amend --no-verify --no-edit --quiet
        echo "    ✓ Release commit amended (same version)"
      else
        git -C "$REPO_ROOT" commit --no-verify \
          -m "chore(release): update changelog for ${new_version}" \
          --quiet
        echo "    ✓ Changelog update commit created"
      fi
    fi
  else
    # New day — create new release commit
    git -C "$REPO_ROOT" commit --no-verify \
      -m "chore(release): bump version to ${new_version}" \
      -m "Release ${new_version}" \
      --quiet
    echo "    ✓ Release commit created"

    # Create annotated tag (new day always gets a fresh tag)
    git -C "$REPO_ROOT" tag -a "${TAG_PREFIX}${new_version}" \
      -m "Release ${new_version}" \
      -m "Based on: ${last_commit_msg}"
    echo "    ✓ Tag ${TAG_PREFIX}${new_version} created"
  fi

  echo ""
  echo "✅ Release ${new_version} complete!"
}

main "$@"
