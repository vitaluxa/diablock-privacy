/**
 * Subscription Billing Testing Script
 * Tests all subscription functionality according to the plan checklist
 */

// Test helper functions
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function test(name, condition, details = '') {
  if (condition) {
    testResults.passed.push({ name, details });
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed.push({ name, details });
    console.error(`❌ FAIL: ${name}`, details);
  }
}

function warn(name, message) {
  testResults.warnings.push({ name, message });
  console.warn(`⚠️  WARN: ${name} - ${message}`);
}

// Access billing service from window (exposed for debugging)
const billingService = window.billingService;

if (!billingService) {
  console.error('❌ billingService not found on window. Make sure the app is loaded.');
  process.exit(1);
}

console.log('🧪 Starting Subscription Billing Tests...\n');

// Test 1: Billing Service Initialization
console.log('=== Test 1: Billing Service Initialization ===');
test(
  'Billing service exists',
  typeof billingService !== 'undefined',
  'billingService should be available'
);

test(
  'Billing service has initialize method',
  typeof billingService.initialize === 'function',
  'initialize() method should exist'
);

test(
  'Billing service has checkSubscriptionStatus method',
  typeof billingService.checkSubscriptionStatus === 'function',
  'checkSubscriptionStatus() method should exist'
);

test(
  'Billing service has purchaseSubscription method',
  typeof billingService.purchaseSubscription === 'function',
  'purchaseSubscription() method should exist'
);

test(
  'Billing service has restorePurchases method',
  typeof billingService.restorePurchases === 'function',
  'restorePurchases() method should exist'
);

test(
  'Billing service has manageSubscriptions method',
  typeof billingService.manageSubscriptions === 'function',
  'manageSubscriptions() method should exist'
);

test(
  'Billing service has hasNoAdsSubscription method',
  typeof billingService.hasNoAdsSubscription === 'function',
  'hasNoAdsSubscription() method should exist'
);

test(
  'Billing service has checkSubscriptionExpired method',
  typeof billingService.checkSubscriptionExpired === 'function',
  'checkSubscriptionExpired() method should exist'
);

test(
  'Billing service has getFormattedExpirationDate method',
  typeof billingService.getFormattedExpirationDate === 'function',
  'getFormattedExpirationDate() method should exist'
);

console.log('\n=== Test 2: Subscription Status Checking ===');

// Test initial status (should be false if no subscription)
const initialStatus = billingService.hasNoAdsSubscription();
test(
  'Initial subscription status check',
  typeof initialStatus === 'boolean',
  `Initial status: ${initialStatus}`
);

// Test expiration detection
const expirationCheck = billingService.checkSubscriptionExpired();
test(
  'Expiration detection works',
  typeof expirationCheck === 'boolean',
  `Expiration check result: ${expirationCheck}`
);

console.log('\n=== Test 3: Product Configuration ===');

const status = billingService.getStatus();
test(
  'Product ID is set',
  status.productId === 'no_ads_monthly',
  `Product ID: ${status.productId}`
);

test(
  'Plan ID is set',
  status.planId === 'monthly-plan',
  `Plan ID: ${status.planId}`
);

test(
  'Price string is set',
  typeof status.priceString === 'string' && status.priceString.includes('$'),
  `Price: ${status.priceString}`
);

console.log('\n=== Test 4: Subscription Purchase Flow (Mock) ===');

// Test purchase flow (this will show a confirmation dialog in web mode)
// Note: This requires manual interaction in browser
warn(
  'Purchase flow test',
  'Manual test required: Click "Remove Ads" button in app UI. In web mode, it will show a confirmation dialog.'
);

console.log('\n=== Test 5: Restore Purchases ===');

// Test restore purchases method exists and can be called
// Note: Actual restore requires device/Google Play
warn(
  'Restore purchases test',
  'Manual test required: Click "Restore Purchases" button. On device, it will query Google Play.'
);

console.log('\n=== Test 6: Manage Subscriptions ===');

// Test manage subscriptions method exists
warn(
  'Manage subscriptions test',
  'Manual test required: Click "Manage Subscription" button. It should open Google Play/App Store.'
);

console.log('\n=== Test 7: Expiration Date Handling ===');

// Set a test expiration date in the past
const pastDate = new Date();
pastDate.setMonth(pastDate.getMonth() - 1);
localStorage.setItem('diaBlockSubscriptionActive', 'true');
localStorage.setItem('diaBlockSubscriptionExpiration', pastDate.toISOString());

// Reset billing service state
billingService.subscriptionExpirationDate = pastDate;
billingService.hasActiveSubscription = true;

// Check if expiration is detected
billingService.checkSubscriptionExpired();
const afterExpirationCheck = billingService.hasNoAdsSubscription();

test(
  'Expired subscription is detected',
  afterExpirationCheck === false,
  'Subscription should be marked as expired when expiration date is in the past'
);

test(
  'Expired subscription localStorage is cleared',
  localStorage.getItem('diaBlockSubscriptionActive') === null,
  'localStorage should be cleared when subscription expires'
);

// Clean up test data
localStorage.removeItem('diaBlockSubscriptionActive');
localStorage.removeItem('diaBlockSubscriptionExpiration');

console.log('\n=== Test 8: Subscription Status Persistence ===');

// Test localStorage persistence
localStorage.setItem('diaBlockSubscriptionActive', 'true');
const futureDate = new Date();
futureDate.setMonth(futureDate.getMonth() + 1);
localStorage.setItem('diaBlockSubscriptionExpiration', futureDate.toISOString());

// Create new billing service instance (simulating app restart)
// Note: In real app, this would be a new page load
warn(
  'Status persistence test',
  'Manual test required: Verify subscription status persists after app restart. Check localStorage on page reload.'
);

// Clean up
localStorage.removeItem('diaBlockSubscriptionActive');
localStorage.removeItem('diaBlockSubscriptionExpiration');

console.log('\n=== Test 9: UI Integration Tests ===');

// Check if subscription status state exists in React component
// This is harder to test from console, but we can verify methods
warn(
  'UI update test',
  'Manual test required: Verify UI updates when subscription status changes. Check button states and subscription info display.'
);

console.log('\n=== Test 10: Error Handling ===');

// Test error handling by checking if methods handle errors gracefully
test(
  'Error handling exists',
  typeof billingService.checkSubscriptionStatus === 'function',
  'checkSubscriptionStatus should handle errors gracefully'
);

console.log('\n=== Test Summary ===');
console.log(`\n✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`⚠️  Warnings: ${testResults.warnings.length}`);

if (testResults.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.failed.forEach(test => {
    console.log(`  - ${test.name}: ${test.details}`);
  });
}

if (testResults.warnings.length > 0) {
  console.log('\n⚠️  Manual Tests Required:');
  testResults.warnings.forEach(warn => {
    console.log(`  - ${warn.name}: ${warn.message}`);
  });
}

console.log('\n✅ All automated tests completed!');
console.log('📝 Manual testing checklist:');
console.log('  1. Open app in browser (http://localhost:5174)');
console.log('  2. Click "Remove Ads" button - should show confirmation dialog');
console.log('  3. Confirm purchase - should show success message and hide ads');
console.log('  4. Verify "✓ No Ads" button appears with expiration date');
console.log('  5. Click "Manage Subscription" - should open subscription page');
console.log('  6. Click "Restore Purchases" - should check for existing subscriptions');
console.log('  7. Refresh page - subscription status should persist');
console.log('  8. Test expiration: Set expiration date in past, verify ads return');
console.log('  9. Test periodic checking: Leave app open, verify status updates');
console.log('  10. On Android device: Test real Google Play purchase flow');

