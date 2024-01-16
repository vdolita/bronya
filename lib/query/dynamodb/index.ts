import { IQueryAdapter } from "../adapter"
import {
  addArAndDeductLcs,
  getActRecord,
  getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt,
  getActRecordsByKey,
  updateActRecordByKey,
} from "./activation-record"
import { addApp, getApp, getApps, updateApp } from "./app"
import {
  getLicenseByKey,
  getLicensesByAppAndCreatedTime,
  saveAppLicense,
  updateLicenseByKey,
} from "./license"
import { addSession, getSession } from "./session"
import { getUserByUsername } from "./user"

const DynamodbQuery: IQueryAdapter = {
  allApp: getApps,
  findApp: getApp,
  createApp: addApp,
  updateApp: updateApp,

  createSession: addSession,
  findSession: getSession,

  findUser: getUserByUsername,
  createLicenses: saveAppLicense,
  findLicense: getLicenseByKey,
  findLicenses: getLicensesByAppAndCreatedTime,
  updateLicense: updateLicenseByKey,

  createArAndDeduct: addArAndDeductLcs,

  findActRecord: getActRecord,
  findActRecords: getActRecordsByKey,
  findArByAppAndActAt: getActRecordsByAppAndActivatedAt,
  findArByAppAndExp: getActRecordsByAppAndExpireAt,
  updateActRecord: updateActRecordByKey,
}

export default DynamodbQuery
