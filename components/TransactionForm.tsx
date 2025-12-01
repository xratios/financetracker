'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Transaction } from '@/app/page'

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'userId'>) => void
  onCancel: () => void
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
}

export default function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.amount || !formData.category) {
      alert('Please fill in all fields')
      return
    }
    onSubmit({
      title: formData.title,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
    })
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Add Transaction</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-manipulation p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, type: 'income', category: '' })
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all touch-manipulation min-h-[44px] text-sm sm:text-base ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, type: 'expense', category: '' })
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all touch-manipulation min-h-[44px] text-sm sm:text-base ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-w-full box-border"
            placeholder="Enter transaction title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-w-full box-border"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-w-full box-border"
            required
          >
            <option value="">Select a category</option>
            {categories[formData.type].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all max-w-full box-border"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all touch-manipulation min-h-[44px] text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-gradient-orange text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg touch-manipulation min-h-[44px] text-sm sm:text-base"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  )
}
