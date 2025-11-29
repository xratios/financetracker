'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import StatsCard from '@/components/StatsCard'
import ExpenseChart from '@/components/ExpenseChart'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  // Load transactions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, [])

  // Save transactions to localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    setTransactions([newTransaction, ...transactions])
    setShowForm(false)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  )

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-orange text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Finance Tracker</h1>
              <p className="text-orange-100 mt-1">Manage your money with confidence</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 border border-white/30"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Balance"
            amount={balance}
            icon={Wallet}
            gradient="from-orange-500 to-orange-600"
          />
          <StatsCard
            title="Total Income"
            amount={totalIncome}
            icon={TrendingUp}
            gradient="from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Total Expenses"
            amount={totalExpense}
            icon={TrendingDown}
            gradient="from-red-500 to-rose-600"
          />
        </div>

        {/* Transaction Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in">
              <TransactionForm
                onSubmit={addTransaction}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-2xl p-6 card-hover">
              <h2 className="text-2xl font-bold gradient-text mb-6">Expense Overview</h2>
              <ExpenseChart transactions={transactions} />
            </div>
          </div>

          {/* Transactions Section */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Transactions</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      filter === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('income')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      filter === 'income'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setFilter('expense')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      filter === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <TransactionList
                transactions={filteredTransactions}
                onDelete={deleteTransaction}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
