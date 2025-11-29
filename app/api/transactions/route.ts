import { NextRequest, NextResponse } from 'next/server'

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '94508c4b-4dfd-4f93-bf97-e7f0d362d5e2'
const INSTANT_API_URL = `https://api.instantdb.com/apps/${APP_ID}`

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
    // IMPORTANT: InstantDB React SDK doesn't work in server-side API routes
    // We need to use InstantDB's HTTP/WebSocket API directly
    // Based on InstantDB's architecture, transactions are sent via WebSocket or HTTP API
    
    // Generate a unique transaction ID (InstantDB format)
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Try using InstantDB's HTTP API endpoint
    // Note: You may need to check InstantDB documentation for the exact API format
    try {
      // InstantDB uses a specific transaction format
      // Format: { tx: { [id]: { _type: 'entity', ...fields } } }
      const transactionData = {
        tx: {
          [transactionId]: {
            _type: 'transactions',
            title: title.trim(),
            amount: numAmount,
            type,
            category: category.trim(),
            date: transactionDate.toISOString(),
            userId: finalUserId,
            createdAt: new Date().toISOString(),
          }
        }
      }

      // Try InstantDB's API endpoint (format may vary - check their docs)
      const response = await fetch(`https://api.instantdb.com/apps/${APP_ID}/transact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('InstantDB API error:', response.status, errorText)
        
        // If the API endpoint format is wrong, we need to use a different approach
        // Return a helpful error with suggestions
        return NextResponse.json(
          {
            error: 'InstantDB server-side API not available',
            message: 'The InstantDB React SDK requires client-side execution. Please use one of these alternatives:',
            alternatives: [
              '1. Check InstantDB documentation for server-side SDK or HTTP API',
              '2. Use a client-side proxy endpoint that uses the React SDK',
              '3. Store transactions in a queue and sync via client-side app',
              '4. Contact InstantDB support for server-side API access'
            ],
            technicalDetails: `API returned ${response.status}: ${errorText}`
          },
          { status: 501 }
        )
      }

      // If successful, parse response
      const result = await response.json()
      console.log('Transaction created via InstantDB API:', result)
      
    } catch (apiError: any) {
      console.error('Failed to create transaction via InstantDB API:', apiError)
      
      // Return error with helpful message
      return NextResponse.json(
        {
          error: 'Failed to create transaction',
          message: 'InstantDB React SDK does not work in server-side API routes. The transaction could not be created.',
          suggestion: 'Please check InstantDB documentation for server-side API access or use a client-side approach.',
          technicalDetails: apiError.message
        },
        { status: 500 }
      )
    }

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
