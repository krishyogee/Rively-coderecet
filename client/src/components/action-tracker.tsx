import { Card } from "@/components/ui/card"
import { Flag, Clock, CheckCircle } from 'lucide-react'

export default function ActionTracker() {
  return (
    <Card className="bg-white border-0 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold">Action Tracker</h2>
        <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <StatusItem
          icon={<Flag className="w-5 h-5 text-red-500" />}
          label="Flagged"
          value={124}
          color="text-red-500"
        />
        <StatusItem
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          label="In progress"
          value={30}
          color="text-orange-500"
        />
        <StatusItem
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          label="Completed"
          value={100}
          color="text-green-500"
        />
      </div>

    </Card>
  )
}

interface StatusItemProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

function StatusItem({ icon, label, value, color }: StatusItemProps) {
  return (
    <div className="text-center space-y-2">
      <div className="flex justify-center">{icon}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

