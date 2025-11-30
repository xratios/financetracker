# Finance Tracker REST API Documentation

## Overview

This API allows external services (like n8n workflows) to create and retrieve transactions in the Finance Tracker application via REST endpoints.

## Base URL

- **Production**: `https://your-app.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

All endpoints require an API key for authentication. Include the API key in one of the following ways:

### Option 1: X-API-Key Header (Recommended)
```
X-API-Key: your-api-key-here
```

### Option 2: Authorization Bearer Token
```
Authorization: Bearer your-api-key-here
```

**Note**: Set the `API_KEY` environment variable in your deployment to configure the API key.

## Endpoints

### POST /api/transactions

Create a new transaction.

#### Request

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: <your-api-key>` (or `Authorization: Bearer <your-api-key>`)

**Body:**
```json
{
  "title": "Groceries",
  "amount": 50.00,
  "type": "expense",
  "category": "Food",
  "date": "2024-01-15",
  "userEmail": "user@example.com"
}
```

**Alternative (Recommended):** Pass `userId` directly instead of `userEmail`:
```json
{
  "title": "Groceries",
  "amount": 50.00,
  "type": "expense",
  "category": "Food",
  "date": "2024-01-15",
  "userId": "user-id-from-instantdb"
}
```

**Field Descriptions:**
- `title` (string, required): Transaction title/description
- `amount` (number, required): Transaction amount (must be positive)
- `type` (string, required): Either "income" or "expense"
- `category` (string, required): Transaction category (e.g., "Food", "Transport", "Salary")
- `date` (string, required): Date in YYYY-MM-DD format
- `userEmail` (string, optional): Email of the user who owns this transaction (will try to lookup userId)
- `userId` (string, optional but recommended): Direct InstantDB user ID (more reliable than email lookup)

**Note**: Either `userEmail` OR `userId` must be provided. Using `userId` directly is recommended as email lookup may not work reliably in server-side API routes.

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transactionId": "abc123xyz",
  "transaction": {
    "id": "abc123xyz",
    "title": "Groceries",
    "amount": 50,
    "type": "expense",
    "category": "Food",
    "date": "2024-01-15",
    "userId": "user-id-123"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing or invalid fields
```json
{
  "error": "Missing required fields",
  "required": ["title", "amount", "type", "category", "date", "userEmail"],
  "received": ["title", "amount"]
}
```

**401 Unauthorized** - Invalid or missing API key
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

**404 Not Found** - User not found
```json
{
  "error": "User not found",
  "message": "No user found with email: user@example.com. Please ensure the user exists in InstantDB."
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to create transaction",
  "message": "Error details here"
}
```

---

### GET /api/transactions

Retrieve transactions for a specific user.

#### Request

**Headers:**
- `X-API-Key: <your-api-key>` (or `Authorization: Bearer <your-api-key>`)

**Query Parameters:**
- `userEmail` (string, required): Email of the user whose transactions to retrieve

**Example:**
```
GET /api/transactions?userEmail=user@example.com
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "transactions": [
    {
      "id": "abc123",
      "title": "Groceries",
      "amount": 50,
      "type": "expense",
      "category": "Food",
      "date": "2024-01-15",
      "userId": "user-id-123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### Error Responses

Same as POST endpoint (401, 404, 500)

---

## Example Usage

### Using cURL

**Create Transaction:**
```bash
curl -X POST https://your-app.vercel.app/api/transactions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "title": "Salary",
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2024-01-15",
    "userEmail": "user@example.com"
  }'
```

**Get Transactions:**
```bash
curl -X GET "https://your-app.vercel.app/api/transactions?userEmail=user@example.com" \
  -H "X-API-Key: your-api-key-here"
```

### Using JavaScript/Fetch

```javascript
// Create transaction
const response = await fetch('https://your-app.vercel.app/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    title: 'Groceries',
    amount: 50.00,
    type: 'expense',
    category: 'Food',
    date: '2024-01-15',
    userEmail: 'user@example.com'
  })
});

const data = await response.json();
console.log(data);
```

### Using n8n HTTP Request Node

1. **Method**: POST
2. **URL**: `https://your-app.vercel.app/api/transactions`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `{{ $env.API_KEY }}` (or hardcode your key)
4. **Body** (JSON):
   ```json
   {
     "title": "{{ $json.title }}",
     "amount": {{ $json.amount }},
     "type": "{{ $json.type }}",
     "category": "{{ $json.category }}",
     "date": "{{ $json.date }}",
     "userEmail": "{{ $json.userEmail }}"
   }
   ```

## Integration with n8n

### Option 1: n8n → Next.js (Create Transactions)

**Workflow:**
1. **n8n Webhook** receives data (from Telegram, email, API, etc.)
2. **n8n AI Agent/Function Node** parses and extracts:
   - Transaction details (title, amount, type, category)
   - User ID (from user mapping or context)
   - Date (current date or parsed from input)
3. **n8n HTTP Request Node** sends POST request to `/api/transactions`
4. **Next.js API** validates, authenticates, and saves transaction to InstantDB using Admin SDK
5. **InstantDB** syncs transaction to all connected clients in real-time
6. **n8n** (optional) sends confirmation back to user

**n8n Workflow Setup:**
1. Add a **Webhook** trigger node (or any other trigger)
2. Add an **HTTP Request** node:
   - Method: `POST`
   - URL: `https://your-app.vercel.app/api/transactions` (or `http://localhost:3000/api/transactions` for dev)
   - Authentication: Header Auth
     - Name: `X-API-Key`
     - Value: `{{ $env.API_KEY }}` (or hardcode your API key)
   - Headers:
     - `Content-Type`: `application/json`
   - Body (JSON):
     ```json
     {
       "title": "{{ $json.title }}",
       "amount": {{ $json.amount }},
       "type": "{{ $json.type }}",
       "category": "{{ $json.category }}",
       "date": "{{ $json.date || $now.toISOString().split('T')[0] }}",
       "userId": "{{ $json.userId }}"
     }
     ```

### Option 2: Next.js → n8n (Trigger Automations)

**Workflow:**
1. User creates transaction in Next.js app
2. Next.js calls `/api/trigger-n8n` endpoint
3. Endpoint forwards data to n8n webhook
4. n8n processes workflow (send email, notification, etc.)

**Usage in your Next.js code:**
```typescript
// After creating a transaction
await fetch('/api/trigger-n8n', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'transaction_created',
    transaction: { ...transactionData },
    userId: user.id
  })
})
```

## Environment Variables

Set these in your `.env.local` file (for local development) and in your Vercel project settings (for production):

### Required Variables

- `NEXT_PUBLIC_INSTANT_APP_ID`: Your InstantDB app ID
  - Get from: https://instantdb.com/dash
  - Example: `94508c4b-4dfd-4f93-bf97-e7f0d362d5e2`

- `INSTANT_ADMIN_TOKEN`: Your InstantDB Admin Token (for server-side operations)
  - Generate from your InstantDB dashboard
  - Required for the API routes to write to InstantDB

- `API_KEY`: Your secret API key for authenticating requests from n8n
  - Use a strong, random string
  - Generate with: `openssl rand -hex 32` or any secure random generator

### Optional Variables

- `N8N_WEBHOOK_URL`: Your n8n webhook URL (for triggering n8n workflows from Next.js)
  - Get this from your n8n workflow webhook node
  - Example: `https://your-n8n-instance.com/webhook/abc123`

### Example `.env.local` file:

```env
NEXT_PUBLIC_INSTANT_APP_ID=your-instantdb-app-id
INSTANT_ADMIN_TOKEN=your-instantdb-admin-token
API_KEY=your-secret-api-key-here
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

## Security Notes

1. **Never commit API keys** to version control
2. **Use HTTPS** in production (Vercel provides this automatically)
3. **Rate limiting** should be added for production use
4. **User validation** ensures users can only create transactions for themselves (enforced by InstantDB permissions)

## Troubleshooting

### User Not Found Error
- Ensure the user has signed up via the web app first
- Verify the email matches exactly (case-sensitive)
- Check that the user exists in your InstantDB dashboard

### API Key Issues
- Verify `API_KEY` is set in your environment variables
- Check that the header name matches (`X-API-Key` or `Authorization`)
- Ensure there are no extra spaces in the API key

### Transaction Not Appearing
- Check InstantDB dashboard to verify transaction was created
- Verify `userId` matches the user's ID in InstantDB
- Check browser console for any client-side errors

### InstantDB Admin SDK Not Configured Error
- Ensure `INSTANT_ADMIN_TOKEN` is set in your environment variables
- Generate the Admin Token from your InstantDB dashboard
- Restart your development server after adding the token
- For production, add the token to your Vercel environment variables

### n8n Webhook Not Working
- Verify the `N8N_WEBHOOK_URL` is correct (if using Next.js → n8n flow)
- Check n8n workflow is active and webhook node is listening
- Test the webhook URL directly with a tool like Postman or cURL

