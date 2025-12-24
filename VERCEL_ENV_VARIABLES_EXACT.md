# Exact Environment Variables for Vercel

## Your Production URL
```
https://soccer-data-cursor101-scwv-4ebl8qetk-huffmans-projects-53a3c96a.vercel.app
```

## Go to Environment Variables Page
https://vercel.com/huffmans-projects-53a3c96a/soccer-data-cursor101-scwv/settings/environment-variables

## Copy and Paste These EXACT Values

### 1. DATABASE_URL
**Key:** `DATABASE_URL`

**Value (copy entire line):**
```
postgresql://neondb_owner:npg_7OoNATjp0zaX@ep-jolly-hall-ag2bwqco-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Environment:** Production ✅

---

### 2. NEXTAUTH_SECRET
**Key:** `NEXTAUTH_SECRET`

**Value:**
```
S3hZosW4BZjY8FR22NcEFTsT+9GkwhrPNc5BrozXDhk=
```

**Environment:** Production ✅

---

### 3. NEXTAUTH_URL
**Key:** `NEXTAUTH_URL`

**Value:**
```
https://soccer-data-cursor101-scwv-4ebl8qetk-huffmans-projects-53a3c96a.vercel.app
```

**Environment:** Production ✅

---

## Important Notes

⚠️ **After adding/updating variables:**
- Vercel will automatically redeploy
- Wait for deployment to complete (check deployment status)
- The deployment URL might change, but the domain stays the same

⚠️ **If password still doesn't work:**
1. Check that ALL 3 variables are set for Production
2. Make sure DATABASE_URL includes `?sslmode=require&channel_binding=require`
3. Make sure NEXTAUTH_URL starts with `https://` (not `http://`)
4. Make sure NEXTAUTH_URL has NO trailing slash
5. Wait for Vercel to finish redeploying

## Test Login

After deployment completes:
- URL: https://soccer-data-cursor101-scwv-4ebl8qetk-huffmans-projects-53a3c96a.vercel.app/login
- Email: `admin@example.com`
- Password: `admin123456`

