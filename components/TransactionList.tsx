'use client'

import { Trash2, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'
import { Transaction } from '@/app/page'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Wallet size={48} className="mx-auto opacity-50" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first transaction to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto -mx-2 sm:-mx-0 px-2 sm:px-0">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-600 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  transaction.type === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpCircle size={18} className="sm:w-5 sm:h-5" />
                ) : (
                  <ArrowDownCircle size={18} className="sm:w-5 sm:h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {transaction.title}
                </h3>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span
                className={`font-bold text-sm sm:text-base ${
                  transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount)}
              </span>
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Delete transaction"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
