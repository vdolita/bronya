import { ActivationRecord, License } from "@/lib/schemas"
import { PageOffset, Pager } from "../meta"
import { ClientApp } from "../schemas/app"
import { Session } from "../schemas/session"
import { User } from "../schemas/user"

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
  all(): Promise<Array<ClientApp>>
  find(app: string): Promise<ClientApp | null>
  create(app: ClientApp): Promise<ClientApp>
  update(app: string, data: AppUpdate): Promise<ClientApp>
}

// session
export interface ISessionQuery {
  create(ssid: string, username: string, exp: Date): Promise<Session>
  find(ssid: string): Promise<Session | null>
}

// user
export interface IUserQuery {
  find(username: string): Promise<User | null>
}

// licenses
export interface ILicenseQuery {
  createMulti(sample: Omit<License, "key">, keys: string[]): Promise<number>
  find(key: string): Promise<License | null>
  findMulti(
    app: string,
    createdAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<License>, Offset]>
  findInRange(
    app: string,
    from: Date | undefined,
    to: Date | undefined
  ): AsyncGenerator<Array<License>, void>
  update(key: string, data: LicenseUpdate): Promise<License>
}

// activation records
export interface IActivationRecordQuery {
  /**
   * createArAndDeduct will create an activation record and deduct the license
   */
  createAndDeduct(ar: ActivationRecord): Promise<ActivationRecord>
  find(key: string, identityCode: string): Promise<ActivationRecord | null>
  findMulti(
    key: string,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  /** get activation records by app and activated at */
  findByAct(
    app: string,
    activatedAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  /** get activation records by app and expire at */
  findByExp(
    app: string,
    expireAt: Date | undefined,
    asc: boolean,
    pager: Pager
  ): Promise<[Array<ActivationRecord>, Offset]>
  findInRange(
    app: string,
    from: Date | undefined,
    to: Date | undefined
  ): AsyncGenerator<Array<ActivationRecord>, void>
  update(key: string, idCode: string, data: ArUpdate): Promise<ActivationRecord>
}

export interface IQueryAdapter {
  user: IUserQuery
  app: IAppQuery
  license: ILicenseQuery
  actRecord: IActivationRecordQuery
}
