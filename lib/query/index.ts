import { IQueryAdapter } from "./adapter"
import DynamodbQuery from "./dynamodb"
import PrismaQuery from "./prisma"

export default function getQueryAdapter(): IQueryAdapter {
  const queryProvider = process.env.QUERY_PROVIDER
  switch (queryProvider) {
    case "dynamodb":
      return DynamodbQuery
    case "prisma":
      return PrismaQuery
    default:
      throw new Error(`Unknown query provider: ${queryProvider as string}`)
  }
}
