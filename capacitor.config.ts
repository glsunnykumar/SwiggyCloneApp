import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brothers.sakohFoodApp',
  appName: 'Sakoh Food',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      // "launchAutoHide": true,
      "launchFadeOutDuration": 3000,
      "backgroundColor": "#de0f17",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": true,
      "androidSpinnerStyle": "large",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#999999",
      "splashFullScreen": true,
      "splashImmersive": true,
      "layoutName": "launch_screen",
      "useDialog": true
    }
  }
};

export default config;
