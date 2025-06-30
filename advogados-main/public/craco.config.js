// craco.config.js
const path = require("path");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        process: require.resolve("process/browser"),
        vm: require.resolve("vm-browserify"),  // Fallback para o módulo 'vm'
      };
      return webpackConfig;
    },
  },
};
