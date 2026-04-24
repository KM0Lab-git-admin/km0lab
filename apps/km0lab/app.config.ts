import type { ConfigContext, ExpoConfig } from 'expo/config'

const APP_ENV = process.env.APP_ENV ?? 'development'

function getBundleIdentifier() {
  return APP_ENV === 'production' ? 'com.km0lab.app' : 'com.km0lab.app.dev'
}

function getAppName() {
  return APP_ENV === 'production' ? 'km0lab' : 'km0lab Dev'
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'km0lab',
  scheme: 'km0lab',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  runtimeVersion: {
    policy: 'appVersion',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: getBundleIdentifier(),
  },
  android: {
    softwareKeyboardLayoutMode: 'pan',
    package: getBundleIdentifier(),
  },
  web: {
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#ffffff',
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {
      origin: false,
    },
  },
})
