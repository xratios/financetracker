'use client'

import { Transaction } from '@/app/page'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseChartProps {
  transactions: Transaction[]
}

const COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
]

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
        <p className="text-gray-500 dark:text-gray-400">No expense data to display</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add some expenses to see the chart</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-orange-600 dark:text-orange-400 font-bold">
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
          <Legend 
            wrapperStyle={{ color: '#d1d5db' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
