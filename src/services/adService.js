/**
 * Mock AdMob Service
 * Handles ad logic for development/web environment
 * In a real Cordova/Capacitor app, this would wrap the native AdMob plugin
 */

class AdService {
  constructor() {
    this.isInitialized = false;
    this.interstitialInterval = 180000; // 3 minutes in ms
    this.lastInterstitialTime = Date.now();
    this.isPaidVersion = false;
    
    // AdMob IDs from Google AdMob Console
    this.adConfig = {
      appId: 'ca-app-pub-6942733289376891~1776891763', // Your App ID
      bannerId: 'ca-app-pub-3940256099942544/6300978111', // TODO: Create Banner ad unit in AdMob and replace this test ID
      interstitialId: 'ca-app-pub-6942733289376891/5332993392', // Your Interstitial Ad Unit ID
    };
  }

  init() {
    if (this.isInitialized) return;
    console.log('📱 AdService: Initializing...');
    
    // Check if user has paid version (mock)
    const isPaid = localStorage.getItem('diaBlockIsPaid');
    this.isPaidVersion = isPaid === 'true';
    
    if (this.isPaidVersion) {
      console.log('💎 AdService: User has paid version. Ads disabled.');
      return;
    }

    // Initialize banner
    this.showBanner();
    this.isInitialized = true;
  }

  showBanner() {
    if (this.isPaidVersion) return;
    
    // In a real app, this would call AdMob.showBanner()
    // For web, we'll just log it or create a DOM element if needed
    console.log('📱 AdService: Showing bottom banner ad');
    
    // Create a mock banner for web visualization
    if (typeof document !== 'undefined' && !document.getElementById('mock-ad-banner')) {
      const banner = document.createElement('div');
      banner.id = 'mock-ad-banner';
      banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50px;
        background: #333;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        z-index: 1000;
        border-top: 1px solid #555;
      `;
      banner.innerHTML = '<span>📢 AdMob Banner (Test Mode)</span>';
      document.body.appendChild(banner);
    }
  }

  hideBanner() {
    console.log('📱 AdService: Hiding banner ad');
    const banner = document.getElementById('mock-ad-banner');
    if (banner) banner.remove();
  }

  async showInterstitial() {
    if (this.isPaidVersion) return;

    const now = Date.now();
    if (now - this.lastInterstitialTime < this.interstitialInterval) {
      console.log('⏳ AdService: Too soon for interstitial');
      return;
    }

    console.log('📱 AdService: Showing interstitial ad');
    
    // Mock interstitial delay
    return new Promise(resolve => {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
      `;
      overlay.innerHTML = `
        <div class="text-2xl mb-4">📺 AdMob Interstitial</div>
        <div class="text-sm text-gray-400 mb-8">This is a test ad</div>
        <button id="close-ad-btn" style="padding: 10px 20px; background: white; color: black; border-radius: 5px; cursor: pointer;">Close Ad</button>
      `;
      document.body.appendChild(overlay);

      document.getElementById('close-ad-btn').onclick = () => {
        overlay.remove();
        this.lastInterstitialTime = Date.now();
        resolve();
      };
    });
  }

  purchaseNoAds() {
    console.log('💰 AdService: Purchasing No Ads...');
    this.isPaidVersion = true;
    localStorage.setItem('diaBlockIsPaid', 'true');
    this.hideBanner();
    return true;
  }
}

export const adService = new AdService();
