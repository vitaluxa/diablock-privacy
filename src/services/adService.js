/**
 * AdMob Service for Dia Block Game
 * Handles banner and interstitial ads using Capacitor AdMob plugin
 */

import { AdMob, BannerAdSize, BannerAdPosition, AdmobConsentStatus } from '@capacitor-community/admob';
import { billingService } from './billingService';

class AdService {
  constructor() {
    this.isInitialized = false;
    this.levelsCompletedSinceLastAd = 0;
    this.levelsUntilNextAd = this.getRandomAdInterval(); // 5-10 levels
    this.bannerVisible = false; // Track banner visibility state
    this.bannerShown = false; // Track if banner was successfully shown
    this.bannerLoading = false; // Track if banner is currently loading
    
    // AdMob configuration - USING REAL ADS
    this.useTestAds = false; // PRODUCTION MODE - Real ads
    
    // Test device ID from logcat (for debugging)
    this.testDeviceId = '125A60BAE4350D790B63FBF7C3BB0F1D';
    
    // LIVE AdMob IDs from your AdMob console
    this.adConfig = {
      appId: 'ca-app-pub-6942733289376891~1776891763',
      // Bottom banner ID (specifically for bottom placement)
      bannerId: 'ca-app-pub-6942733289376891/1585320077',
      // Interstitial ID (working)
      interstitialId: 'ca-app-pub-6942733289376891/5332993392',
    };
    
    // Use live IDs
    this.bannerId = this.adConfig.bannerId;
    this.interstitialId = this.adConfig.interstitialId;

    this.interstitialLoaded = false;
    this.initializationAttempts = 0;
    this.maxInitAttempts = 3;
  }

  /**
   * Get random interval for next ad (5-10 levels)
   */
  getRandomAdInterval() {
    return Math.floor(Math.random() * 6) + 5; // Random between 5-10
  }

  /**
   * Set up AdMob event listeners for debugging
   */
  setupEventListeners() {
    // Banner events
    AdMob.addListener('bannerAdLoaded', () => {
      console.log('✅ Banner ad loaded successfully');
      this.bannerVisible = true;
      this.bannerShown = true;
      this.bannerLoading = false;
    });

    AdMob.addListener('bannerAdSizeChanged', (size) => {
      console.log('📐 Banner size changed:', size);
    });

    AdMob.addListener('bannerAdImpression', () => {
      console.log('👁️ Banner ad impression');
    });

    AdMob.addListener('bannerAdFailedToLoad', (error) => {
      console.error('❌ Banner ad failed to load:', JSON.stringify(error));
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
      // Retry after delay
      setTimeout(() => this.showBanner(), 10000);
    });

    // Interstitial events
    AdMob.addListener('interstitialAdLoaded', () => {
      console.log('✅ Interstitial ad loaded');
      this.interstitialLoaded = true;
    });

    AdMob.addListener('interstitialAdFailedToLoad', (error) => {
      console.error('❌ Interstitial ad failed to load:', JSON.stringify(error));
      console.error('❌ Interstitial error code:', error?.code);
      console.error('❌ Interstitial error message:', error?.message);
      this.interstitialLoaded = false;
      // Retry loading after delay
      setTimeout(() => this.loadInterstitial(), 10000);
    });

    AdMob.addListener('interstitialAdShowed', () => {
      console.log('✅ Interstitial ad showed');
    });

    AdMob.addListener('interstitialAdDismissed', () => {
      console.log('👋 Interstitial ad dismissed');
      this.interstitialLoaded = false;
      // Reload for next time
      this.loadInterstitial();
      // Re-show banner after interstitial
      setTimeout(() => this.showBanner(), 500);
    });

    AdMob.addListener('interstitialAdFailedToShow', (error) => {
      console.error('❌ Interstitial ad failed to show:', JSON.stringify(error));
      this.interstitialLoaded = false;
      this.loadInterstitial();
    });

    console.log('📱 AdMob event listeners set up');
  }

  /**
   * Initialize AdMob
   */
  async init() {
    if (this.isInitialized) {
      console.log('📱 AdService: Already initialized');
      return;
    }
    
    console.log('📱 AdService: Initializing...');

    // Check if user has purchased "No Ads"
    await billingService.initialize();
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 AdService: User has purchased "No Ads". Ads disabled.');
      this.isInitialized = true;
      return;
    }

    try {
      // Check if running on Android/iOS with Capacitor
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        console.log('📱 Platform detected:', platform);
        
        if (platform === 'android' || platform === 'ios') {
          // Set up event listeners first
          this.setupEventListeners();

          // Initialize AdMob - PRODUCTION MODE
          await AdMob.initialize({
            requestTrackingAuthorization: false,
            initializeForTesting: false,
          });

          console.log(`✅ AdMob initialized on ${platform} - REAL ADS MODE`);
          console.log(`📱 Banner ID: ${this.bannerId}`);
          console.log(`📱 Interstitial ID: ${this.interstitialId}`);
          this.isInitialized = true;
          
          // Small delay to ensure AdMob is fully ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Show banner ad
          await this.showBanner();
          
          // Preload first interstitial
          await this.loadInterstitial();
          
        } else {
          console.warn('⚠️ AdService: Not on Android/iOS, using mock mode');
          this.showMockBanner();
          this.isInitialized = true;
        }
      } else {
        console.warn('⚠️ AdService: Not in Capacitor environment, using mock mode');
        this.showMockBanner();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ AdMob initialization failed:', error);
      this.initializationAttempts++;
      
      // Retry initialization
      if (this.initializationAttempts < this.maxInitAttempts) {
        console.log(`🔄 Retrying initialization (attempt ${this.initializationAttempts + 1}/${this.maxInitAttempts})...`);
        setTimeout(() => this.init(), 2000);
      } else {
        // Fallback to mock ads
        this.showMockBanner();
        this.isInitialized = true;
      }
    }
  }

  /**
   * Show banner ad at bottom of screen
   */
  async showBanner() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 Banner not shown: User has "No Ads" purchase');
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
      return;
    }

    // Don't restart banner request if already loading or shown
    if (this.bannerLoading) {
      console.log('⏳ Banner already loading, skipping...');
      return;
    }

    if (this.bannerShown && this.bannerVisible) {
      console.log('✅ Banner already shown, skipping...');
      return;
    }

    console.log('📱 AdService: Attempting to show banner...');
    this.bannerLoading = true;

    try {
      // Check if running on Android/iOS
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          // Only remove banner if not already showing
          if (!this.bannerShown) {
            try {
              await AdMob.removeBanner();
              console.log('🗑️ Removed existing banner');
            } catch (e) {
              // Ignore if banner doesn't exist
            }
            
            // Small delay after removing
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const options = {
            adId: this.bannerId,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
          };

          console.log('📱 Banner options:', JSON.stringify(options));
          await AdMob.showBanner(options);
          console.log('✅ Banner ad request sent on', platform);
          // Note: bannerLoading will be set to false in the event listener
          return;
        }
      }
      
      // Fallback to mock for web/browser
      console.log('🧪 Mock: Banner ad (web/browser mode)');
      this.showMockBanner();
      this.bannerVisible = true;
      this.bannerShown = true;
      this.bannerLoading = false;
    } catch (error) {
      console.error('❌ Failed to show banner:', error);
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
      
      // Retry after a short delay
      setTimeout(async () => {
        console.log('🔄 Retrying banner...');
        this.bannerLoading = true;
        try {
          if (typeof window !== 'undefined' && window.Capacitor) {
            const platform = window.Capacitor.getPlatform();
            if (platform === 'android' || platform === 'ios') {
              const options = {
                adId: this.bannerId,
                adSize: BannerAdSize.BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: false,
              };
              await AdMob.showBanner(options);
              console.log('✅ Banner ad shown on retry');
            }
          }
        } catch (retryError) {
          console.error('❌ Banner retry also failed:', retryError);
          this.bannerLoading = false;
        }
      }, 3000);
      
      // Show mock banner as fallback for web
      this.showMockBanner();
    }
  }

  /**
   * Ensure banner is visible (call this to make sure banner stays visible)
   */
  async ensureBannerVisible() {
    if (billingService.hasNoAdsPurchase()) {
      // Hide banner if user has no ads
      if (this.bannerVisible) {
        await this.hideBanner();
      }
      return;
    }

    // Check if already initialized
    if (!this.isInitialized) {
      console.log('🔄 AdService not initialized, initializing now...');
      await this.init();
      return;
    }

    // Skip if banner is already shown or loading
    if (this.bannerShown || this.bannerLoading) {
      console.log('📱 Banner already shown/loading, skipping ensureBannerVisible');
      return;
    }

    // Check platform
    if (typeof window !== 'undefined' && window.Capacitor) {
      const platform = window.Capacitor.getPlatform();
      if (platform === 'android' || platform === 'ios') {
        console.log('🔄 Ensuring banner is visible...');
        await this.showBanner();
      }
    }
  }

  /**
   * Hide banner ad
   */
  async hideBanner() {
    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          await AdMob.hideBanner();
          console.log('✅ Banner ad hidden');
          this.bannerVisible = false;
          this.bannerShown = false;
          this.bannerLoading = false;
          return;
        }
      }
      
      this.hideMockBanner();
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
    } catch (error) {
      console.error('❌ Failed to hide banner:', error);
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
    }
  }

  /**
   * Load interstitial ad
   */
  async loadInterstitial() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 Interstitial not loaded: User has "No Ads" purchase');
      return;
    }

    if (this.interstitialLoaded) {
      console.log('📱 Interstitial already loaded');
      return;
    }

    console.log('📱 AdService: Loading interstitial...');

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          console.log('📱 Loading interstitial with ID:', this.interstitialId);
          await AdMob.prepareInterstitial({
            adId: this.interstitialId,
            isTesting: false,
          });
          console.log('✅ Interstitial ad prepare request sent');
          return;
        }
      }
      
      // Fallback for web/browser
      console.log('🧪 Mock: Interstitial ad loaded (web/browser mode)');
      this.interstitialLoaded = true;
    } catch (error) {
      console.error('❌ Failed to load interstitial:', error);
      this.interstitialLoaded = false;
    }
  }

  /**
   * Show interstitial ad
   */
  async showInterstitial() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 No ads purchased, skipping interstitial');
      return;
    }

    console.log('📱 AdService: Attempting to show interstitial...');
    console.log('📊 Interstitial loaded:', this.interstitialLoaded);

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          if (!this.interstitialLoaded) {
            console.log('⚠️ Interstitial not loaded yet, loading now...');
            await this.loadInterstitial();
            // Wait a bit for it to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (!this.interstitialLoaded) {
              console.log('⚠️ Interstitial still not loaded, skipping');
              return;
            }
          }

          await AdMob.showInterstitial();
          console.log('✅ Interstitial show request sent');
          this.interstitialLoaded = false;
          return;
        }
      }
      
      // Fallback for web/browser
      console.log('🧪 Mock: Showing interstitial ad (web/browser mode)');
      await this.showMockInterstitial();
      this.interstitialLoaded = false;
      await this.loadInterstitial();
    } catch (error) {
      console.error('❌ Failed to show interstitial:', error);
      this.interstitialLoaded = false;
      // Reload for next time
      this.loadInterstitial();
    }
  }

  /**
   * Called when a level is completed
   * Determines if an interstitial ad should be shown
   */
  async onLevelCompleted() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 No ads purchased, skipping ad check');
      return;
    }

    // Ensure banner is still visible
    await this.ensureBannerVisible();

    this.levelsCompletedSinceLastAd++;
    console.log(`📊 Levels since last ad: ${this.levelsCompletedSinceLastAd}/${this.levelsUntilNextAd}`);

    if (this.levelsCompletedSinceLastAd >= this.levelsUntilNextAd) {
      console.log('🎬 Time to show interstitial ad!');
      await this.showInterstitial();
      
      // Reset counter and set new random interval
      this.levelsCompletedSinceLastAd = 0;
      this.levelsUntilNextAd = this.getRandomAdInterval();
      console.log(`📊 Next ad in ${this.levelsUntilNextAd} levels`);
      
      // Ensure banner is visible after interstitial (with delay)
      setTimeout(() => this.ensureBannerVisible(), 1000);
    }
  }

  /**
   * Remove ads (called after purchase)
   */
  async removeAds() {
    // Only hide if user actually has the purchase
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 Removing all ads...');
      await this.hideBanner();
      this.hideMockBanner();
      try {
        await AdMob.removeBanner();
      } catch (e) {
        // Ignore
      }
    } else {
      console.warn('⚠️ removeAds called but user has not purchased "No Ads"');
    }
  }

  /**
   * Force show banner (for debugging)
   */
  async forceShowBanner() {
    console.log('🔧 Force showing banner...');
    this.bannerVisible = false;
    this.bannerShown = false;
    this.bannerLoading = false;
    // Remove existing banner first
    try {
      await AdMob.removeBanner();
    } catch (e) {
      // Ignore
    }
    await this.showBanner();
  }

  /**
   * Get ad status (for debugging)
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      bannerVisible: this.bannerVisible,
      bannerShown: this.bannerShown,
      bannerLoading: this.bannerLoading,
      interstitialLoaded: this.interstitialLoaded,
      levelsCompletedSinceLastAd: this.levelsCompletedSinceLastAd,
      levelsUntilNextAd: this.levelsUntilNextAd,
      hasNoAdsPurchase: billingService.hasNoAdsPurchase(),
    };
  }

  // ===== MOCK AD METHODS FOR WEB/DEVELOPMENT =====

  showMockBanner() {
    if (typeof document === 'undefined') return;
    
    // Remove existing banner
    this.hideMockBanner();

    const banner = document.createElement('div');
    banner.id = 'mock-ad-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      z-index: 1000;
      border-top: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = '<span>📢 AdMob Banner (Web Mode - Real ads on Android)</span>';
    document.body.appendChild(banner);
    this.bannerVisible = true;
    this.bannerShown = true;
  }

  hideMockBanner() {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('mock-ad-banner');
    if (banner) banner.remove();
  }

  async showMockInterstitial() {
    if (typeof document === 'undefined') return;

    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.id = 'mock-interstitial';
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
      `;
      overlay.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">📺</div>
          <div style="font-size: 24px; margin-bottom: 10px;">AdMob Interstitial</div>
          <div style="font-size: 14px; color: #aaa; margin-bottom: 30px;">Real ads will show on Android device</div>
          <button id="close-ad-btn" style="padding: 12px 24px; background: white; color: black; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">Close Ad</button>
        </div>
      `;
      document.body.appendChild(overlay);

      // Auto-close after 3 seconds or on click
      const closeAd = () => {
        overlay.remove();
        resolve();
      };

      document.getElementById('close-ad-btn').onclick = closeAd;
      setTimeout(closeAd, 3000);
    });
  }
}

export const adService = new AdService();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.adService = adService;
}
