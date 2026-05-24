"use client"

// Read-only grouped badge list for HR_MANAGER view of a role's permissions
interface ReadOnlyPermissionsProps {
  perms: string[]
}

export function ReadOnlyPermissions({ perms }: ReadOnlyPermissionsProps) {
  if (perms.length === 0)
    return <p className="text-sm text-gray-400 py-4 text-center">No permissions assigned.</p>

  const groups = perms.reduce<Record<string, string[]>>((acc, p) => {
    const ns = p.includes(":") ? p.split(":")[0] : "general"
    acc[ns] = acc[ns] ? [...acc[ns], p] : [p]
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([ns, ps]) => (
        <div key={ns}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            {ns}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ps.map((p) => (
              <span
                key={p}
                className="rounded bg-blue-50 px-2 py-0.5 text-xs font-mono font-medium text-blue-700 ring-1 ring-blue-200"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
