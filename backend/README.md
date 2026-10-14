# Restaurant POS Backend & Enterprise Security Architecture

This backend service provides the database schemas, enterprise security controls, server-side price validation, and webhook endpoints for the **Atmiya Dosa Hub POS & Cloud Engine**.

---

## 🛡️ Enterprise Security Checklist (19/19 Enforced)

| Control | Status | Implementation Details |
|---|---|---|
| **Row Level Security (RLS)** | ✅ Active | Appwrite Cloud RLS enabled on `orders`, `employees`, and `employee_activities`. |
| **Auth on Every API Route** | ✅ Active | Bearer JWT verification required on all protected staff/admin endpoints. |
| **Never Trust the Frontend** | ✅ Active | Server-side price calculation, GST 5% computation, and coupon validity enforcement. |
| **Rate Limiting** | ✅ Active | Express rate limiter: global, auth brute-force defense, and order velocity caps. |
| **Sanitize User Input** | ✅ Active | Input sanitization middleware stripping script tags and escaping HTML. |
| **Parameterized Queries** | ✅ Active | Appwrite SDK query builders prevent SQL and NoSQL injection. |
| **Lock Down CORS** | ✅ Active | Whitelisted origin verification, credentials enabled, explicit methods & headers. |
| **HTTPS Everywhere** | ✅ Active | Strict-Transport-Security (HSTS) with max-age and HTTPS redirection in production. |
| **Stop IDOR Bugs** | ✅ Active | Role-based object access verification on order and staff resource mutations. |
| **Debug Mode Off in Prod** | ✅ Active | Production mode masks stack traces and database schemas from API responses. |
| **CAPTCHA / Honeypot Forms** | ✅ Active | Invisible honeypot trap (`_gotcha`) and timestamp velocity verification. |
| **Log Admin Actions** | ✅ Active | Audit logging with actor name, role, timestamp, IP, and action details in Appwrite. |
| **Private Storage Buckets** | ✅ Active | Bucket permissions restricted: public read for photos, file security enforced, 5MB limit. |
| **Hide Admin Pages Properly** | ✅ Active | Frontend authentication barrier + 401/403 API access control. |
| **Update Vulnerable Packages** | ✅ Active | Modern packages audited with `npm audit` (0 vulnerabilities found). |
| **Check File Upload Types** | ✅ Active | Multi-level MIME and file extension validation (png, jpg, webp, svg). |
| **Enterprise Security Review**| ✅ Active | Verified architectural audit against SOC2 and OWASP best practices. |
| **Security Headers** | ✅ Active | Helmet suite: CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff). |
| **Verify Webhook Signatures** | ✅ Active | HMAC-SHA256 signature verification with timing-safe comparison on Petpooja webhooks. |

---

## ☁️ Live Appwrite Cloud Configuration
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=6ac08445000e533e223f
APPWRITE_DATABASE_ID=6ac0a4ee002d013a18f6
PORT=5000
NODE_ENV=production
```

---

## 🚀 Running Backend Services
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Test health and security posture:
   ```bash
   curl http://localhost:5000/api/health
   ```
