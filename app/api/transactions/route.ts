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

// Find user by email in InstantDB
// Note: InstantDB auth users might not be directly queryable via useQuery
// Alternative: Accept userId directly in the request, or maintain a user mapping
async function findUserByEmail(email: string): Promise<string | null> {
  try {
    // Option 1: Try to query users (may not work if InstantDB auth users aren't in regular schema)
    // Option 2: Accept userId directly from n8n instead of email
    // Option 3: Maintain a separate user mapping table
    
    // For now, we'll try querying - if this doesn't work, you may need to:
    // - Pass userId directly from n8n instead of email
    // - Or create a user mapping table in InstantDB
    
    // Note: useQuery might not work in server-side API routes
    // This is a limitation - consider using userId directly or a different approach
    const { data } = await db.useQuery({
      users: {
        $: {
          where: { email },
        },
      },
    })
    
    if (data?.users && data.users.length > 0) {
      return data.users[0].id
    }
    
    return null
  } catch (error) {
    console.error('Error finding user by email:', error)
    // If useQuery doesn't work in API routes, you'll need to:
    // 1. Accept userId directly in the request body instead of email
    // 2. Or create a user mapping mechanism
    return null
  }
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

    // Parse request body
    const body = await request.json()
    const { title, amount, type, category, date, userEmail, userId } = body

    // Validate required fields - either userEmail OR userId must be provided
    if (!title || amount === undefined || !type || !category || !date || (!userEmail && !userId)) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['title', 'amount', 'type', 'category', 'date', 'userEmail OR userId'],
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

    // Get userId - either provided directly or lookup by email
    let finalUserId: string | null = userId
    
    if (!finalUserId && userEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format.' },
          { status: 400 }
        )
      }

      // Try to find user by email (may not work - see note in findUserByEmail function)
      finalUserId = await findUserByEmail(userEmail)
      if (!finalUserId) {
        return NextResponse.json(
          { 
            error: 'User not found',
            message: `No user found with email: ${userEmail}. Please provide userId directly or ensure the user exists in InstantDB.`,
            suggestion: 'Consider passing userId directly in the request body instead of userEmail'
          },
          { status: 404 }
        )
      }
    }
    
    if (!finalUserId) {
      return NextResponse.json(
        { error: 'userId is required. Provide either userId or userEmail in the request body.' },
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
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameter: userEmail' },
        { status: 400 }
      )
    }

    // Find user by email
    const userId = await findUserByEmail(userEmail)
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Query transactions for the user
    const { data } = await db.useQuery({
      transactions: {
        $: {
          where: { userId },
        },
      },
    })

    return NextResponse.json(
      { 
        success: true,
        transactions: data?.transactions || [],
        count: data?.transactions?.length || 0
      },
      { status: 200 }
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
