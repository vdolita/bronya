import { ActivationRecord, License, LicenseStatus } from "@/schemas";

export type Offset = number | string;

export type Pager = {
  size: number;
  offset?: Offset;
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
  ): Promise<[Array<License>, Offset | undefined]>; // list, cursor
  updateLicenseByKey(key: string, data: LicenseUpdate): Promise<License>;
}

// activation records
export interface IQueryAdapter {
  addArAndDeductLcs(ar: ActivationRecord): Promise<boolean>;
  getActRecordsByKey(
    key: string,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset | undefined]>;
  getActRecordsByAppAndActivatedAt(
    app: string,
    activatedAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset | undefined]>;
  getActRecordsByAppAndExpireAt(
    app: string,
    expireAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset | undefined]>;
}
