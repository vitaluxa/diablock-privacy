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
    
    // Subscription product configuration
    // These IDs must match what you create in Google Play Console
    this.productId = 'no_ads_monthly';        // Product ID in Google Play Console
    this.planId = 'monthly-plan';             // Base Plan ID in Google Play Console (required for Android subscriptions)
    this.priceString = '$5.99/month';         // Display price (will be updated from store)
    
    // Check localStorage for cached subscription status (quick UI update)
    // Real status will be verified when billing initializes
    const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
    this.hasActiveSubscription = cachedStatus === 'true';
  }

  /**
   * Initialize billing service
   */
  async initialize() {
    if (this.isInitialized) return true;

    console.log('💰 BillingService: Initializing...');

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        // Check if billing is supported on this device
        const { isBillingSupported } = await NativePurchases.isBillingSupported();
        
        if (!isBillingSupported) {
          console.warn('⚠️ BillingService: Billing not supported on this device');
          this.isInitialized = true;
          return true;
        }

        console.log('✅ BillingService: Billing is supported');

        // Restore/verify any existing subscriptions
        await this.checkSubscriptionStatus();
        
        console.log('✅ BillingService: Initialized');
        this.isInitialized = true;
        return true;
      } else {
        console.warn('⚠️ BillingService: Not on mobile platform, using mock mode');
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('❌ BillingService: Initialization failed:', error);
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
      
      if (platform === 'android' || platform === 'ios') {
        // Real purchase flow
        const purchaseOptions = {
          productIdentifier: this.productId,
          productType: PURCHASE_TYPE.SUBS,
          quantity: 1
        };

        // Android subscriptions require planIdentifier
        if (platform === 'android') {
          purchaseOptions.planIdentifier = this.planId;
        }

        console.log('📤 Initiating purchase with options:', purchaseOptions);
        
        const result = await NativePurchases.purchaseProduct(purchaseOptions);
        
        console.log('📥 Purchase result:', result);
        
        if (result && result.transactionId) {
          console.log('✅ Subscription purchase successful! Transaction:', result.transactionId);
          this.hasActiveSubscription = true;
          localStorage.setItem('diaBlockSubscriptionActive', 'true');
          localStorage.setItem('diaBlockLastTransactionId', result.transactionId);
          return { success: true, transactionId: result.transactionId };
        } else {
          console.log('❌ Purchase result invalid');
          return { success: false, error: 'Purchase failed' };
        }
      } else {
        // Web/development mode - mock purchase with confirmation
        console.log('🧪 Mock purchase for web/development');
        const confirmed = confirm(`Subscribe to "No Ads" for ${this.priceString}?\n\nThis will remove all advertisements from the game.`);
        if (confirmed) {
          this.hasActiveSubscription = true;
          localStorage.setItem('diaBlockSubscriptionActive', 'true');
          return { success: true };
        }
        return { success: false, error: 'User cancelled' };
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      
      // Check for user cancellation
      if (error.message && (
        error.message.includes('cancelled') || 
        error.message.includes('canceled') ||
        error.message.includes('User cancelled')
      )) {
        return { success: false, error: 'User cancelled' };
      }
      
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Check current subscription status
   */
  async checkSubscriptionStatus() {
    console.log('💰 BillingService: Checking subscription status...');

    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' || platform === 'ios') {
        // Restore purchases to get current subscription status
        await NativePurchases.restorePurchases();
        
        // After restore, the plugin updates the purchase state
        // We need to query for active subscriptions
        // For now, we'll keep the localStorage check as fallback
        const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
        if (cachedStatus === 'true') {
          console.log('✅ Active subscription found (cached)');
          this.hasActiveSubscription = true;
          return true;
        }
      }
      
      // Check localStorage fallback
      const cachedStatus = localStorage.getItem('diaBlockSubscriptionActive');
      if (cachedStatus === 'true') {
        console.log('✅ Subscription status restored from cache');
        this.hasActiveSubscription = true;
        return true;
      }
      
      console.log('ℹ️ No active subscription found');
      this.hasActiveSubscription = false;
      return false;
    } catch (error) {
      console.error('❌ Error checking subscription status:', error);
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
