set_ttl:
	aws dynamodb update-time-to-live --table-name bronya-main --endpoint-url http://localhost:8200 --time-to-live-specification "Enabled=true, AttributeName=ttl"

prisma:
	npx prisma migrate dev --name init
	npx prisma generate

prisma_reset:
	npx prisma migrate reset
	npx prisma generate

prisma_push:
	npx prisma db push

gen_secret:
	openssl rand -base64 32