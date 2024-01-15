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
  addLicenses,
  getLicenseByKey,
  getLicensesByAppAndCreatedTime,
  updateLicenseByKey,
} from "./license"
import { addSession, getSession } from "./session"
import { getUserByUsername } from "./user"

const DynamodbQuery: IQueryAdapter = {
  getApps: getApps,
  getApp: getApp,
  addApp: addApp,
  updateApp: updateApp,

  addSession: addSession,
  getSession: getSession,

  getUserByUsername: getUserByUsername,
  addLicenses: addLicenses,
  getLicenseByKey: getLicenseByKey,
  getLicensesByAppAndCreatedTime: getLicensesByAppAndCreatedTime,
  updateLicenseByKey: updateLicenseByKey,

  addArAndDeductLcs: addArAndDeductLcs,

  getActRecord: getActRecord,
  getActRecordsByKey: getActRecordsByKey,
  getActRecordsByAppAndActivatedAt: getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt: getActRecordsByAppAndExpireAt,
  updateActRecordByKey: updateActRecordByKey,
}

export default DynamodbQuery
