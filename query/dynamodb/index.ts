import { IQueryAdapter } from "../adapter";
import {
  addArAndDeductLcs,
  getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt,
  getActRecordsByKey,
} from "./activation-record";
import { addApp, getApps } from "./app";
import {
  addLicenses,
  getLicenseByKey,
  getLicensesByAppAndCreatedTime,
  updateLicenseByKey,
} from "./license";
import { addSession, getSession } from "./session";
import { getUserByUsername } from "./user";

const DynamodbQuery: IQueryAdapter = {
  getApps: getApps,
  addApp: addApp,
  addSession: addSession,
  getSession: getSession,
  getUserByUsername: getUserByUsername,
  addLicenses: addLicenses,
  getLicenseByKey: getLicenseByKey,
  getLicensesByAppAndCreatedTime: getLicensesByAppAndCreatedTime,
  updateLicenseByKey: updateLicenseByKey,
  addArAndDeductLcs: addArAndDeductLcs,
  getActRecordsByKey: getActRecordsByKey,
  getActRecordsByAppAndActivatedAt: getActRecordsByAppAndActivatedAt,
  getActRecordsByAppAndExpireAt: getActRecordsByAppAndExpireAt,
};

export default DynamodbQuery;
