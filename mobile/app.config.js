// app.config.js (not app.json) so env vars are available at config-eval time.
module.exports = {
  expo: {
    name: 'Ewe ati Egbo',
    slug: 'ewe-ati-egbo',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'eweatiegbo',
    userInterfaceStyle: 'light',
    ios: {
      bundleIdentifier: 'com.eweatiegbo.app',
    },
    android: {
      package: 'com.eweatiegbo.app',
      adaptiveIcon: {
        backgroundColor: '#1F6B3B',
      },
      predictiveBackGestureEnabled: false,
    },
    // 'single' (client-only SPA): the Supabase client touches browser-only
    // AsyncStorage at module load, which breaks static prerendering.
    web: {
      output: 'single',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#1F6B3B',
          imageWidth: 96,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
