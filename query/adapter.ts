import { ActivationRecord, License, LicenseStatus } from "@/schemas";

type Pager = {
  size: number;
  offset?: number | string;
};

type LicenseUpdate = {
  status?: LicenseStatus;
  remarks?: string;
  labels?: Array<string>;
};

// app
export interface IQueryAdapter {
  getApps(): Promise<Array<string>>;
  addApp(appName: string): Promise<void>;
}

// session
export interface IQueryAdapter {
  addSession(ssid: string, username: string, ttl: Date): Promise<void>;
  getSession(ssid: string): Promise<{ username: string } | null>;
}

// user
export interface IQueryAdapter {
  getUserByUsername(
    username: string
  ): Promise<{ username: string; password: string } | null>;
}

// licenses
export interface IQueryAdapter {
  addLicenses(licenses: ReadonlyArray<License>): Promise<number>;
  getLicenseByKey(key: string): Promise<License | null>;
  getLicensesByAppAndCreatedTime(
    app: string,
    createdAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<License>, string | number | undefined]>; // list, cursor
  updateLicenseByKey(key: string, data: LicenseUpdate): Promise<License>;
}

// activation records
export interface IQueryAdapter {
  addArAndDeductLcs(ar: ActivationRecord): Promise<boolean>;
}
