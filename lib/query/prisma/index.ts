import { IQueryAdapter } from "../adapter"
import {
  getLicenseByKey,
  getLicensesByAppAndCreatedTime,
  saveAppLicense,
} from "../dynamodb/license"
import {
  addArAndDeductLcs,
  getActRecord,
  getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt,
  getActRecordsByKey,
  updateActRecordByKey,
} from "./activation"
import { allApps, createApp, findApp, saveApp } from "./app"
import { saveLicense } from "./license"
import { addSession, getSession } from "./session"
import { getUserByUsername } from "./user"

const PrismaQuery: IQueryAdapter = {
  allApp: allApps,
  findApp: findApp,
  createApp: createApp,
  updateApp: saveApp,

  createSession: addSession,
  findSession: getSession,

  findUser: getUserByUsername,

  createLicenses: saveAppLicense,
  findLicense: getLicenseByKey,
  findLicenses: getLicensesByAppAndCreatedTime,
  updateLicense: saveLicense,

  createArAndDeduct: addArAndDeductLcs,

  findActRecord: getActRecord,
  findActRecords: getActRecordsByKey,
  findArByAppAndActAt: getActRecordsByAppAndActivatedAt,
  findArByAppAndExp: getActRecordsByAppAndExpireAt,
  updateActRecord: updateActRecordByKey,
}

export default PrismaQuery
