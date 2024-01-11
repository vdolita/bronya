set_ttl:
	aws dynamodb update-time-to-live --table-name bronya-main --endpoint-url http://localhost:8200 --time-to-live-specification "Enabled=true, AttributeName=ttl"

prisma:
	npx prisma db pull --force
	npx prisma generate