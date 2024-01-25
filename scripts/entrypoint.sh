#!/bin/sh
set -e

[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

[ -z ${NEXTAUTH_SECRET+x} ] && export NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "Starting Bronya server"

exec "$@"