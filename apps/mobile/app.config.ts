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
      projectId: process.env['EAS_PROJECT_ID'] ?? 'your-eas-project-id',
    },
  },
});
