# API Endpoints

Documentation for TrackMyOPT API endpoints.

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <id_token>
```

The token is the short-lived JWT minted during the extension authentication flow.

---

## GET /api/me

Get the authenticated user's profile and OPT status information.

### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Method:** GET

**URL:** `/api/me`

### Response

**Success (200 OK):**
```json
{
  "profile": {
    "timezone": "America/New_York",
    "is_stem_eligible": true
  },
  "status": {
    "program_end_date": "2024-05-15",
    "dso_recommendation_date": "2024-04-01",
    "opt_ead_end_date": "2025-05-15",
    "opt_start_date": "2024-06-01",
    "stem_start_date": "2025-05-16"
  }
}
```

**New User (200 OK):**
```json
{
  "profile": {
    "timezone": "America/Los_Angeles",
    "is_stem_eligible": false
  },
  "status": null
}
```
*Note: `status` is `null` for users who haven't filled out OPT information yet.*

**Unauthorized (401):**
```json
{
  "error": "Missing or invalid Authorization header"
}
```

or

```json
{
  "error": "Invalid or expired token"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to fetch profile"
}
```

or

```json
{
  "error": "Internal server error"
}
```

### Example Usage

**JavaScript/TypeScript:**
```typescript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('https://your-site.com/api/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();

if (response.ok) {
  console.log('Profile:', data.profile);
  console.log('OPT Status:', data.status);
} else {
  console.error('Error:', data.error);
}
```

**cURL:**
```bash
curl -X GET https://your-site.com/api/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Chrome Extension:**
```javascript
// In your extension background script or popup
chrome.storage.local.get(['auth_token'], async (result) => {
  const token = result.auth_token;
  
  if (!token) {
    console.error('No auth token found');
    return;
  }
  
  try {
    const response = await fetch('https://your-site.com/api/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Use the data in your extension
    displayCountdown(data.status);
    updateTimezone(data.profile.timezone);
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    // Redirect to auth if token is expired
    if (error.message.includes('401')) {
      initiateAuthFlow();
    }
  }
});
```

### Response Fields

#### Profile Object
| Field | Type | Description |
|-------|------|-------------|
| `timezone` | string | User's timezone (e.g., "America/New_York") |
| `is_stem_eligible` | boolean | Whether user is STEM-eligible |

#### Status Object (nullable)
| Field | Type | Description |
|-------|------|-------------|
| `program_end_date` | string (date) | Academic program completion date (YYYY-MM-DD) |
| `dso_recommendation_date` | string (date) \| null | DSO recommendation date (YYYY-MM-DD) |
| `opt_ead_end_date` | string (date) | OPT EAD expiration date (YYYY-MM-DD) |
| `opt_start_date` | string (date) | OPT period start date (YYYY-MM-DD) |
| `stem_start_date` | string (date) \| null | STEM extension start date (YYYY-MM-DD) |

---

## JWT Token Details

### Token Structure

The JWT token contains:
```json
{
  "userId": "user-uuid",
  "email": "user@example.com",
  "sub": "user-uuid",
  "iat": 1234567890,
  "exp": 1234568490,
  "iss": "trackmyopt-web",
  "aud": "trackmyopt-extension"
}
```

### Token Lifetime

- Default: **10 minutes**
- Can be customized when minting
- After expiration, user must re-authenticate

### Token Verification

The API automatically:
1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies signature using `JWT_SIGNING_SECRET`
3. Validates issuer (`trackmyopt-web`)
4. Validates audience (`trackmyopt-extension`)
5. Checks expiration time
6. Returns decoded payload or null if invalid

---

## Error Handling

### Common Error Responses

**Missing Authorization Header:**
```json
{
  "error": "Missing or invalid Authorization header"
}
```
*Status:* 401 Unauthorized

**Expired Token:**
```json
{
  "error": "Invalid or expired token"
}
```
*Status:* 401 Unauthorized

**Database Error:**
```json
{
  "error": "Failed to fetch profile"
}
```
*Status:* 500 Internal Server Error

### Error Handling in Extension

```javascript
async function fetchUserData(token) {
  try {
    const response = await fetch('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (response.status === 401) {
      // Token expired or invalid - re-authenticate
      await initiateAuthFlow();
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}
```

---

## Security Considerations

1. **Token Storage**: Store tokens securely in `chrome.storage.local` (not `localStorage`)
2. **Token Transmission**: Always use HTTPS in production
3. **Token Expiry**: Handle expired tokens gracefully by re-authenticating
4. **Token Scope**: Tokens are scoped to the extension (`aud: trackmyopt-extension`)
5. **RLS Protection**: All database queries respect Row Level Security policies

---

## Testing

### Test with cURL

```bash
# 1. Get a token by authenticating through the extension flow
# 2. Test the API
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Test with Postman

1. Set method to `GET`
2. URL: `http://localhost:3000/api/me`
3. Headers:
   - `Authorization`: `Bearer <your-token>`
   - `Content-Type`: `application/json`
4. Send request

### Test in Browser Console

```javascript
fetch('http://localhost:3000/api/me', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## Future Endpoints

Planned API endpoints:

- `POST /api/opt-status` - Update OPT dates
- `GET /api/countdown` - Get calculated countdown
- `POST /api/employment` - Add employment record
- `GET /api/employment` - Get employment history
- `DELETE /api/employment/:id` - Remove employment record

