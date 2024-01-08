import { IQueryAdapter } from "../adapter";
import { addArAndDeductLcs } from "./activation-record";
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
};

export default DynamodbQuery;
