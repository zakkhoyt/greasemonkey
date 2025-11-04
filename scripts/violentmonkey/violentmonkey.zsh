#!/usr/bin/env -S zsh -euo pipefail
# shellcheck shell=bash # trick shellcheck into working with zsh
# shellcheck disable=SC2296 # Falsely identifies zsh expansions
# shellcheck disable=SC1091 # Complains about sourcing without literal path
#
# ---- ---- ----  About this Script  ---- ---- ----
#
# TODO: zakkhoyt - about script
#
# ---- ---- ----     Source Utilities     ---- ---- ----


# Determine script directory for relative path fallback
script_dir="${0:A:h}"

# Define standard source file directories (used for utilities and trap handlers)
source_dirs=(
  "${HATCH_SOURCE_DIR:-}"
  "$HOME/.hatch/source"
  "$HOME/.zsh_home/utilities"
  "$script_dir/../../assets/hatch_home/source"
)

# Source .zsh_scripting_utilities
unset -v scripting_utilities_found
for source_dir in "${source_dirs[@]}"; do
  if [[ -n "$source_dir" && -f "$source_dir/.zsh_scripting_utilities" ]]; then
    source "$source_dir/.zsh_scripting_utilities" "$0" "$@" > /dev/null
    scripting_utilities_found=true
    break
  fi
done

# Error if all paths failed
if [[ -z "${scripting_utilities_found:-}" ]]; then
  echo "ERROR: Cannot find .zsh_scripting_utilities in any expected location:" >&2
  for source_dir in "${source_dirs[@]}"; do
    [[ -n "$source_dir" ]] && echo "  - $source_dir/.zsh_scripting_utilities" >&2
  done
  exit 1
fi



# ---- ---- ----     Help Function     ---- ---- ----
# TODO: zakkhoyt - 

function print_usage {
  cat << 'EOF'
SYNOPSIS
    $SCRIPT_NAME [OPTIONS] [DEVELOPMENT OPTIONS]

DESCRIPTION
    # TODO: zakkhoyt - print_usage description

OPTIONS
    # TODO: zakkhoyt - print_usage options

    --help
        Display this help message and exit

    --dry-run
        Show what would be done without making changes

DEVELOPMENT OPTIONS
    -d, --debug
        Enable debug output (can be specified multiple times for more verbosity)
          -d           Basic debug output
          -dd          Enable ERR trap debugging (see --trap-err)
                       (also: -d -d, -d2)
          -ddd         Enable ERR and EXIT trap debugging (see --trap-exit)
                       (also: -d -d -d, -d3)

    --trap-err, --debug-err
        Enable ERR trap handler (shows line numbers on script failures)

    --trap-exit, --debug-exit
        Enable EXIT trap handler (shows exit status information)

EXAMPLES
    # TODO: zakkhoyt - print_usage example

OUTPUT
    # TODO: zakkhoyt - print_usage ouptut

EXIT STATUS
    0   Success
    >0   General failure

SEE ALSO
    $HOME/Documents/notes/javascript/VIOLENTMONKEY.md

EOF
}

# ---- ---- ----   Argument Parsing   ---- ---- ----

# Stage 1: Parse standard arguments (help, debug, dry-run)
# Note: -D removes parsed opts, no -E so unrecognized opts pass through to later stages
zparseopts -D -- \
  -help=flag_help \
  {d,-debug}+=flag_debug \
  -dry-run=flag_dry_run

# Display help if requested (early exit)
if [[ -n "${flag_help:-}" ]]; then
  print_usage
  exit 0
fi

# Set up debug mode if requested
flag_debug_level=${#flag_debug[@]}
slog_var_se_d "flag_debug_level" "$flag_debug_level"
if [[ $flag_debug_level -gt 0 ]]; then
  export IS_DEBUG=true
  if [[ $flag_debug_level -gt 1 ]]; then
    export IS_UTILS_DEBUG=true
  fi
fi

is_dry_run=${flag_dry_run:+true}
slog_var_se_d "is_dry_run" "$is_dry_run"

# Stage 2: Parse trap control flags (for debugging trap handlers)
zparseopts -D -- \
  {-trap-err,-debug-err}=flag_debug_err \
  {-trap-exit,-debug-exit}=flag_debug_exit

# Set up error handling traps
if [[ -n "${flag_debug_err:-}" ]]; then
  trap 'slog_error_se "Script failed at line $LINENO with exit code $?"' ERR
else
  trap 'slog_error_se "Script failed at line $LINENO with exit code $?"' ERR
fi

if [[ -n "${flag_debug_exit:-}" ]]; then
  trap 'slog_se_d "Script exiting with status $?"' EXIT
fi

# ---- ---- ---- Script Vars ---- ---- ----

# Stage 3: Parse script-specific arguments
zparseopts -D -E -- \
  -script:=opt_script \
  -ip:=opt_ip

# ---- ---- ---- Refine Vars ---- ---- ----

# Extract option values with defaults
script_path="${opt_script[-1]:-}"
slog_var_se_d "script_path" "$script_path"

if [[ -z "$script_path" ]]; then
  slog_error_se "ERROR: " --bold "--script <script_path>" --default " is required. See " --bold "--help" --default " for details."
  exit 1
fi

script_path=$(realpath "${script_path}")
slog_var_se_d "script_path" "$script_path"

preferred_ip="${opt_ip[-1]:-127.0.0.1}"
slog_var_se_d "preferred_ip" "$preferred_ip"
# ---- ---- ---- Script Logic ---- ---- ----


# script_path="$HOME/code/repositories/z2k/github/greasemonkey/markdown_linker/markdown_linker.user.js"
script_dir=$(dirname "$script_path")
slog_var_se_d "script_dir" "$script_dir"
script_base=$(basename "$script_path")
slog_var_se_d "script_base" "$script_base"

# Nav to same dir as your *.user.js script
cd "$script_dir"

if ! command -v http-server; then 
  slog_step_se_d --context will "Install " --code "http-server" --default " via homebrew"
  #  Install HTTP server
  brew install http-server || {
    rval.=$?
    slog_step_se --context error --rval "$rval" "Install " --code "http-server" --default
    exit 1
  }
  slog_step_se --context success "Installed " --code "http-server" --default
fi

# If trouble launching, maybe this will help: brew reinstall icu4c

# [step] Create temporary file for http-server output
slog_step_se --context will "Create temporary file for http-server output"

temp_output=$(mktemp) || {
  exit_code=$?
  slog_step_se --context fatal --exit-code "$exit_code" "Failed to create temporary file"
  exit $exit_code
}

slog_var_se_d "temp_output" "$temp_output"
slog_step_se --context success "Created temporary file: " --url "$temp_output" --default

# Set up trap to clean up temp file and http-server when script exits
trap "kill \${http_server_pid:-} 2>/dev/null; rm -f '$temp_output'" EXIT INT TERM

# [step] Start http-server in background
slog_step_se --context will "Start " --code "http-server" --default " in background from directory: " --url "$script_dir" --default

# Start http-server in background and capture initial output
http-server -c5 > "$temp_output" 2>&1 &
http_server_pid=$!
slog_var_se_d "http_server_pid" "$http_server_pid"

# Wait for server to start and produce output (give it a few seconds)
sleep 3

# [step] Verify http-server is running
slog_step_se --context will "Verify " --code "http-server" --default " process is running"

if ! kill -0 "$http_server_pid" 2>/dev/null; then
  server_output=$(<"$temp_output")
  slog_step_se --context fatal "http-server process (PID: " --code "$http_server_pid" --default ") failed to start or terminated immediately. Output:
$server_output"
  exit 1
fi

slog_step_se --context success "Verified " --code "http-server" --default " is running (PID: " --code "$http_server_pid" --default ") from directory: " --url "$script_dir" --default

# [step] Parse server URL from output
slog_step_se --context will "Parse server URLs from " --code "http-server" --default " output"

server_output=$(<"$temp_output")
slog_var_se_d "server_output" "$server_output"

# Extract all available URLs (http://IP:PORT format)
server_urls_raw=$(echo "$server_output" | grep -o "http://[0-9.]*:[0-9]*")
slog_var_se_d "server_urls_raw" "$server_urls_raw"

# Convert to array using (f) flag
server_urls=(${(f)"${server_urls_raw}"})
slog_array_se_d "server_urls" "${server_urls[@]}"

if [[ ${#server_urls[@]} -eq 0 ]]; then
  slog_step_se --context fatal "Could not find any server URLs in http-server output. Output:
$server_output"
  exit 1
fi

slog_step_se --context success "Found ${#server_urls[@]} server URL(s)"

# [step] Select server URL
if [[ ${#server_urls[@]} -eq 1 ]]; then
  server_base_url="${server_urls[1]}"
  slog_step_se --context info "Using server URL: " --url "$server_base_url" --default
elif [[ -n "$preferred_ip" ]]; then
  # Auto-select URL containing preferred IP
  slog_step_se --context will "Search for URL containing IP: " --code "$preferred_ip" --default
  
  unset -v matched_url
  for url in "${server_urls[@]}"; do
    if [[ "$url" == *"$preferred_ip"* ]]; then
      matched_url="$url"
      break
    fi
  done
  
  if [[ -n "${matched_url:-}" ]]; then
    server_base_url="$matched_url"
    slog_step_se --context success "Auto-selected server URL: " --url "$server_base_url" --default
  else
    slog_step_se --context warning "Could not find URL containing IP: " --code "$preferred_ip" --default ". Available URLs:"
    for ((i=1; i<=${#server_urls[@]}; i++)); do
      slog "  [$i] " --url "${server_urls[$i]}" --default
    done
    slog_se ""
    
    # Prompt user to select
    slog --cyan "Select server URL [1-${#server_urls[@]}]: " --default
    read -r selection
    
    # Validate selection
    if [[ ! "$selection" =~ ^[0-9]+$ ]] || [[ $selection -lt 1 ]] || [[ $selection -gt ${#server_urls[@]} ]]; then
      slog_step_se --context fatal "Invalid selection: " --code "$selection" --default ". Must be between 1 and ${#server_urls[@]}"
      exit 1
    fi
    
    server_base_url="${server_urls[$selection]}"
    slog_step_se --context success "Selected server URL: " --url "$server_base_url" --default
  fi
else
  # Multiple URLs, no preferred IP - prompt user
  slog_step_se --context info "Multiple server URLs available:"
  for ((i=1; i<=${#server_urls[@]}; i++)); do
    slog "  [$i] " --url "${server_urls[$i]}" --default
  done
  slog_se ""
  
  # Prompt user to select
  slog --cyan "Select server URL [1-${#server_urls[@]}]: " --default
  read -r selection
  
  # Validate selection
  if [[ ! "$selection" =~ ^[0-9]+$ ]] || [[ $selection -lt 1 ]] || [[ $selection -gt ${#server_urls[@]} ]]; then
    slog_step_se --context fatal "Invalid selection: " --code "$selection" --default ". Must be between 1 and ${#server_urls[@]}"
    exit 1
  fi
  
  server_base_url="${server_urls[$selection]}"
  slog_step_se --context success "Selected server URL: " --url "$server_base_url" --default
fi

slog_var_se_d "server_base_url" "$server_base_url"

# # Example output from http-server:
# Starting up http-server, serving ./
# 
# http-server version: 14.1.1
# 
# http-server settings: 
# CORS: disabled
# Cache: 5 seconds
# Connection Timeout: 120 seconds
# Directory Listings: visible
# AutoIndex: visible
# Serve GZIP Files: false
# Serve Brotli Files: false
# Default File Extension: none
# 
# Available on:
#   http://127.0.0.1:8080
#   http://192.168.7.149:8080
# Hit CTRL-C to stop the server
# 
# [2025-11-01T20:37:34.450Z]  "GET /markdown_linker.user.js" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0"
# [2025-11-01T20:37:34.454Z]  "GET /markdown_linker.user.js" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0"

# [step] Construct script URL
script_url="$server_base_url/$script_base"
slog_var_se_d "script_url" "$script_url"

# [step] Open script URL in browser
slog_step_se --context will "Open script URL in browser: " --url "$script_url" --default

open "$script_url" || {
  exit_code=$?
  slog_step_se --context fatal --exit-code "$exit_code" "Failed to open script URL: " --url "$script_url" --default
  exit $exit_code
}

# TODO: zakkhoyt P1 - Open webpage (that the script affects), in a browser.

# Display instructions
slog_se ""
slog --magenta "[violentmonkey]" --default " Click checkbox: " --bold "Track External Edits" --default
slog --magenta "[violentmonkey]" --default " Edit " --url "$script_path" --default " using whatever you like" --default
slog_se ""
slog --cyan "[info]" --default " http-server is running (PID: " --code "$http_server_pid" --default ")"
slog --cyan "[info]" --default " Press " --bold "Ctrl+C" --default " to stop the server and exit"
slog_se ""

# TODO: zakkhoyt P1 - Open webpage (that the script affects), in a browser. 

# Keep script alive indefinitely
# When killed (Ctrl+C or SIGTERM), the EXIT trap will clean up http-server
while kill -0 "$http_server_pid" 2>/dev/null; do
  sleep 5
done

# If we reach here, http-server died unexpectedly
slog_step_se --context warning "http-server process (PID: " --code "$http_server_pid" --default ") terminated unexpectedly"
exit 1

