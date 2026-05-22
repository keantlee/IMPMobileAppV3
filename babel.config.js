module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from', // 👈 Add this line at the top of your plugins
    // ... Keep any other plugins you already have here (like react-native-reanimated/plugin)
  ],
};