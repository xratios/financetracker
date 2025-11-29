'use client'

import { useState } from 'react'
import { Mail, Loader2, KeyRound, ArrowLeft } from 'lucide-react'
import { db } from '@/lib/instant'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage('Please enter your email address')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      await db.auth.sendMagicCode({ email })
      setCodeSent(true)
      setMessage('Check your email for the 6-digit verification code!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send verification code. Please try again.'
      setMessage(errorMessage)
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length !== 6) {
      setMessage('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      await db.auth.signInWithMagicCode({ email, code })
      // If successful, the user will be automatically signed in and the component will re-render
      setMessage('Signing you in...')
    } catch (error: any) {
      const errorMessage = error?.message || 'Invalid verification code. Please try again.'
      setMessage(errorMessage)
      console.error('Verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setCodeSent(false)
    setCode('')
    setMessage('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full p-8 border border-cyan-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Finance Tracker
          </h1>
          <p className="text-gray-600">
            {codeSent ? 'Enter verification code' : 'Sign in to access your transactions'}
          </p>
        </div>

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white/50"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('Check your email')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Verification Code
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(value)
                  }}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white/50 text-center text-2xl font-mono tracking-widest"
                  required
                  disabled={isLoading}
                  maxLength={6}
                  autoFocus
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('Check your email') || message.includes('Signing you in')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-3 border border-cyan-200 text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound size={20} />
                    Verify Code
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {!codeSent && (
          <p className="mt-6 text-center text-sm text-gray-500">
            We'll send you a verification code to sign in. No password needed!
          </p>
        )}
      </div>
    </div>
  )
}

