import { IQueryAdapter } from "./adapter"
import DynamodbQuery from "./dynamodb"
import PrismaQuery from "./prisma"

export default function getQueryAdapter(): IQueryAdapter {
  const dataSource = process.env.DATA_SOURCE
  switch (dataSource) {
    case "dynamodb":
      return DynamodbQuery
    case "prisma":
      return PrismaQuery
    default:
      throw new Error(`Unknown query provider: ${dataSource as string}`)
  }
}
