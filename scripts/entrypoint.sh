#!/bin/sh

nextauth_secret=$(openssl rand -base64 32)

echo "starting server"

NEXTAUTH_SECRET=$nextauth_secret node /app/server.js
