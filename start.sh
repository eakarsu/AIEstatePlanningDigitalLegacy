#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; [ -f .env ] || { echo 'Missing .env; copy .env.example.' >&2; exit 1; }
[ -d backend/node_modules ] && [ -d frontend/node_modules ] || { echo 'Run ./scripts/bootstrap.sh first.' >&2; exit 1; }
set -a; . ./.env; set +a
npm --prefix backend start & backend_pid=$!; (cd frontend && PORT="${FRONTEND_PORT:-3001}" REACT_APP_API_URL="${REACT_APP_API_URL:-http://127.0.0.1:${BACKEND_PORT:-4000}/api}" npm start) & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; }; trap cleanup EXIT INT TERM; wait "$backend_pid" "$frontend_pid"
