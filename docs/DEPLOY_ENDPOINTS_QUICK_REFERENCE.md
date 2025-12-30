# Cloudflare Deploy Endpoints - Quick Reference

**Phase**: Phase 05 - Cloudflare Deploy Integration
**Updated**: 2025-12-30

---

## Endpoints at a Glance

| Method | Endpoint                 | Auth         | Purpose                     |
| ------ | ------------------------ | ------------ | --------------------------- |
| POST   | `/api/v1/deploy/trigger` | Required     | Trigger Pages rebuild       |
| GET    | `/api/v1/deploy/status`  | Not required | Check webhook configuration |

---

## 1. Trigger Cloudflare Rebuild (Protected)

### Request

```bash
curl -X POST http://localhost:3001/api/v1/deploy/trigger \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json"
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Rebuild triggered successfully",
  "timestamp": "2025-12-30T10:30:45.123Z",
  "status": 200
}
```

### Error Responses

| Code | Scenario                  | Message                                 |
| ---- | ------------------------- | --------------------------------------- |
| 401  | No token or invalid token | "Unauthorized"                          |
| 500  | Cloudflare API error      | "Failed to trigger rebuild"             |
| 503  | Webhook not configured    | "Cloudflare deploy hook not configured" |

---

## 2. Check Webhook Status (Public)

### Request

```bash
curl http://localhost:3001/api/v1/deploy/status
```

### Response (200)

#### Configured

```json
{
  "configured": true,
  "webhookConfigured": true
}
```

#### Not Configured

```json
{
  "configured": false,
  "webhookConfigured": false
}
```

---

## Setup Instructions

### 1. Get Cloudflare Webhook URL

1. Go to Cloudflare Pages project settings
2. Select "Build & deployments" tab
3. Find "Webhooks" section
4. Copy the deploy hook URL (looks like):
   ```
   https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID
   ```

### 2. Set Environment Variable

In `.env` file:

```env
CLOUDFLARE_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/YOUR_HOOK_ID"
```

### 3. Verify Configuration

```bash
curl http://localhost:3001/api/v1/deploy/status
# Should return: {"configured": true, "webhookConfigured": true}
```

---

## Usage in Admin Portal

### Show Deploy Button Only When Ready

```typescript
// Check if webhook is configured
const response = await fetch("/api/v1/deploy/status");
const { configured } = await response.json();

// Show button only if configured
if (configured) {
  // Display "Trigger Rebuild" button
}
```

### Trigger Rebuild from Admin UI

```typescript
async function triggerRebuild() {
  try {
    const response = await fetch("/api/v1/deploy/trigger", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Rebuild triggered at ${data.timestamp}`);
      // Show success notification
    } else if (response.status === 503) {
      // Webhook not configured
      console.error("Deploy webhook not configured");
    } else {
      // Other error
      console.error("Failed to trigger rebuild");
    }
  } catch (error) {
    console.error("Error triggering rebuild:", error);
  }
}
```

---

## Security Notes

- **Always use HTTPS** in production for Bearer token transport
- **Store webhook URL** in environment variables, never in code
- **Require authentication** for trigger endpoint (admin only)
- **Status endpoint is public** (doesn't expose sensitive info)
- **Tokens expire** after configured duration (Supabase default: 1 hour)

---

## Troubleshooting

### Webhook Not Configured (503)

**Symptom**: Getting "Cloudflare deploy hook not configured" error

**Solution**:

1. Check `.env` file has `CLOUDFLARE_DEPLOY_HOOK_URL`
2. Verify it's the correct Cloudflare webhook URL
3. Restart API server: `npm run dev`
4. Test status endpoint: `curl http://localhost:3001/api/v1/deploy/status`

### Unauthorized (401)

**Symptom**: Getting "Unauthorized" when triggering rebuild

**Solution**:

1. Verify JWT token in Authorization header
2. Check token hasn't expired (refresh from Supabase Auth)
3. Verify token format: `Bearer <token>` (space between Bearer and token)

### Rebuild Not Triggered (500)

**Symptom**: Getting "Failed to trigger rebuild" error

**Solution**:

1. Check Cloudflare API status (cloudflare.com/status)
2. Verify webhook URL is still valid in Cloudflare Pages settings
3. Check API logs: `npm run dev` output
4. Try manually triggering build in Cloudflare Pages UI to verify webhook works

---

## Performance Considerations

- **Trigger Response Time**: ~2-5 seconds (depends on Cloudflare API)
- **Status Check**: <100ms (local only, no network call)
- **Webhook Execution**: Triggered asynchronously by Cloudflare
- **Build Time**: Depends on project size (typically 2-5 minutes)

---

## Integration Examples

### React Component for Rebuild Button

```typescript
import { useState } from 'react';

export function DeployButton({ token }) {
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(null);

  // Check configuration on mount
  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const res = await fetch('/api/v1/deploy/status');
    const { configured } = await res.json();
    setConfigured(configured);
  }

  async function handleDeploy() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/deploy/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Rebuild triggered at ${new Date(data.timestamp).toLocaleString()}`);
      } else {
        alert('Failed to trigger rebuild');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return <p>Deploy webhook not configured</p>;
  }

  return (
    <button onClick={handleDeploy} disabled={loading}>
      {loading ? 'Triggering...' : 'Trigger Rebuild'}
    </button>
  );
}
```

---

## Related Documentation

- **Full API Reference**: [API_REFERENCE.md](./API_REFERENCE.md) - Complete endpoint documentation
- **Environment Setup**: [BACKEND_DEVELOPER_GUIDE.md](./BACKEND_DEVELOPER_GUIDE.md) - Environment variables
- **System Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - Overall system design

---

**Version**: 1.0
**Last Updated**: 2025-12-30
**Maintainer**: Documentation Team
