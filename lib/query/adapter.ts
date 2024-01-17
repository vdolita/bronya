import { ActivationRecord, License } from "@/lib/schemas"
import { PageOffset, Pager } from "../meta"
import { ClientApp } from "../schemas/app"

export type Offset = PageOffset | undefined

export type LicenseUpdate = Partial<
  Pick<License, "status" | "remark" | "labels">
>

export type ArUpdate = Partial<
  Pick<
    ActivationRecord,
    | "activatedAt"
    | "status"
    | "rollingCode"
    | "nxRollingCode"
    | "lastRollingAt"
    | "expireAt"
    | "remark"
    | "labels"
  >
>

export type AppUpdate = Pick<ClientApp, "version">

// app
export interface IAppQuery {
  allApp(): Promise<Array<ClientApp>>
  findApp(app: string): Promise<ClientApp | null>
  createApp(app: ClientApp): Promise<void>
  updateApp(app: string, data: AppUpdate): Promise<ClientApp>
}

// session
export interface ISessionQuery {
  createSession(ssid: string, username: string, ttl: Date): Promise<void>
  findSession(ssid: string): Promise<{ username: string } | null>
}

// user
export interface IUserQuery {
  findUser(
    username: string
  ): Promise<{ username: string; password: string } | null>
}

// licenses
export interface ILicenseQuery {
  createLicenses(sample: Omit<License, "key">, keys: string[]): Promise<number>
  findLicense(key: string): Promise<License | null>
  findLicenses(
    app: string,
    createdAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<License>, Offset]>
  findLicensesInRange(
    app: string,
    from: Date | undefined,
    to: Date | undefined
  ): AsyncGenerator<Array<License>, void>
  updateLicense(key: string, data: LicenseUpdate): Promise<License>
}

// activation records
export interface IActivationRecordQuery {
  /**
   * createArAndDeduct will create an activation record and deduct the license
   */
  createArAndDeduct(ar: ActivationRecord): Promise<boolean>
  findActRecord(
    key: string,
    identityCode: string
  ): Promise<ActivationRecord | null>
  findActRecords(
    key: string,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  findArByAppAndActAt(
    app: string,
    activatedAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  findArByAppAndExp(
    app: string,
    expireAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  findArInRange(
    app: string,
    from: Date | undefined,
    to: Date | undefined
  ): AsyncGenerator<Array<ActivationRecord>, void>
  updateActRecord(
    key: string,
    idCode: string,
    data: ArUpdate
  ): Promise<ActivationRecord>
}

export interface IQueryAdapter {
  user: IUserQuery
  session: ISessionQuery
  app: IAppQuery
  license: ILicenseQuery
  actRecord: IActivationRecordQuery
}
