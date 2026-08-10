/**
 * @fileoverview Implementation of app.
 *
 * @module app.config
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */
import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Anicca',
  slug: 'anicca',
  version: '1.0.0',
  extra: {
    apiUrl: process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:8000',
    appEnv: process.env['EXPO_PUBLIC_APP_ENV'] ?? 'development',
    eas: {
      projectId: 'a553e49e-f438-4333-850d-75d306d4589e',
    },
  },
  plugins: [
    ...config.plugins || [],
    '@react-native-google-signin/google-signin'
  ],
});