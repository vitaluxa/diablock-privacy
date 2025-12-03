/**
 * Google Play Billing Service
 * Handles in-app purchases for "No Ads" product
 */

// Import will work once @capacitor/in-app-purchases is installed
// import { InAppPurchase2 } from '@capacitor/in-app-purchases';

class BillingService {
  constructor() {
    this.isInitialized = false;
    this.hasPurchasedNoAds = false;
    this.productId = 'no_ads'; // Must match Google Play Console product ID
    
    // Check localStorage for purchase status
    const purchased = localStorage.getItem('diaBlockNoAdsPurchased');
    this.hasPurchasedNoAds = purchased === 'true';
  }

  /**
   * Initialize billing service
   */
  async initialize() {
    if (this.isInitialized) return true;

    console.log('💰 BillingService: Initializing...');

    try {
      // Check if running on Android with Capacitor
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
        // Initialize In-App Purchases plugin
        // Uncomment when plugin is installed:
        /*
        await InAppPurchase2.initialize({
          products: [
            {
              id: this.productId,
              type: 'non-consumable'
            }
          ]
        });
        */

        // Restore purchases (check if user already bought)
        await this.restorePurchases();
        
        console.log('✅ BillingService: Initialized');
        this.isInitialized = true;
        return true;
      } else {
        console.warn('⚠️ BillingService: Not on Android, using mock mode');
        this.isInitialized = true;
        return true;
      }
    } catch (error) {
      console.error('❌ BillingService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Purchase "No Ads" product
   */
  async purchaseNoAds() {
    console.log('💰 BillingService: Starting purchase flow...');

    try {
      // Check if running on Android
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
        // Uncomment when plugin is installed:
        /*
        const result = await InAppPurchase2.purchase({
          productId: this.productId
        });

        if (result.success) {
          console.log('✅ Purchase successful!');
          this.hasPurchasedNoAds = true;
          localStorage.setItem('diaBlockNoAdsPurchased', 'true');
          return { success: true };
        } else {
          console.log('❌ Purchase failed or cancelled');
          return { success: false, error: 'Purchase cancelled' };
        }
        */

        // Mock for development
        console.log('🧪 Mock purchase (plugin not installed yet)');
        this.hasPurchasedNoAds = true;
        localStorage.setItem('diaBlockNoAdsPurchased', 'true');
        return { success: true };
      } else {
        // Web/development mode - mock purchase
        console.log('🧪 Mock purchase for web');
        const confirmed = confirm('Purchase "No Ads" for $2.99?');
        if (confirmed) {
          this.hasPurchasedNoAds = true;
          localStorage.setItem('diaBlockNoAdsPurchased', 'true');
          return { success: true };
        }
        return { success: false, error: 'User cancelled' };
      }
    } catch (error) {
      console.error('❌ Purchase error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    console.log('💰 BillingService: Restoring purchases...');

    try {
      // Check if running on Android
      if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android') {
        // Uncomment when plugin is installed:
        /*
        const result = await InAppPurchase2.restorePurchases();
        
        if (result.purchases && result.purchases.length > 0) {
          const noAdsPurchase = result.purchases.find(p => p.productId === this.productId);
          if (noAdsPurchase) {
            console.log('✅ Found previous "No Ads" purchase');
            this.hasPurchasedNoAds = true;
            localStorage.setItem('diaBlockNoAdsPurchased', 'true');
            return true;
          }
        }
        */

        // For now, check localStorage
        const purchased = localStorage.getItem('diaBlockNoAdsPurchased');
        if (purchased === 'true') {
          console.log('✅ Restored from localStorage');
          this.hasPurchasedNoAds = true;
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Restore purchases error:', error);
      return false;
    }
  }

  /**
   * Check if user has purchased "No Ads"
   */
  hasNoAdsPurchase() {
    return this.hasPurchasedNoAds;
  }

  /**
   * Get product details
   */
  async getProductDetails() {
    // Uncomment when plugin is installed:
    /*
    try {
      const result = await InAppPurchase2.getProducts({
        productIds: [this.productId]
      });
      
      if (result.products && result.products.length > 0) {
        return result.products[0];
      }
    } catch (error) {
      console.error('Error getting product details:', error);
    }
    */

    // Mock product details
    return {
      id: this.productId,
      title: 'No Ads',
      description: 'Remove all advertisements from the game',
      price: '$2.99',
      currency: 'USD'
    };
  }
}

export const billingService = new BillingService();
