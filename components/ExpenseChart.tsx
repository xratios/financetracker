'use client'

import { Transaction } from '@/app/page'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseChartProps {
  transactions: Transaction[]
}

const COLORS = ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#fb923c', '#fdba74']

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Calculate expenses by category
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.name === transaction.category)
      if (existing) {
        existing.value += transaction.amount
      } else {
        acc.push({ name: transaction.category, value: transaction.amount })
      }
      return acc
    }, [] as { name: string; value: number }[])

  if (expenseData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No expense data to display</p>
        <p className="text-sm text-gray-400 mt-1">Add some expenses to see the chart</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-orange-600 font-bold">
            {new Intl.NumberFormat('en-MY', {
              style: 'currency',
              currency: 'MYR',
            }).format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
