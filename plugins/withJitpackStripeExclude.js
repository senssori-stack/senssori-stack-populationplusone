const { withProjectBuildGradle } = require("expo/config-plugins");

module.exports = function withJitpackStripeExclude(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = config.modResults.contents.replace(
        `maven { url 'https://www.jitpack.io' }`,
        `maven {\n            url 'https://www.jitpack.io'\n            content {\n                excludeGroup 'com.stripe'\n            }\n        }`
      );
    }
    return config;
  });
};
