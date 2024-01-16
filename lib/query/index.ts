import { IQueryAdapter } from "./adapter"
import DynamodbQuery from "./dynamodb"
import PrismaQuery from "./prisma"

export default function getQueryAdapter(): IQueryAdapter {
  const queryProvider = process.env.QUERY_PROVIDER || "dynamodb"
  switch (queryProvider) {
    case "dynamodb":
      return DynamodbQuery
    case "prisma":
      return PrismaQuery
    default:
      throw new Error(`Query provider ${queryProvider} not supported`)
  }
}
