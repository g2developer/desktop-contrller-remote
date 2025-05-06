const config = {
  appId: 'com.desktop.controller.remote',
  appName: 'Desktop Controller Remote',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#007AFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    }
  }
};

module.exports = config;