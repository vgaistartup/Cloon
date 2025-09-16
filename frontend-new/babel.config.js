module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // Reanimated v4 uses the Worklets plugin; keep it last
      'react-native-worklets/plugin',
    ],
  };
};
