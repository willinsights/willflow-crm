#!/usr/bin/env bash
set -euo pipefail

echo "🚀 [start] Audiovisual CRM starting..."

# Set defaults
: "${PORT:=3000}"
: "${NODE_ENV:=production}"

echo "📊 [start] Port: $PORT"
echo "🎯 [start] Environment: $NODE_ENV"
echo "💾 [start] Storage: In-Memory"

# Start the application
echo "✅ [start] Starting application on port $PORT..."
exec node server.js
