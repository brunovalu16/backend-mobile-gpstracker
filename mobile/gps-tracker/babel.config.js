module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",  // 👈 Certifique-se de que o nome está correto
          path: ".env",
          allowUndefined: false,
          safe: true
        }
      ]
    ],
  };
};
