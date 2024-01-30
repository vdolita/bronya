import { IQueryAdapter } from "../adapter"
import actRecordQuery from "./activation"
import appQuery from "./app"
import licenseQuery from "./license"
import casbinQuery from "./permission"
import userQuery from "./user"

const PrismaQuery: IQueryAdapter = {
  app: appQuery,
  actRecord: actRecordQuery,
  license: licenseQuery,
  user: userQuery,
  permission: casbinQuery,
}

export default PrismaQuery
