import { NextRequest, NextResponse } from 'next/server'
import { init, tx, id } from '@instantdb/react'

// Initialize InstantDB (same as client-side)
const db = init({ 
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID || '94508c4b-4dfd-4f93-bf97-e7f0d362d5e2' 
})

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

// Note: Email lookup is not supported in API routes because InstantDB React SDK's useQuery
// is a React hook and doesn't work in server-side API routes.
// Users must provide userId directly in the request body.

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
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
          message: 'Please provide userId directly in the request body. Email lookup is not supported in API routes.',
          example: { userId: 'user-id-from-instantdb' },
          note: 'You can find your userId by checking the browser console after logging into the web app, or by querying InstantDB directly.'
        },
        { status: 400 }
      )
    }
    
    const finalUserId = userId

    // Parse and validate date
    const transactionDate = new Date(date)
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format.' },
        { status: 400 }
      )
    }

    // Create transaction in InstantDB
    const transactionId = id()
    await db.transact(
      tx.transactions[transactionId].update({
        title: title.trim(),
        amount: numAmount,
        type,
        category: category.trim(),
        date: transactionDate,
        userId: finalUserId,
        createdAt: new Date(),
      })
    )

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
          userId: finalUserId,
        }
      },
      { status: 201 }
    )
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

// Optional: GET endpoint to retrieve transactions (for testing)
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
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

    // Note: useQuery doesn't work in server-side API routes
    // This GET endpoint is disabled - use the client-side query instead
    // For API access, consider implementing a different approach or removing this endpoint
    return NextResponse.json(
      { 
        error: 'GET endpoint not fully supported',
        message: 'useQuery does not work in server-side API routes. Please use the web app to query transactions.',
        note: 'This endpoint may be removed in a future version.'
      },
      { status: 501 }
    )
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
