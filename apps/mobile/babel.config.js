module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Mantemos o padrão recomendado pelo NativeWind v4 e pela própria Expo
      ['babel-preset-expo', {
        jsxImportSource: 'nativewind'
      }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src'
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};