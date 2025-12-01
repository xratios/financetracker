'use client'

import { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, LogOut, Loader2 } from 'lucide-react'
import { id, tx } from '@instantdb/react'
import TransactionList from '@/components/TransactionList'
import TransactionForm from '@/components/TransactionForm'
import StatsCard from '@/components/StatsCard'
import OverviewChart from '@/components/OverviewChart'
import Auth from '@/components/Auth'
import { db } from '@/lib/instant'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  userId: string
}

export default function Home() {
  const { user, isLoading: authLoading } = db.useAuth()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [error, setError] = useState<string | null>(null)

  // Query transactions - permissions will filter by userId on the server side
  const { data, isLoading: dataLoading, error: queryError } = db.useQuery({
    transactions: {},
  })

  // Debug logging
  if (user && data) {
    console.log('Query data:', data)
    console.log('User ID:', user.id)
    console.log('All transactions:', data?.transactions)
    console.log('Transactions count:', data?.transactions?.length || 0)
  }
  if (queryError) {
    console.error('Query error:', queryError)
  }

  // Map InstantDB data to Transaction format, converting dates to strings
  // Filter by userId on client side as well for security (permissions should also enforce this)
  const allTransactions = (data?.transactions || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date instanceof Date ? t.date.toISOString().split('T')[0] : (typeof t.date === 'string' ? t.date : new Date(t.date).toISOString().split('T')[0]),
    userId: t.userId,
  }))

  // Filter by userId - CRITICAL for security
  const transactions: Transaction[] = user 
    ? allTransactions.filter(t => t.userId === user.id)
    : []

  // Show auth screen if not authenticated
  if (!authLoading && !user) {
    return <Auth />
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) {
      setError('You must be logged in to add transactions')
      return
    }

    try {
      setError(null)
      db.transact(
        tx.transactions[id()].update({
          ...transaction,
          date: new Date(transaction.date), // Convert string to Date object
          userId: user.id, // CRITICAL - permission rules enforce this
        })
      )
      setShowForm(false)
    } catch (err) {
      setError('Failed to add transaction. Please try again.')
      console.error('Error adding transaction:', err)
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (!user) {
      setError('You must be logged in to delete transactions')
      return
    }

    try {
      setError(null)
      db.transact(tx.transactions[transactionId].delete())
    } catch (err) {
      setError('Failed to delete transaction. Please try again.')
      console.error('Error deleting transaction:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await db.auth.signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
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

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-cyan-600" size={48} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-orange text-white shadow-lg dark:shadow-2xl">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">Finance Tracker</h1>
              <p className="text-orange-100 dark:text-orange-200 mt-1 text-sm sm:text-base">Manage your money with confidence</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {user && (
                <div className="text-xs sm:text-sm text-orange-100 dark:text-orange-200 truncate max-w-[120px] sm:max-w-none hidden sm:block">
                  {user.email || 'User'}
                </div>
              )}
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 sm:gap-2 border border-white/30 dark:border-white/20 text-sm sm:text-base touch-manipulation"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center border border-white/30 dark:border-white/20 touch-manipulation min-w-[44px]"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 my-auto animate-in fade-in zoom-in max-h-[95vh] overflow-y-auto">
              <TransactionForm
                onSubmit={addTransaction}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover">
              <OverviewChart transactions={transactions} />
            </div>
          </div>

          {/* Transactions Section */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold gradient-text">Transactions</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px] ${
                      filter === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('income')}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px] ${
                      filter === 'income'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setFilter('expense')}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[44px] ${
                      filter === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
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
