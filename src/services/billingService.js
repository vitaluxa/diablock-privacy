/**
 * Google Play Billing Service
 * Handles in-app subscriptions for "No Ads" using @capgo/native-purchases
 * 
 * Subscription: $5.99/month for ad-free experience
 */

import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { Capacitor } from '@capacitor/core';

class BillingService {
  constructor() {
    this.isInitialized = false;
    this.hasActiveSubscription = false;
    this.subscriptionExpirationDate = null; // Track expiration date
    
    // Subscription product configuration
    // These IDs must match what you create in Google Play Console
    this.productId = 'no_ads_monthly';        // Product ID in Google Play Console
    this.planId = 'monthly-plan';             // Base Plan ID in Google Play Console (required for Android subscriptions)
    this.priceString = '$5.99/month';         // Display price (will be updated from store)
    
    // Check localStorage for cached subscription status (quick UI update)
    // Real status will be verified when billing initializes
    const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
    const cachedExpiration = localStorage.getItem('diaBlockSubscriptionExpiration');
    this.hasActiveSubscription = cachedStatus === 'true';
    this.subscriptionExpirationDate = cachedExpiration ? new Date(cachedExpiration) : null;
    
    // Check if cached subscription has expired
    if (this.subscriptionExpirationDate && this.subscriptionExpirationDate < new Date()) {
      this.hasActiveSubscription = false;
      localStorage.removeItem('diaBlockSubscriptionActive');
      localStorage.removeItem('diaBlockSubscriptionExpiration');
      this.subscriptionExpirationDate = null;
    }
  }

  /**
   * Initialize billing service
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('💰 BillingService: Already initialized');
      return true;
    }

    console.log('💰 BillingService: Initializing...');

    try {
      const platform = Capacitor.getPlatform();
      console.log('📱 BillingService: Platform detected:', platform);
      console.log('📱 BillingService: Capacitor available:', typeof Capacitor !== 'undefined');
      console.log('📱 BillingService: NativePurchases available:', typeof NativePurchases !== 'undefined');
      
      if (platform === 'android' || platform === 'ios') {
        console.log('✅ BillingService: Running on native platform');
        
        try {
          // Check if billing is supported on this device
          const { isBillingSupported } = await NativePurchases.isBillingSupported();
          console.log('💳 BillingService: Billing supported:', isBillingSupported);
          
          if (!isBillingSupported) {
            console.warn('⚠️ BillingService: Billing not supported on this device');
            this.isInitialized = true;
            return true;
          }

          console.log('✅ BillingService: Billing is supported');

          // Restore/verify any existing subscriptions
          await this.checkSubscriptionStatus();
          
          console.log('✅ BillingService: Initialized successfully');
          this.isInitialized = true;
          return true;
        } catch (billingError) {
          console.error('❌ BillingService: Error checking billing support:', billingError);
          console.error('Error details:', {
            message: billingError.message,
            stack: billingError.stack
          });
          // Don't block app if billing check fails
          this.isInitialized = true;
          return false;
        }
      } else {
        console.warn('⚠️ BillingService: Not on mobile platform, using mock mode');
        console.warn('⚠️ Platform:', platform, '- Expected: android or ios');
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('❌ BillingService: Initialization failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Don't block app if billing fails to initialize
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Get subscription product details from the store
   */
  async getProductDetails() {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android' || platform === 'ios') {
      try {
        const { product } = await NativePurchases.getProduct({
          productIdentifier: this.productId,
          productType: PURCHASE_TYPE.SUBS
        });

        if (product) {
          console.log('📦 Product details:', product);
          // Update price string from store (required by Apple - no hardcoded prices!)
          this.priceString = product.priceString || this.priceString;
          return {
            id: product.identifier,
            title: product.title || 'No Ads Subscription',
            description: product.description || 'Remove all advertisements',
            priceString: product.priceString,
            price: product.price,
            currency: product.currencyCode
          };
        }
      } catch (error) {
        console.error('❌ Error getting product details:', error);
      }
    }

    // Return mock/fallback product details
    return {
      id: this.productId,
      title: 'No Ads Subscription',
      description: 'Remove all advertisements from the game. Cancel anytime.',
      priceString: this.priceString,
      price: 5.99,
      currency: 'USD'
    };
  }

  /**
   * Purchase "No Ads" subscription
   */
  async purchaseSubscription() {
    console.log('💰 BillingService: Starting subscription purchase flow...');

    try {
      const platform = Capacitor.getPlatform();
      console.log('📱 Detected platform:', platform);
      console.log('🔍 Platform check:', { platform, isAndroid: platform === 'android', isIOS: platform === 'ios' });
      
      if (platform === 'android' || platform === 'ios') {
        console.log('✅ Running on native platform, using real billing');
        
        // Check if billing is supported
        try {
          const { isBillingSupported } = await NativePurchases.isBillingSupported();
          console.log('💳 Billing supported:', isBillingSupported);
          
          if (!isBillingSupported) {
            console.error('❌ Billing not supported on this device');
            return { success: false, error: 'Billing is not supported on this device' };
          }
        } catch (billingCheckError) {
          console.error('❌ Error checking billing support:', billingCheckError);
          return { success: false, error: 'Failed to check billing support: ' + billingCheckError.message };
        }
        
        // Real purchase flow
        const purchaseOptions = {
          productIdentifier: this.productId,
          productType: PURCHASE_TYPE.SUBS,
          quantity: 1
        };

        // Android subscriptions require planIdentifier
        if (platform === 'android') {
          purchaseOptions.planIdentifier = this.planId;
          console.log('🤖 Android subscription - using planIdentifier:', this.planId);
        }

        console.log('📤 Initiating purchase with options:', JSON.stringify(purchaseOptions, null, 2));
        
        try {
          const result = await NativePurchases.purchaseProduct(purchaseOptions);
          
          console.log('📥 Purchase result:', JSON.stringify(result, null, 2));
          
          if (result && result.transactionId) {
            console.log('✅ Subscription purchase successful! Transaction:', result.transactionId);
            
            // Update expiration date if available
            if (result.expirationDate) {
              const expirationDate = new Date(result.expirationDate);
              this.subscriptionExpirationDate = expirationDate;
              localStorage.setItem('diaBlockSubscriptionExpiration', expirationDate.toISOString());
              console.log('📅 Expiration date from purchase:', expirationDate);
            } else if (platform === 'android') {
              // Estimate expiration for Android (1 month from now)
              const expirationDate = new Date();
              expirationDate.setMonth(expirationDate.getMonth() + 1);
              this.subscriptionExpirationDate = expirationDate;
              localStorage.setItem('diaBlockSubscriptionExpiration', expirationDate.toISOString());
              console.log('📅 Estimated expiration date (Android):', expirationDate);
            }
            
            this.hasActiveSubscription = true;
            localStorage.setItem('diaBlockSubscriptionActive', 'true');
            localStorage.setItem('diaBlockLastTransactionId', result.transactionId);
            
            // Verify subscription status immediately after purchase
            await this.checkSubscriptionStatus();
            
            return { success: true, transactionId: result.transactionId };
          } else {
            console.error('❌ Purchase result invalid - missing transactionId');
            console.error('Purchase result:', result);
            return { success: false, error: 'Purchase failed: Invalid response from store' };
          }
        } catch (purchaseError) {
          console.error('❌ NativePurchases.purchaseProduct error:', purchaseError);
          console.error('Error details:', {
            message: purchaseError.message,
            code: purchaseError.code,
            stack: purchaseError.stack
          });
          
          // Check for user cancellation
          const errorMessage = purchaseError.message || purchaseError.toString();
          if (errorMessage.includes('cancelled') || 
              errorMessage.includes('canceled') ||
              errorMessage.includes('User cancelled') ||
              errorMessage.includes('userCanceled')) {
            console.log('ℹ️ User cancelled purchase');
            return { success: false, error: 'User cancelled' };
          }
          
          // Don't fall through to mock mode - return error instead
          return { 
            success: false, 
            error: 'Purchase failed: ' + (purchaseError.message || purchaseError.toString())
          };
        }
      } else {
        // Web/development mode - mock purchase with confirmation
        console.log('🧪 Mock purchase for web/development - platform:', platform);
        const confirmed = confirm(`Subscribe to "No Ads" for ${this.priceString}?\n\nThis will remove all advertisements from the game.\n\nNote: This is a mock purchase for testing.`);
        if (confirmed) {
          // Set expiration date for mock (1 month from now)
          const expirationDate = new Date();
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          this.subscriptionExpirationDate = expirationDate;
          
          this.hasActiveSubscription = true;
          localStorage.setItem('diaBlockSubscriptionActive', 'true');
          localStorage.setItem('diaBlockSubscriptionExpiration', expirationDate.toISOString());
          
          // Verify subscription status after purchase (for consistency)
          await this.checkSubscriptionStatus();
          
          return { success: true, mock: true };
        }
        return { success: false, error: 'User cancelled' };
      }
    } catch (error) {
      console.error('❌ Purchase error (outer catch):', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check for user cancellation
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('cancelled') || 
          errorMessage.includes('canceled') ||
          errorMessage.includes('User cancelled')) {
        return { success: false, error: 'User cancelled' };
      }
      
      return { success: false, error: error.message || 'Purchase failed: ' + error.toString() };
    }
  }

  /**
   * Check if subscription has expired
   */
  checkSubscriptionExpired() {
    if (!this.subscriptionExpirationDate) {
      return false; // No expiration date means subscription status unknown, don't consider expired
    }
    
    const now = new Date();
    const isExpired = this.subscriptionExpirationDate < now;
    
    if (isExpired) {
      console.log('⏰ Subscription has expired:', this.subscriptionExpirationDate);
      this.hasActiveSubscription = false;
      localStorage.removeItem('diaBlockSubscriptionActive');
      localStorage.removeItem('diaBlockSubscriptionExpiration');
      this.subscriptionExpirationDate = null;
    }
    
    return isExpired;
  }

  /**
   * Check current subscription status by querying Google Play/App Store
   */
  async checkSubscriptionStatus() {
    console.log('💰 BillingService: Checking subscription status...');

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        // First check if cached subscription is expired
        this.checkSubscriptionExpired();
        
        // Restore purchases to sync with platform
        await NativePurchases.restorePurchases();
        
        // Query for active subscriptions
        try {
          const { purchases } = await NativePurchases.getPurchases({
            productType: PURCHASE_TYPE.SUBS
          });
          
          console.log('📦 Retrieved purchases:', purchases);
          
          // Find our subscription product
          const activeSubscription = purchases.find(purchase => {
            // Match product identifier
            if (purchase.productIdentifier !== this.productId) {
              return false;
            }
            
            if (platform === 'android') {
              // Android: Check purchaseState === "1" for valid purchase
              // Also check if it's a subscription type
              return purchase.purchaseState === '1' && purchase.productType === 'subs';
            } else {
              // iOS: Check isActive flag and expiration date
              const isActive = purchase.isActive === true;
              if (isActive && purchase.expirationDate) {
                const expirationDate = new Date(purchase.expirationDate);
                // Update expiration date if subscription is active
                this.subscriptionExpirationDate = expirationDate;
                localStorage.setItem('diaBlockSubscriptionExpiration', expirationDate.toISOString());
                return expirationDate > new Date();
              }
              return isActive;
            }
          });
          
          if (activeSubscription) {
            console.log('✅ Active subscription found:', activeSubscription);
            this.hasActiveSubscription = true;
            localStorage.setItem('diaBlockSubscriptionActive', 'true');
            
            // Store expiration date if available (iOS)
            if (platform === 'ios' && activeSubscription.expirationDate) {
              const expirationDate = new Date(activeSubscription.expirationDate);
              this.subscriptionExpirationDate = expirationDate;
              localStorage.setItem('diaBlockSubscriptionExpiration', expirationDate.toISOString());
            } else if (platform === 'android') {
              // Android doesn't provide expiration in purchase object
              // For monthly subscription, estimate expiration (1 month from purchase date)
              // Or we can rely on periodic checks
              const purchaseDate = new Date(activeSubscription.purchaseDate);
              const estimatedExpiration = new Date(purchaseDate);
              estimatedExpiration.setMonth(estimatedExpiration.getMonth() + 1);
              this.subscriptionExpirationDate = estimatedExpiration;
              localStorage.setItem('diaBlockSubscriptionExpiration', estimatedExpiration.toISOString());
            }
            
            return true;
          } else {
            console.log('ℹ️ No active subscription found in purchases');
            this.hasActiveSubscription = false;
            localStorage.removeItem('diaBlockSubscriptionActive');
            localStorage.removeItem('diaBlockSubscriptionExpiration');
            this.subscriptionExpirationDate = null;
            return false;
          }
        } catch (queryError) {
          console.error('❌ Error querying purchases:', queryError);
          // Fallback to localStorage if query fails
          const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
          if (cachedStatus === 'true') {
            // Verify expiration
            if (!this.checkSubscriptionExpired()) {
              console.log('✅ Using cached subscription status (offline mode)');
              this.hasActiveSubscription = true;
              return true;
            }
          }
          this.hasActiveSubscription = false;
          return false;
        }
      }
      
      // Web/development fallback - check localStorage
      const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
      if (cachedStatus === 'true') {
        // Check expiration
        if (!this.checkSubscriptionExpired()) {
          console.log('✅ Subscription status from cache (web/development mode)');
          this.hasActiveSubscription = true;
          return true;
        }
      }
      
      console.log('ℹ️ No active subscription found');
      this.hasActiveSubscription = false;
      return false;
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
      // Fallback to cached status on error
      const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
      if (cachedStatus === 'true' && !this.checkSubscriptionExpired()) {
        this.hasActiveSubscription = true;
        return true;
      }
      this.hasActiveSubscription = false;
      return false;
    }
  }

  /**
   * Restore purchases (for users who reinstall or change devices)
   */
  async restorePurchases() {
    console.log('💰 BillingService: Restoring purchases...');

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        await NativePurchases.restorePurchases();
        console.log('✅ Purchases restored');
        
        // Re-check subscription status
        const hasSubscription = await this.checkSubscriptionStatus();
        return hasSubscription;
      }
      
      // Web fallback - check localStorage
      const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
      if (cachedStatus === 'true') {
        console.log('✅ Restored from localStorage');
        this.hasActiveSubscription = true;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Restore purchases error:', error);
      return false;
    }
  }

  /**
   * Open subscription management (Google Play/App Store)
   */
  async manageSubscriptions() {
    console.log('💰 BillingService: Opening subscription management...');

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        await NativePurchases.manageSubscriptions();
        console.log('✅ Opened subscription management');
        return true;
      } else {
        // Web - open Google Play subscriptions page
        window.open('https://play.google.com/store/account/subscriptions', '_blank');
        return true;
      }
    } catch (error) {
      console.error('❌ Error opening subscription management:', error);
      return false;
    }
  }

  /**
   * Check if user has active "No Ads" subscription
   */
  hasNoAdsSubscription() {
    // Check expiration before returning status
    this.checkSubscriptionExpired();
    return this.hasActiveSubscription;
  }

  /**
   * Alias for backwards compatibility
   */
  hasNoAdsPurchase() {
    return this.hasActiveSubscription;
  }

  /**
   * Get current price string
   */
  getPriceString() {
    return this.priceString;
  }

  /**
   * Get subscription expiration date
   */
  getSubscriptionExpiration() {
    return this.subscriptionExpirationDate;
  }

  /**
   * Format expiration date for display
   */
  getFormattedExpirationDate() {
    if (!this.subscriptionExpirationDate) {
      return null;
    }
    return this.subscriptionExpirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ==================== DEBUG METHODS ====================

  /**
   * DEBUG: Reset subscription status (for testing)
   */
  resetSubscription() {
    console.log('🔧 DEBUG: Resetting subscription status');
    this.hasActiveSubscription = false;
    localStorage.removeItem('diaBlockSubscriptionActive');
    localStorage.removeItem('diaBlockLastTransactionId');
    // Also remove old key for backwards compatibility
    localStorage.removeItem('diaBlockNoAdsPurchased');
    console.log('✅ Subscription status reset. Ads should now show.');
    return true;
  }

  /**
   * DEBUG: Get subscription status
   */
  getStatus() {
    const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
    const lastTransactionId = localStorage.getItem('diaBlockLastTransactionId');
    return {
      hasActiveSubscription: this.hasActiveSubscription,
      cachedStatus: cachedStatus,
      lastTransactionId: lastTransactionId,
      productId: this.productId,
      planId: this.planId,
      priceString: this.priceString,
      adsEnabled: !this.hasActiveSubscription,
      isInitialized: this.isInitialized
    };
  }

  /**
   * DEBUG: Simulate subscription (for web testing)
   */
  simulateSubscription() {
    console.log('🔧 DEBUG: Simulating active subscription');
    this.hasActiveSubscription = true;
    localStorage.setItem('diaBlockSubscriptionActive', 'true');
    console.log('✅ Subscription simulated. Ads should be hidden.');
    return true;
  }
}

export const billingService = new BillingService();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.billingService = billingService;
}
