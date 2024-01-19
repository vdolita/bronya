declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AWS_REGION: string
      LOCAL_DYNAMODB_ENDPOINT: string

      DATA_SOURCE: "dynamodb" | "prisma"
      DATABASE_URL: string
    }
  }
}

export {}
