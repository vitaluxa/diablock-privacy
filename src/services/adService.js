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
    this.bannerVisible = false; // Track banner visibility state
    this.bannerShown = false; // Track if banner was successfully shown
    
    // LIVE AdMob IDs from your AdMob console
    this.adConfig = {
      appId: 'ca-app-pub-6942733289376891~1776891763',
      // Using the first banner from your screenshot
      bannerId: 'ca-app-pub-6942733289376891/4351100120',
      // Your interstitial ID
      interstitialId: 'ca-app-pub-6942733289376891/5332993392',
    };

    this.interstitialLoaded = false;
  }

  /**
   * Get random interval for next ad (5-10 levels)
   */
  getRandomAdInterval() {
    return Math.floor(Math.random() * 6) + 5; // Random between 5-10
  }

  /**
   * Initialize AdMob
   */
  async init() {
    if (this.isInitialized) return;
    
    console.log('📱 AdService: Initializing...');

    // Check if user has purchased "No Ads"
    await billingService.initialize();
    if (billingService.hasNoAdsPurchase()) {
      console.log('💎 AdService: User has purchased "No Ads". Ads disabled.');
      return;
    }

    try {
      // Check if running on Android/iOS with Capacitor
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          await AdMob.initialize({
            requestTrackingAuthorization: false,
            initializeForTesting: false, // LIVE MODE - set to false for production
          });

          console.log(`✅ AdMob initialized in LIVE mode on ${platform}`);
          
          // Show banner ad
          await this.showBanner();
          
          // Preload first interstitial
          await this.loadInterstitial();
          
          this.isInitialized = true;
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
      // Fallback to mock ads
      this.showMockBanner();
      this.isInitialized = true;
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
      return;
    }

    try {
      // Check if running on Android/iOS
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          // First, try to remove any existing banner to ensure clean state
          try {
            await AdMob.removeBanner();
          } catch (e) {
            // Ignore if banner doesn't exist
          }
          
          const options = {
            adId: this.adConfig.bannerId,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
          };

          await AdMob.showBanner(options);
          console.log('✅ Banner ad shown on', platform);
          this.bannerVisible = true;
          this.bannerShown = true;
          return;
        }
      }
      
      // Fallback to mock for web/browser
      console.log('🧪 Mock: Banner ad (web/browser mode)');
      this.showMockBanner();
      this.bannerVisible = true;
      this.bannerShown = true;
    } catch (error) {
      console.error('❌ Failed to show banner:', error);
      this.bannerVisible = false;
      this.bannerShown = false;
      
      // Retry after a short delay
      setTimeout(async () => {
        try {
          if (typeof window !== 'undefined' && window.Capacitor) {
            const platform = window.Capacitor.getPlatform();
            if (platform === 'android' || platform === 'ios') {
              const options = {
                adId: this.adConfig.bannerId,
                adSize: BannerAdSize.BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
              };
              await AdMob.showBanner(options);
              console.log('✅ Banner ad shown on retry');
              this.bannerVisible = true;
              this.bannerShown = true;
            }
          }
        } catch (retryError) {
          console.error('❌ Banner retry also failed:', retryError);
        }
      }, 1000);
      
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
      await this.init();
      return;
    }

    // Always try to show banner if not visible or not shown yet
    if (!this.bannerVisible || !this.bannerShown) {
      console.log('🔄 Ensuring banner is visible...');
      await this.showBanner();
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
          return;
        }
      }
      
      this.hideMockBanner();
      this.bannerVisible = false;
    } catch (error) {
      console.error('❌ Failed to hide banner:', error);
      this.bannerVisible = false;
    }
  }

  /**
   * Load interstitial ad
   */
  async loadInterstitial() {
    if (billingService.hasNoAdsPurchase()) return;

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          await AdMob.prepareInterstitial({
            adId: this.adConfig.interstitialId,
          });
          this.interstitialLoaded = true;
          console.log('✅ Interstitial ad loaded');
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

    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          if (!this.interstitialLoaded) {
            console.log('⚠️ Interstitial not loaded yet');
            await this.loadInterstitial();
            return;
          }

          await AdMob.showInterstitial();
          console.log('✅ Interstitial ad shown');
          
          // Banner might be hidden after interstitial, mark as not visible
          this.bannerVisible = false;
          
          // Reload for next time
          this.interstitialLoaded = false;
          await this.loadInterstitial();
          return;
        }
      }
      
      // Fallback for web/browser
      console.log('🧪 Mock: Showing interstitial ad (web/browser mode)');
      await this.showMockInterstitial();
      
      // Reload for next time
      this.interstitialLoaded = false;
      await this.loadInterstitial();
    } catch (error) {
      console.error('❌ Failed to show interstitial:', error);
    }
  }

  /**
   * Called when a level is completed
   * Determines if an interstitial ad should be shown
   */
  async onLevelCompleted() {
    if (billingService.hasNoAdsPurchase()) return;

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
      
      // Ensure banner is visible after interstitial
      await this.ensureBannerVisible();
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
    } else {
      console.warn('⚠️ removeAds called but user has not purchased "No Ads"');
    }
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
    banner.innerHTML = '<span>📢 AdMob Banner (Web/Browser Mode - Real ads show on Android/iOS)</span>';
    document.body.appendChild(banner);
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
          <div style="font-size: 14px; color: #aaa; margin-bottom: 30px;">LIVE MODE - Real ads will show here</div>
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
