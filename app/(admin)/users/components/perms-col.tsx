import { UserPerms, permRscAll } from "@/lib/permit/permission"
import { Badge } from "@/sdui/ui/badge"

interface PermsColProps {
  permissions: UserPerms
}

export default function PermsCol({ permissions: perms }: PermsColProps) {
  const isAdmin = perms.some(
    (perm) => perm.obj === permRscAll && perm.act === permRscAll,
  )

  if (isAdmin) {
    return (
      <div>
        <Badge>Admin</Badge>
      </div>
    )
  }

  return (
    <div>
      {perms.map((perm) => {
        return (
          <Badge key={`${perm.obj}:${perm.act}`}>
            {perm.obj}/{perm.act}
          </Badge>
        )
      })}
    </div>
  )
}
