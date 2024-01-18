declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
      LOCAL_DYNAMODB_ENDPOINT: string
      DATABASE_URL: string
      QUERY_PROVIDER: "prisma" | "dynamodb"
    }
  }
}

export {}
