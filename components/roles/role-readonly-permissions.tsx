"use client"

// Read-only grouped badge list — shown to HR_MANAGER or for built-in roles (admin)

const NS_COLORS: Record<string, { badge: string; label: string }> = {
  application: { badge: "bg-violet-50 text-violet-700 ring-violet-200", label: "text-violet-600" },
  job:         { badge: "bg-green-50  text-green-700  ring-green-200",  label: "text-green-600"  },
  hr:          { badge: "bg-orange-50 text-orange-700 ring-orange-200", label: "text-orange-600" },
  skill:       { badge: "bg-yellow-50 text-yellow-700 ring-yellow-200", label: "text-yellow-600" },
  notification:{ badge: "bg-blue-50   text-blue-700   ring-blue-200",   label: "text-blue-600"   },
  candidate:   { badge: "bg-teal-50   text-teal-700   ring-teal-200",   label: "text-teal-600"   },
  interview:   { badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", label: "text-indigo-600" },
  auth:        { badge: "bg-red-50    text-red-700    ring-red-200",    label: "text-red-600"    },
  cv:          { badge: "bg-pink-50   text-pink-700   ring-pink-200",   label: "text-pink-600"   },
  profile:     { badge: "bg-cyan-50   text-cyan-700   ring-cyan-200",   label: "text-cyan-600"   },
  company:     { badge: "bg-amber-50  text-amber-700  ring-amber-200",  label: "text-amber-600"  },
  role:        { badge: "bg-slate-50  text-slate-700  ring-slate-200",  label: "text-slate-600"  },
}
const DEFAULT_NS = { badge: "bg-gray-50 text-gray-700 ring-gray-200", label: "text-gray-500" }

// Show only the action part (after first ":") — namespace is the section heading
const getAction = (p: string) => p.includes(":") ? p.slice(p.indexOf(":") + 1) : p

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
    <div className="space-y-4">
      {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([ns, ps]) => {
        const c = NS_COLORS[ns] ?? DEFAULT_NS
        return (
          <div key={ns}>
            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${c.label}`}>
              {ns}{" "}
              <span className="text-gray-400 font-normal normal-case tracking-normal">({ps.length})</span>
            </p>
            <div className="flex flex-wrap gap-1.5 mx-1 my-1">
              {ps.map(p => (
                <span key={p} title={p}
                  className={`rounded px-2 py-0.5 text-xs font-mono font-medium ring-1 ${c.badge}`}>
                  {getAction(p)}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
