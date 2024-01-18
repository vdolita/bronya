import { IQueryAdapter } from "../adapter"
import activationRecordQuery from "./activation-record"
import appQuery from "./app"
import licenseQuery from "./license"
import userQuery from "./user"

const DynamodbQuery: IQueryAdapter = {
  actRecord: activationRecordQuery,
  app: appQuery,
  license: licenseQuery,
  user: userQuery,
}

export default DynamodbQuery
