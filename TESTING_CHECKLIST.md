# Subscription Billing Testing Checklist

## Automated Tests (Run in Browser Console)

1. Open the app in browser (http://localhost:5174)
2. Open browser console (F12)
3. Paste and run: `node test-subscription-billing.js` (if Node.js available) OR manually test using browser console commands below

### Browser Console Testing Commands

```javascript
// Access billing service
const bs = window.billingService;

// Test 1: Check initialization
console.log('Initialized:', bs.isInitialized);
console.log('Has subscription:', bs.hasNoAdsSubscription());

// Test 2: Check status
const status = bs.getStatus();
console.log('Status:', status);

// Test 3: Test expiration detection
// Set past expiration date
const pastDate = new Date();
pastDate.setMonth(pastDate.getMonth() - 1);
localStorage.setItem('diaBlockSubscriptionExpiration', pastDate.toISOString());
bs.subscriptionExpirationDate = pastDate;
bs.hasActiveSubscription = true;
bs.checkSubscriptionExpired();
console.log('After expiration check:', bs.hasNoAdsSubscription()); // Should be false

// Test 4: Test subscription purchase (mock mode)
// This will show confirmation dialog
bs.purchaseSubscription().then(result => {
  console.log('Purchase result:', result);
  console.log('Has subscription:', bs.hasNoAdsSubscription());
});

// Test 5: Test restore purchases
bs.restorePurchases().then(result => {
  console.log('Restore result:', result);
});

// Test 6: Test manage subscriptions
bs.manageSubscriptions().then(() => {
  console.log('Manage subscriptions opened');
});
```

## Manual UI Testing Checklist

### ✅ Test 1: Subscription Purchase Works and Status Updates Correctly

- [ ] Click "Remove Ads" button (🚫)
- [ ] Confirm purchase dialog appears
- [ ] Click "OK" in confirmation dialog
- [ ] Verify success message: "Thank you for subscribing! Ads have been removed."
- [ ] Verify button changes to "✓ No Ads"
- [ ] Verify ads are hidden (banner disappears)
- [ ] Check console: Should show "✅ Subscription purchase successful!"

### ✅ Test 2: Subscription Status Persists After App Restart

- [ ] Purchase subscription (mock mode)
- [ ] Refresh the page (F5)
- [ ] Verify "✓ No Ads" button still shows
- [ ] Verify ads are still hidden
- [ ] Check localStorage: `localStorage.getItem('diaBlockSubscriptionActive')` should be "true"

### ✅ Test 3: Subscription Expiration is Detected Correctly

**Manual Expiration Test:**
- [ ] Purchase subscription
- [ ] In browser console, set expiration to past:
  ```javascript
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);
  localStorage.setItem('diaBlockSubscriptionExpiration', pastDate.toISOString());
  window.billingService.subscriptionExpirationDate = pastDate;
  ```
- [ ] Call: `window.billingService.checkSubscriptionExpired()`
- [ ] Verify: `window.billingService.hasNoAdsSubscription()` returns `false`
- [ ] Refresh page
- [ ] Verify ads return and button shows "🚫" again

### ✅ Test 4: Ads Re-enable When Subscription Expires

- [ ] Set subscription as expired (see Test 3)
- [ ] Verify banner ad appears
- [ ] Verify "Remove Ads" button appears instead of "✓ No Ads"
- [ ] Verify interstitial ads will show on level completion

### ✅ Test 5: Restore Purchases Works for Existing Subscriptions

**On Device (Android/iOS):**
- [ ] Have an active subscription on device
- [ ] Click "↻" (Restore Purchases) button
- [ ] Verify success message: "Purchases restored! Your subscription is active."
- [ ] Verify "✓ No Ads" button appears
- [ ] Verify ads are hidden

**Web/Mock Mode:**
- [ ] Set: `localStorage.setItem('diaBlockSubscriptionActive', 'true')`
- [ ] Click "↻" button
- [ ] Verify subscription is restored

### ✅ Test 6: Manage Subscription Opens Google Play Correctly

- [ ] Have active subscription
- [ ] Click "✓ No Ads" button
- [ ] Verify subscription management page opens
- [ ] On web: Should open Google Play subscriptions page in new tab

### ✅ Test 7: Status Check Works When App Resumes from Background

**On Mobile Device:**
- [ ] Open app with active subscription
- [ ] Press home button (app goes to background)
- [ ] Wait a few seconds
- [ ] Return to app (swipe up or app switcher)
- [ ] Check console: Should show subscription status check logs
- [ ] Verify subscription status is still correct

**On Browser:**
- [ ] Open app with active subscription
- [ ] Switch to another tab
- [ ] Switch back to app tab
- [ ] Check console: Should show subscription status check logs

### ✅ Test 8: UI Updates Correctly Based on Subscription Status

**Not Subscribed:**
- [ ] Verify "🚫 Remove Ads" button is visible
- [ ] Verify "↻ Restore Purchases" button is visible
- [ ] Verify ads (banner) are visible
- [ ] Verify button tooltip shows price: "Remove Ads - $5.99/month"

**Subscribed:**
- [ ] Purchase subscription
- [ ] Verify "✓ No Ads" button is visible
- [ ] Verify "↻ Restore Purchases" button is NOT visible
- [ ] Verify ads are hidden
- [ ] Verify button tooltip shows expiration: "No Ads Active until [date]"

### ✅ Test 9: Price Displays Dynamically from Google Play

**On Device:**
- [ ] Check if price in button tooltip matches Google Play Console price
- [ ] Verify price format is correct (e.g., "$5.99/month")
- [ ] Check console logs for product details fetch

**Web/Mock:**
- [ ] Verify fallback price "$5.99/month" is shown
- [ ] Check console: Should attempt to get product details

### ✅ Test 10: Expiration Date Displays Correctly (if available)

- [ ] Purchase subscription
- [ ] Verify expiration date appears in button tooltip
- [ ] Check format: Should be readable (e.g., "Jan 15, 2025")
- [ ] Verify expiration date persists after page refresh

### ✅ Test 11: Periodic Status Checking

- [ ] Keep app open for 5+ minutes
- [ ] Check console logs: Should see periodic status checks every 5 minutes
- [ ] Verify no errors in periodic checks
- [ ] Test expiration: Set expiration to past, wait for next check, verify ads return

### ✅ Test 12: Purchase Flow Loading States

- [ ] Click "Remove Ads" button
- [ ] Verify button shows "..." (loading state) during purchase
- [ ] Verify button is disabled during purchase
- [ ] After purchase completes, verify button updates to "✓ No Ads"

### ✅ Test 13: Error Handling

- [ ] Test network error: Disable network, try purchase
- [ ] Verify graceful error message
- [ ] Test user cancellation: Cancel purchase dialog
- [ ] Verify no error shown (user cancellation is expected)
- [ ] Test restore with no subscription: Verify "No active subscriptions found" message

### ✅ Test 14: Restore Purchases Loading State

- [ ] Click "↻ Restore Purchases" button
- [ ] Verify button shows "..." (loading state) during restore
- [ ] Verify button is disabled during restore
- [ ] After restore completes, verify button state updates

## Android Device Testing (Real Google Play)

### Prerequisites:
1. App installed on Android device
2. Google Play Console subscription product created (`no_ads_monthly`)
3. Test account added to Google Play Console license testing

### Steps:
1. [ ] Open app on Android device
2. [ ] Click "Remove Ads" button
3. [ ] Google Play purchase dialog should appear
4. [ ] Complete purchase with test account
5. [ ] Verify subscription is active
6. [ ] Verify ads are hidden
7. [ ] Close and reopen app
8. [ ] Verify subscription persists
9. [ ] Test restore purchases on new device/after reinstall
10. [ ] Test manage subscription opens Google Play correctly

## Test Results Summary

Run all tests and mark as complete:

- **Automated Tests**: ___/10 passed
- **Manual UI Tests**: ___/14 completed
- **Device Tests**: ___/10 completed

## Notes

- Web/mock mode: Uses localStorage and confirmation dialogs
- Device mode: Requires actual Google Play integration
- Expiration testing: Use browser console to simulate expiration dates
- Periodic checking: Verify every 5 minutes when app is open

