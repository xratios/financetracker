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

## Integration with n8n + Telegram Bot

1. **Telegram Bot** receives message from user
2. **n8n AI Agent** parses the message and extracts:
   - Transaction details (title, amount, type, category)
   - User email (from Telegram user mapping or bot context)
   - Date (current date or parsed from message)
3. **n8n HTTP Request Node** sends POST request to `/api/transactions`
4. **API** validates, finds user, and saves transaction to InstantDB
5. **n8n** sends confirmation back to Telegram user

## Environment Variables

Set these in your Vercel project settings:

- `NEXT_PUBLIC_INSTANT_APP_ID`: Your InstantDB app ID (already set)
- `API_KEY`: Your secret API key for authenticating requests

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

