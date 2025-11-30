import { NextRequest, NextResponse } from 'next/server'
import { init, tx, id } from '@instantdb/admin'

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '94508c4b-4dfd-4f93-bf97-e7f0d362d5e2'
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN

// Initialize InstantDB Admin SDK for server-side operations
const db = ADMIN_TOKEN ? init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
}) : null

// Validate API key
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || 
                 request.headers.get('Authorization')?.replace('Bearer ', '')
  const expectedApiKey = process.env.API_KEY
  
  if (!expectedApiKey) {
    console.error('API_KEY environment variable is not set')
    return false
  }
  
  return apiKey === expectedApiKey
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    // Check if Admin SDK is configured
    if (!db || !ADMIN_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: 'InstantDB Admin SDK is not configured. Please set INSTANT_ADMIN_TOKEN environment variable.',
          instructions: [
            '1. Go to your InstantDB dashboard',
            '2. Generate an Admin Token',
            '3. Set INSTANT_ADMIN_TOKEN in your environment variables'
          ]
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { title, amount, type, category, date, userId } = body

    // Validate required fields
    if (!title || amount === undefined || !type || !category || !date || !userId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['title', 'amount', 'type', 'category', 'date', 'userId'],
          received: Object.keys(body)
        },
        { status: 400 }
      )
    }

    // Validate data types and values
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      )
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "income" or "expense".' },
        { status: 400 }
      )
    }

    // Validate userId is provided and is a string
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { 
          error: 'userId is required',
          message: 'Please provide userId directly in the request body.',
          example: { userId: 'user-id-from-instantdb' },
          note: 'You can find your userId by checking the browser console after logging into the web app.'
        },
        { status: 400 }
      )
    }

    // Parse and validate date
    const transactionDate = new Date(date)
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format.' },
        { status: 400 }
      )
    }

    // Create transaction using InstantDB Admin SDK
    try {
      const transactionId = id()
      
      // Use Admin SDK to transact
      await db.transact(
        tx.transactions[transactionId].update({
          title: title.trim(),
          amount: numAmount,
          type,
          category: category.trim(),
          date: transactionDate.toISOString(),
          userId: userId,
          createdAt: new Date().toISOString(),
        })
      )

      console.log('Transaction created successfully:', transactionId)

      return NextResponse.json(
        { 
          success: true,
          message: 'Transaction created successfully',
          transactionId,
          transaction: {
            id: transactionId,
            title: title.trim(),
            amount: numAmount,
            type,
            category: category.trim(),
            date: transactionDate.toISOString().split('T')[0],
            userId: userId,
          }
        },
        { status: 201 }
      )
    } catch (dbError: any) {
      console.error('InstantDB transaction error:', dbError)
      
      return NextResponse.json(
        {
          error: 'Failed to create transaction in InstantDB',
          message: dbError.message || 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create transaction',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve transactions (for testing/debugging)
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    // Check if Admin SDK is configured
    if (!db || !ADMIN_TOKEN) {
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: 'InstantDB Admin SDK is not configured.'
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      )
    }

    // Query transactions using Admin SDK
    try {
      const result = await db.query({
        transactions: {
          $: {
            where: { userId }
          }
        }
      })

      return NextResponse.json(
        {
          success: true,
          transactions: result?.transactions || [],
          count: result?.transactions?.length || 0
        },
        { status: 200 }
      )
    } catch (queryError: any) {
      console.error('Query error:', queryError)
      return NextResponse.json(
        {
          error: 'Failed to query transactions',
          message: queryError.message || 'Query operation failed'
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
