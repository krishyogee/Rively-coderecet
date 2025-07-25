import { Card } from "@/components/ui/card"

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  total?: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function StatsCard({ icon, title, total, subtitle, className, onClick }: StatsCardProps) {
  return (
    <Card
      className={`bg-white/10 border-0 p-4 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between h-full">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
              {icon}
            <span className="text-sm font-medium text-black-200">{title}</span>
          </div>
          {total && (
            <div className="text-2xl font-bold">{total}</div>
          )}
          {subtitle && (
            <div className="text-sm text-gray-400">{subtitle}</div>
          )}
        </div>
      </div>
    </Card>
  )
}

