import { TopHorizontalBarChart } from "@/components/dashboard/shared/top-horizontal-bar-chart"
import type { TopSkill } from "@/types/dashboard"

interface AdminTopSkillsSectionProps {
  skills: TopSkill[]
}

export function AdminTopSkillsSection({ skills }: AdminTopSkillsSectionProps) {
  const data = skills.map((s) => ({ name: s.skillName, value: s.jobCount }))

  return (
    <TopHorizontalBarChart
      data={data}
      title="Top skills in demand"
      valueLabel="jobs"
      maxItems={9}
      color="#7c5cbf"
    />
  )
}
