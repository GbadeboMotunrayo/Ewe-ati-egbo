// app.config.js (not app.json) so env vars are available at config-eval time.
//
// baseUrl is where the web build is served from:
//   unset            -> '/Ewe-ati-egbo'  (GitHub Pages project site)
//   EXPO_PUBLIC_BASE_URL=''  -> root      (Vercel / custom domain — set in vercel.json)
//   EXPO_PUBLIC_BASE_URL='/x'-> '/x'
const rawBase = process.env.EXPO_PUBLIC_BASE_URL;
const baseUrl = rawBase === undefined ? '/Ewe-ati-egbo' : rawBase;

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
      // Keep the (encrypted) session out of device/cloud backups.
      allowBackup: false,
    },
    // 'single' (client-only SPA): the Supabase client touches browser-only
    // AsyncStorage at module load, which breaks static prerendering.
    web: {
      output: 'single',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
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
      // Omit entirely when base is '' so the app serves from the domain root.
      ...(baseUrl ? { baseUrl } : {}),
    },
  },
};
