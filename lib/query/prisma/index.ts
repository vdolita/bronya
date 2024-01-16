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
  getApps: allApps,
  getApp: findApp,
  addApp: createApp,
  updateApp: saveApp,

  addSession: addSession,
  getSession: getSession,

  getUserByUsername: getUserByUsername,

  saveAppLicense: saveAppLicense,
  getLicenseByKey: getLicenseByKey,
  getLicensesByAppAndCreatedTime: getLicensesByAppAndCreatedTime,
  updateLicenseByKey: saveLicense,

  addArAndDeductLcs: addArAndDeductLcs,

  getActRecord: getActRecord,
  getActRecordsByKey: getActRecordsByKey,
  getActRecordsByAppAndActivatedAt: getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt: getActRecordsByAppAndExpireAt,
  updateActRecordByKey: updateActRecordByKey,
}

export default PrismaQuery
