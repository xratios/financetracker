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
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg card-hover`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-orange-100 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
          <Icon size={24} />
        </div>
      </div>
      <p className="text-3xl font-bold">{formatAmount(amount)}</p>
    </div>
  )
}
