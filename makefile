set_ttl:
	aws dynamodb update-time-to-live --table-name bronya-main --endpoint-url http://localhost:8200 --time-to-live-specification "Enabled=true, AttributeName=ttl"

prisma_mg:
	npx prisma migrate dev --name init

prisma_reset:
	npx prisma migrate reset

prisma_push:
	npx prisma db push

prisma_gen:
	npx prisma generate

gen_secret:
	openssl rand -base64 32

build_sqlite:
	docker build -t bronya -f .