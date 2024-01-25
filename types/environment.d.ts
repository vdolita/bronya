declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
      LOCAL_DYNAMODB_ENDPOINT: string
      DYNAMO_TABLE: string

      DATA_SOURCE: "dynamodb" | "prisma"
      POSTGRES_PRISMA_URL: string
      POSTGRES_URL_NON_POOLING: string
    }
  }
}

export {}
