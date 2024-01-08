import { IQueryAdapter } from "./adapter";
import DynamodbQuery from "./dynamodb";

export default function getQueryAdapter(): IQueryAdapter {
  return DynamodbQuery;
}
