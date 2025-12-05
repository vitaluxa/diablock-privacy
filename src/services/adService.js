/**
 * AdMob Service for Dia Block Game
 * Handles banner and interstitial ads using Capacitor AdMob plugin
 */

import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { billingService } from './billingService';

class AdService {
  constructor() {
    this.isInitialized = false;
    this.levelsCompletedSinceLastAd = 0;
    this.levelsUntilNextAd = this.getRandomAdInterval(); // 5-10 levels
    this.bannerVisible = false;
    this.bannerShown = false;
    this.bannerLoading = false;
    this.bannerRetryCount = 0;
    this.maxBannerRetries = 3;
    
    // REAL AdMob IDs from your AdMob console
    this.adConfig = {
      appId: 'ca-app-pub-6942733289376891~1776891763',
      // Bottom banner ID
      bannerId: 'ca-app-pub-6942733289376891/1585320077',
      // Interstitial ID
      interstitialId: 'ca-app-pub-6942733289376891/5332993392',
    };

    this.interstitialLoaded = false;
    this.interstitialRetryCount = 0;
    this.maxInterstitialRetries = 3;
  }

  /**
   * Get random interval for next ad (5-10 levels)
   */
  getRandomAdInterval() {
    return Math.floor(Math.random() * 6) + 5;
  }

  /**
   * Set up AdMob event listeners
   */
  setupEventListeners() {
    // Banner events
    AdMob.addListener('bannerAdLoaded', () => {
      console.log('✅ BANNER AD LOADED SUCCESSFULLY!');
      this.bannerVisible = true;
      this.bannerShown = true;
      this.bannerLoading = false;
      this.bannerRetryCount = 0; // Reset retry count on success
    });

    AdMob.addListener('bannerAdSizeChanged', (size) => {
      console.log('📐 Banner size:', JSON.stringify(size));
    });

    AdMob.addListener('bannerAdImpression', () => {
      console.log('👁️ Banner ad impression - AD IS SHOWING!');
    });

    AdMob.addListener('bannerAdFailedToLoad', (error) => {
      console.error('❌ Banner failed:', JSON.stringify(error));
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
      this.bannerRetryCount++;
      
      // Only retry if under max retries, with exponential backoff
      if (this.bannerRetryCount <= this.maxBannerRetries) {
        const delay = Math.min(60000, 15000 * this.bannerRetryCount); // 15s, 30s, 45s, max 60s
        console.log(`🔄 Will retry banner in ${delay/1000}s (attempt ${this.bannerRetryCount}/${this.maxBannerRetries})`);
        setTimeout(() => this.showBanner(), delay);
      } else {
        console.log('⚠️ Max banner retries reached. Will try again on next level.');
      }
    });

    // Interstitial events
    AdMob.addListener('interstitialAdLoaded', () => {
      console.log('✅ INTERSTITIAL AD LOADED!');
      this.interstitialLoaded = true;
      this.interstitialRetryCount = 0;
    });

    AdMob.addListener('interstitialAdFailedToLoad', (error) => {
      console.error('❌ Interstitial failed to load:', JSON.stringify(error));
      this.interstitialLoaded = false;
      this.interstitialRetryCount++;
      
      if (this.interstitialRetryCount <= this.maxInterstitialRetries) {
        const delay = Math.min(60000, 20000 * this.interstitialRetryCount);
        console.log(`🔄 Will retry interstitial in ${delay/1000}s`);
        setTimeout(() => this.loadInterstitial(), delay);
      }
    });

    AdMob.addListener('interstitialAdShowed', () => {
      console.log('✅ INTERSTITIAL AD SHOWED!');
    });

    AdMob.addListener('interstitialAdDismissed', () => {
      console.log('👋 Interstitial dismissed');
      this.interstitialLoaded = false;
      // Reload for next time
      setTimeout(() => this.loadInterstitial(), 2000);
      // Re-show banner after interstitial
      setTimeout(() => {
        this.bannerRetryCount = 0; // Reset retries
        this.showBanner();
      }, 1000);
    });

    AdMob.addListener('interstitialAdFailedToShow', (error) => {
      console.error('❌ Interstitial failed to show:', JSON.stringify(error));
      this.interstitialLoaded = false;
      this.loadInterstitial();
    });

    console.log('📱 AdMob event listeners ready');
  }

  /**
   * Initialize AdMob
   */
  async init() {
    if (this.isInitialized) {
      console.log('📱 AdService already initialized');
      return;
    }
    
    console.log('📱 AdService: Initializing...');

    // Check for "No Ads" purchase
    await billingService.initialize();
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 User has "No Ads" purchase. Ads disabled.');
      this.isInitialized = true;
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        console.log('📱 Platform:', platform);
        
        if (platform === 'android' || platform === 'ios') {
          // Set up listeners FIRST
          this.setupEventListeners();

          // Initialize AdMob
          await AdMob.initialize({
            requestTrackingAuthorization: false,
            initializeForTesting: false,
          });

          console.log('✅ AdMob initialized - REAL ADS MODE');
          console.log('📱 Banner ID:', this.adConfig.bannerId);
          console.log('📱 Interstitial ID:', this.adConfig.interstitialId);
          
          this.isInitialized = true;
          
          // Wait a bit before first ad request
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Show banner
          await this.showBanner();
          
          // Load interstitial
          await this.loadInterstitial();
          
        } else {
          console.log('⚠️ Not on mobile, mock mode');
          this.showMockBanner();
          this.isInitialized = true;
        }
      } else {
        console.log('⚠️ Not in Capacitor, mock mode');
        this.showMockBanner();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('❌ AdMob init error:', error);
      this.showMockBanner();
      this.isInitialized = true;
    }
  }

  /**
   * Show banner ad
   */
  async showBanner() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 No ads - banner skipped');
      return;
    }

    // Prevent multiple simultaneous requests
    if (this.bannerLoading) {
      console.log('⏳ Banner already loading...');
      return;
    }

    console.log('📱 Requesting banner ad...');
    this.bannerLoading = true;

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          
          const options = {
            adId: this.adConfig.bannerId,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: false,
          };

          console.log('📱 Banner request:', this.adConfig.bannerId);
          await AdMob.showBanner(options);
          console.log('✅ Banner request sent');
          return;
        }
      }
      
      // Web fallback
      this.showMockBanner();
      this.bannerVisible = true;
      this.bannerShown = true;
      this.bannerLoading = false;
    } catch (error) {
      console.error('❌ Banner error:', error);
      this.bannerLoading = false;
      this.bannerVisible = false;
      this.bannerShown = false;
    }
  }

  /**
   * Ensure banner is visible
   */
  async ensureBannerVisible() {
    if (billingService.hasNoAdsPurchase()) {
      return;
    }

    if (!this.isInitialized) {
      await this.init();
      return;
    }

    // Only request if not already showing/loading
    if (!this.bannerShown && !this.bannerLoading) {
      console.log('🔄 Re-requesting banner...');
      this.bannerRetryCount = 0; // Reset retries when explicitly called
      await this.showBanner();
    }
  }

  /**
   * Hide banner
   */
  async hideBanner() {
    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          await AdMob.hideBanner();
          console.log('✅ Banner hidden');
        }
      }
      this.hideMockBanner();
      this.bannerVisible = false;
      this.bannerShown = false;
      this.bannerLoading = false;
    } catch (error) {
      console.error('❌ Hide banner error:', error);
    }
  }

  /**
   * Load interstitial
   */
  async loadInterstitial() {
    if (billingService.hasNoAdsPurchase()) {
      return;
    }

    if (this.interstitialLoaded) {
      console.log('📱 Interstitial already loaded');
      return;
    }

    console.log('📱 Loading interstitial...');

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          await AdMob.prepareInterstitial({
            adId: this.adConfig.interstitialId,
            isTesting: false,
          });
          console.log('✅ Interstitial prepare request sent');
          return;
        }
      }
      
      // Web fallback
      this.interstitialLoaded = true;
    } catch (error) {
      console.error('❌ Load interstitial error:', error);
      this.interstitialLoaded = false;
    }
  }

  /**
   * Show interstitial
   */
  async showInterstitial() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 No ads - interstitial skipped');
      return;
    }

    console.log('📱 Attempting to show interstitial...');
    console.log('📱 Interstitial loaded:', this.interstitialLoaded);

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          if (!this.interstitialLoaded) {
            console.log('⚠️ Interstitial not loaded, loading now...');
            await this.loadInterstitial();
            // Give it time to load
            await new Promise(resolve => setTimeout(resolve, 3000));
            if (!this.interstitialLoaded) {
              console.log('⚠️ Interstitial still not ready');
              return;
            }
          }

          await AdMob.showInterstitial();
          console.log('✅ Interstitial show request sent');
          this.interstitialLoaded = false;
          return;
        }
      }
      
      // Web fallback
      await this.showMockInterstitial();
      this.interstitialLoaded = false;
      this.loadInterstitial();
    } catch (error) {
      console.error('❌ Show interstitial error:', error);
      this.interstitialLoaded = false;
      this.loadInterstitial();
    }
  }

  /**
   * Called when level is completed
   */
  async onLevelCompleted() {
    if (billingService.hasNoAdsPurchase()) {
      return;
    }

    this.levelsCompletedSinceLastAd++;
    console.log(`📊 Levels since last ad: ${this.levelsCompletedSinceLastAd}/${this.levelsUntilNextAd}`);

    // Try to ensure banner is visible
    this.bannerRetryCount = 0; // Reset retries on level complete
    await this.ensureBannerVisible();

    if (this.levelsCompletedSinceLastAd >= this.levelsUntilNextAd) {
      console.log('🎬 Time for interstitial!');
      await this.showInterstitial();
      
      this.levelsCompletedSinceLastAd = 0;
      this.levelsUntilNextAd = this.getRandomAdInterval();
      console.log(`📊 Next interstitial in ${this.levelsUntilNextAd} levels`);
    }
  }

  /**
   * Remove ads after purchase
   */
  async removeAds() {
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 Removing all ads...');
      await this.hideBanner();
      try {
        await AdMob.removeBanner();
      } catch (e) {}
    }
  }

  /**
   * Get status for debugging
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      bannerVisible: this.bannerVisible,
      bannerShown: this.bannerShown,
      bannerLoading: this.bannerLoading,
      bannerRetryCount: this.bannerRetryCount,
      interstitialLoaded: this.interstitialLoaded,
      levelsCompletedSinceLastAd: this.levelsCompletedSinceLastAd,
      levelsUntilNextAd: this.levelsUntilNextAd,
      hasNoAdsPurchase: billingService.hasNoAdsPurchase(),
      bannerId: this.adConfig.bannerId,
      interstitialId: this.adConfig.interstitialId,
    };
  }

  /**
   * Force refresh banner
   */
  async forceShowBanner() {
    console.log('🔧 Force refreshing banner...');
    this.bannerRetryCount = 0;
    this.bannerLoading = false;
    this.bannerShown = false;
    try {
      await AdMob.removeBanner();
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.showBanner();
  }

  // Mock methods for web testing
  showMockBanner() {
    if (typeof document === 'undefined') return;
    this.hideMockBanner();
    const banner = document.createElement('div');
    banner.id = 'mock-ad-banner';
    banner.style.cssText = `
      position: fixed; bottom: 0; left: 0; width: 100%; height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 12px; z-index: 1000;
    `;
    banner.innerHTML = '📢 AdMob Banner (Web Mode)';
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
        position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 9999;
        display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;
      `;
      overlay.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">📺</div>
          <div style="font-size: 24px; margin-bottom: 10px;">Interstitial Ad</div>
          <div style="font-size: 14px; color: #aaa; margin-bottom: 30px;">Web Mode</div>
          <button id="close-mock-ad" style="padding: 12px 24px; background: white; color: black; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
      `;
      document.body.appendChild(overlay);
      const close = () => { overlay.remove(); resolve(); };
      document.getElementById('close-mock-ad').onclick = close;
      setTimeout(close, 3000);
    });
  }
}

export const adService = new AdService();

// Debug access
if (typeof window !== 'undefined') {
  window.adService = adService;
}
