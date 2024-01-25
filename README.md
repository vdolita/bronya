# Developing

Bronya is a simple web application for software activation management.

## Features

1. Generate License key(uuid v4) with options(quantity, duration, available activation times, etc)
2. Activation management, disable, extend expire date, etc
3. Export licenses, activation records as csv files
4. Support multiple apps
5. Verify in simple http response or JWS signature

## Technical stack

Next.js + prisma/dynamodb

## Client API

Your software only need implement 3 APIS

1. Activation
2. Activation acknowledgment
3. Activation state sync/rolling

## Core model
