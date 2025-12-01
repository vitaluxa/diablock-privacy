# Fix "This browser or app may not be secure" Error

## The Problem

This error occurs when Google OAuth doesn't recognize your app as authorized. Here's how to fix it:

## Quick Fix (Most Common Issue)

### Step 1: Verify Authorized JavaScript Origins

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (the one you created)
5. Under **Authorized JavaScript origins**, make sure you have:
   - `http://localhost:5173` (exactly like this, no trailing slash)
   - If deploying, add: `https://your-domain.com`

6. Under **Authorized redirect URIs**, make sure you have:
   - `http://localhost:5173` (exactly like this)
   - If deploying, add: `https://your-domain.com`

7. **Click Save**

### Step 2: Check OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Make sure:
   - **Publishing status**: Can be "Testing" for development
   - **App name**: "Dia Block"
   - **User support email**: Your email
   - **Developer contact**: Your email
3. Under **Test users** (if in Testing mode):
   - Click **Add Users**
   - Add your Google account email: `chatgptagent44@gmail.com`
   - **Save**
4. If publishing, click **Publish App** button

### Step 3: Verify APIs are Enabled

1. Go to **APIs & Services** → **Library**
2. Make sure these are **Enabled**:
   - ✅ **Google Drive API**
   - ✅ **Google Identity API**

### Step 4: Clear Browser Cache and Restart

1. Clear browser cache/cookies for `localhost:5173`
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Try signing in again

## If Still Not Working

### Check Your Client ID

Make sure your `.env` file has the correct Client ID:
```env
VITE_GOOGLE_PLAY_CLIENT_ID=767702704238-f1kedjpo1vk2sdeuuc8jei9jprk8f6n6.apps.googleusercontent.com
```

The Client ID should:
- ✅ End with `.apps.googleusercontent.com`
- ✅ Be for a **Web application** type (not Android/iOS)
- ✅ Match exactly what's in Google Cloud Console

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any error messages
4. Common errors:
   - `redirect_uri_mismatch` → Check Authorized redirect URIs
   - `invalid_client` → Check Client ID
   - `access_denied` → Check OAuth consent screen

### Verify Environment Variables are Loaded

1. In browser console, type:
   ```javascript
   console.log(import.meta.env.VITE_GOOGLE_PLAY_CLIENT_ID)
   ```
2. Should show your Client ID
3. If `undefined`, restart dev server

## Most Important: Test Users

If your app is in **Testing** mode (which it probably is):

1. Go to **OAuth consent screen**
2. Under **Test users**, add:
   - `chatgptagent44@gmail.com`
3. **Save**
4. Try signing in again

**Note:** Only test users can sign in when app is in Testing mode!

## Quick Checklist

- [ ] Authorized JavaScript origins includes `http://localhost:5173`
- [ ] Authorized redirect URIs includes `http://localhost:5173`
- [ ] OAuth consent screen has your email as test user
- [ ] Google Drive API is enabled
- [ ] Google Identity API is enabled
- [ ] `.env` file has correct Client ID
- [ ] Dev server restarted after creating `.env`
- [ ] Browser cache cleared

## Still Having Issues?

1. **Check the exact error** in browser console
2. **Verify Client ID** matches in Google Cloud Console
3. **Try incognito mode** to rule out cache issues
4. **Check network tab** for failed API calls

Once you add yourself as a test user in OAuth consent screen, it should work! 🎯





