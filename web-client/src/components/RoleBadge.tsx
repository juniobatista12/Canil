import { Badge } from '@/components/ui/badge'

const roleVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  SuperAdmin: 'default',
  Admin: 'secondary',
  User: 'outline',
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant={roleVariants[role] ?? 'outline'}>{role}</Badge>
}

export function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
    </div>
  )
}
