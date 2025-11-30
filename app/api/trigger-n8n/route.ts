import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { 
          error: 'N8N_WEBHOOK_URL not configured',
          message: 'Please set N8N_WEBHOOK_URL environment variable with your n8n webhook URL'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    
    // Forward the request to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', response.status, errorText)
      return NextResponse.json(
        { error: 'n8n webhook failed', details: errorText },
        { status: response.status }
      )
    }

    const result = await response.json().catch(() => ({}))
    return NextResponse.json({ success: true, result }, { status: 200 })
  } catch (error: any) {
    console.error('n8n trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger n8n workflow', message: error.message },
      { status: 500 }
    )
  }
}

