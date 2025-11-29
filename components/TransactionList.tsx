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
        <div className="text-gray-400 mb-4">
          <Wallet size={48} className="mx-auto opacity-50" />
        </div>
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400 mt-1">Add your first transaction to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div
                className={`p-2 rounded-lg ${
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpCircle size={20} />
                ) : (
                  <ArrowDownCircle size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {transaction.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{transaction.category}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatAmount(transaction.amount)}
              </span>
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                aria-label="Delete transaction"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
