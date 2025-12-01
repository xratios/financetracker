'use client'

import { useState, useEffect } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No expense data to display</p>
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Add some expenses to see the chart</p>
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

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isMobile ? '10px' : '12px'}
        fontWeight="500"
        className="dark:fill-gray-300"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const outerRadius = isMobile ? 70 : 100
  const legendFontSize = isMobile ? '12px' : '14px'
  const iconSize = isMobile ? 10 : 14

  // Calculate total for percentage calculation
  const total = expenseData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full h-[280px] sm:h-[300px] md:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy={isMobile ? "40%" : "50%"}
            labelLine={false}
            label={CustomLabel}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: '#d1d5db',
              fontSize: legendFontSize,
              paddingTop: isMobile ? '10px' : '0'
            }}
            iconSize={iconSize}
            verticalAlign={isMobile ? "bottom" : undefined}
            align="center"
            formatter={(value, entry: any) => {
              if (!entry || !entry.payload) return value
              const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : '0'
              return `${value} ${percent}%`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
