"use client"

import ScrollBox from "@/app/_components/scroll-box"
import { useAppList } from "@/app/_hooks/app"
import {
  Perm,
  PermAct,
  UserPerms,
  actMapper,
  formateAppArRsc,
  formateAppLcsRsc,
  permActAll,
  permActC,
  permActR,
  permActRk,
  permActW,
  permRscAll,
  permRscApp,
  permRscUser,
} from "@/lib/permit/permission"
import { Checkbox } from "@/sdui/ui/checkbox"
import { Label } from "@/sdui/ui/label"

interface PermsSelectProps {
  username: string
  permissions: UserPerms
  onChange: (perms: UserPerms) => void
}

type SimplePerm = Omit<Perm, "sub">

export default function PermsSelect({
  username,
  permissions,
  onChange,
}: PermsSelectProps) {
  const { data: apps } = useAppList()
  const isAdmin = permissions.some(
    (perm) => perm.act === permActAll && perm.obj === permRscAll,
  )

  const handleChange = (perms: SimplePerm[]) => {
    onChange(perms.map((perm) => ({ ...perm, sub: username })))
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2 pl-2 border-l border-slate-600">
        <PermCheckbox
          obj={permRscAll}
          act={permActAll}
          perms={permissions}
          onChange={handleChange}
        />
      </div>
      {isAdmin ? null : (
        <div className="flex flex-col space-y-2 pl-2 border-l border-slate-600">
          <span>User:</span>
          <div className="flex space-x-4 pl-2">
            <PermCheckbox
              obj={permRscUser}
              act={permActR}
              perms={permissions}
              onChange={handleChange}
            />
            <PermCheckbox
              obj={permRscUser}
              act={permActW}
              perms={permissions}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
      {isAdmin ? null : (
        <ScrollBox className="max-h-40 flex flex-col space-y-2">
          {apps?.map((app) => (
            <AppPermission
              key={app.name}
              app={app.name}
              perms={permissions}
              onChange={handleChange}
            />
          ))}
        </ScrollBox>
      )}
    </div>
  )
}

interface PermCheckboxProps {
  obj: string
  act: PermAct
  perms: SimplePerm[]
  onChange: (newVal: SimplePerm[]) => void
}

function PermCheckbox({ obj, act, perms, onChange }: PermCheckboxProps) {
  const permStr = `${obj},${act}`
  const permStrView = `${obj},${permActR}`
  const permStrRk = `${obj},${permActRk}`

  const permsSet = new Set(perms.map((perm) => `${perm.obj},${perm.act}`))
  const isChecked = permsSet.has(permStr)
  let disabled = false
  // if current perm is view, and has other perms, then view is disabled and checked
  if (act === permActR && perms.some((p) => p.obj === obj && p.act !== act)) {
    disabled = true
  }
  // if current perm is remark, and has edit perms, then remark is checked and disabled
  if (
    act === permActRk &&
    perms.some((p) => p.obj === obj && p.act === permActW)
  ) {
    disabled = true
  }

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      permsSet.add(permStr)
      // if current act is not view and didn't have view perm, then add view perm
      if (
        act !== permActR &&
        act !== permActAll &&
        !permsSet.has(permStrView)
      ) {
        permsSet.add(permStrView)
      }
      // if current act is edit and didn't have remark perm and obj start with app, then add remark perm
      if (
        act === permActW &&
        obj.startsWith(permRscApp) &&
        !permsSet.has(permStrRk)
      ) {
        permsSet.add(permStrRk)
      }
    } else {
      permsSet.delete(permStr)
    }

    onChange(
      Array.from(permsSet).map((perm) => {
        const [obj, act] = perm.split(",")
        return { obj, act: act as PermAct }
      }),
    )
  }

  return (
    <div className="flex space-x-1 items-center">
      <Label htmlFor={permStr}>
        {obj == permRscAll && act == permActAll ? "Admin" : actMapper[act]}
      </Label>
      <Checkbox
        id={permStr}
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

interface AppPermissionProps {
  app: string
  perms: SimplePerm[]
  onChange: (perms: SimplePerm[]) => void
}

function AppPermission({ app, perms, onChange }: AppPermissionProps) {
  const lcsRsc = formateAppLcsRsc(app)
  const arRsc = formateAppArRsc(app)

  return (
    <div className="pl-2 flex-col space-y-1 border-l border-slate-600">
      <div>App/{app}:</div>
      <div className="pl-2 flex space-x-2 space-y-0 items-center">
        <span className="text-sm leading-none font-medium">License:</span>
        <div className="flex space-x-2">
          <PermCheckbox
            obj={lcsRsc}
            act={permActR}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={lcsRsc}
            act={permActW}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={lcsRsc}
            act={permActC}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={lcsRsc}
            act={permActRk}
            perms={perms}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="pl-2 flex space-x-2 space-y-0 items-center">
        <span className="text-sm leading-none font-medium">Act Record:</span>
        <div className="flex space-x-2">
          <PermCheckbox
            obj={arRsc}
            act={permActR}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={arRsc}
            act={permActW}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={arRsc}
            act={permActC}
            perms={perms}
            onChange={onChange}
          />
          <PermCheckbox
            obj={arRsc}
            act={permActRk}
            perms={perms}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  )
}
