'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@/app/page'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChevronDown } from 'lucide-react'

interface OverviewChartProps {
  transactions: Transaction[]
}

type OverviewType = 'expense' | 'income' | 'balance'

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

export default function OverviewChart({ transactions }: OverviewChartProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [overviewType, setOverviewType] = useState<OverviewType>('expense')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  // Calculate income by category
  const incomeData = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.name === transaction.category)
      if (existing) {
        existing.value += transaction.amount
      } else {
        acc.push({ name: transaction.category, value: transaction.amount })
      }
      return acc
    }, [] as { name: string; value: number }[])

  // Calculate balance data (income vs expenses)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const balanceData = [
    { 
      name: 'Balance', 
      income: totalIncome, 
      expenses: totalExpense,
      balance: balance 
    },
  ]

  const getCurrentData = () => {
    switch (overviewType) {
      case 'expense':
        return expenseData
      case 'income':
        return incomeData
      case 'balance':
        return balanceData
      default:
        return expenseData
    }
  }

  const getOverviewTitle = () => {
    switch (overviewType) {
      case 'expense':
        return 'Expense Overview'
      case 'income':
        return 'Income Overview'
      case 'balance':
        return 'Balance Overview'
      default:
        return 'Expense Overview'
    }
  }

  const getEmptyMessage = () => {
    switch (overviewType) {
      case 'expense':
        return { title: 'No expense data to display', subtitle: 'Add some expenses to see the chart' }
      case 'income':
        return { title: 'No income data to display', subtitle: 'Add some income to see the chart' }
      case 'balance':
        return { title: 'No balance data to display', subtitle: 'Add some transactions to see the chart' }
      default:
        return { title: 'No data to display', subtitle: 'Add some transactions to see the chart' }
    }
  }

  const currentData = getCurrentData()
  const isEmpty = currentData.length === 0 || (overviewType === 'balance' && totalIncome === 0 && totalExpense === 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      if (overviewType === 'balance') {
        // For stacked bar chart, show all segments
        return (
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Balance Overview</p>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="mb-1 last:mb-0">
                <p className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                  }).format(entry.value)}
                </p>
              </div>
            ))}
            <p className={`font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 ${
              balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
            }`}>
              Net Balance: {new Intl.NumberFormat('en-MY', {
                style: 'currency',
                currency: 'MYR',
              }).format(balance)}
            </p>
          </div>
        )
      }
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          <p className={`font-bold ${
            overviewType === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
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

  // Calculate total for percentage calculation (for pie charts)
  const total = overviewType === 'balance' 
    ? Math.max(totalIncome, totalExpense, Math.abs(balance))
    : currentData.reduce((sum, item) => sum + item.value, 0)

  if (isEmpty) {
    const emptyMsg = getEmptyMessage()
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{emptyMsg.title}</p>
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">{emptyMsg.subtitle}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Dropdown Menu */}
      <div className="mb-4 sm:mb-6 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full sm:w-auto min-w-[200px] flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <span className="font-semibold text-gray-900 dark:text-gray-100">{getOverviewTitle()}</span>
          <ChevronDown 
            size={20} 
            className={`text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-full sm:w-auto min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => {
                  setOverviewType('expense')
                  setIsDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  overviewType === 'expense' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Expense Overview
              </button>
              <button
                onClick={() => {
                  setOverviewType('income')
                  setIsDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  overviewType === 'income' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Income Overview
              </button>
              <button
                onClick={() => {
                  setOverviewType('balance')
                  setIsDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  overviewType === 'balance' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                Balance Overview
              </button>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[280px] sm:h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {overviewType === 'balance' ? (
            <BarChart data={balanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={isMobile ? 12 : 14}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                fontSize={isMobile ? 12 : 14}
                tickFormatter={(value) => 
                  new Intl.NumberFormat('en-MY', {
                    style: 'currency',
                    currency: 'MYR',
                    notation: 'compact',
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: '#d1d5db',
                  fontSize: legendFontSize,
                  paddingTop: isMobile ? '10px' : '0'
                }}
                iconSize={iconSize}
                formatter={(value) => {
                  if (value === 'income') return 'Income'
                  if (value === 'expenses') return 'Expenses'
                  return value
                }}
              />
              <Bar dataKey="income" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={60} />
              <Bar dataKey="expenses" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={60} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy={isMobile ? "40%" : "50%"}
                labelLine={false}
                label={CustomLabel}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {currentData.map((entry, index) => (
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
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

