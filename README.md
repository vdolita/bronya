# Developing

Bronya is a simple web application for software activation management.

## Features

1. Generate License key(uuid v4) with options(quantity, duration, available activation times, etc)
2. Activation management, disable, extend expire date, etc
3. Export licenses, activation records as csv files
4. Support multiple apps
5. Verify in simple http response or JWS signature

## Technical stack

Next.js / Prisma / shadcn-ui

## Client API

Your software only need implement 3 APIS

1. Activation
2. Activation acknowledgment
3. Activation state sync/rolling

## Core concepts

1. License / lcs: the license key use to activation your software, can use 1 or multiple times based on your generation config
2. Activation records / ar: licenseKey + identityCode is an activation record
3. identity code: like a machine code, if your license key can only use 1 time, then you can use a hard coded string otherwise should be different for each activate
4. rolling code: rolling for a period days, you can disable rolling behavior when generate licenses

## Deployment

There are three deployment options

1. Docker deployment
2. AWS Lambda + Dynamodb
3. Vercel + PostgreSQL

## Activation flow

There are 3 APIS you need to implement.

1. {{bronya-host}}/api/activation
   > body:
   > {"app": "asuka","key":"97c98e39-b8bf-48f2-bd6f-ab3b071641b1","identityCode": "a123"}
2. {{bronya-host}}/api/ar-ack
   > {"app": "asuka","key": "97c98e39-b8bf-48f2-bd6f-ab3b071641b1","identityCode": "a123","rollingCode": "4c92fbad"}
3. {{bronya-host}}/api/ar-sync
   > {"app": "kojima","key": "97c98e39-b8bf-48f2-bd6f-ab3b071641b1","identityCode": "a123","rollingCode": "4c92fbad"}


## Screenshots

![User list](/img/users.png "User list")

![App list](/img/app-list.png "App list")

![License list](/img/licenses.png "License list")

![Activation records](/img/activation-records.png "Activation records")

![Export data](/img/export.png "Export data")