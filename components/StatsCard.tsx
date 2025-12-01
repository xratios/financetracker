import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  amount: number
  icon: LucideIcon
  gradient: string
}

export default function StatsCard({ title, amount, icon: Icon, gradient }: StatsCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount)
  }

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg card-hover`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-orange-100 text-xs sm:text-sm font-medium uppercase tracking-wide truncate flex-1 pr-2">
          {title}
        </h3>
        <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg flex-shrink-0">
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold break-words">{formatAmount(amount)}</p>
    </div>
  )
}
