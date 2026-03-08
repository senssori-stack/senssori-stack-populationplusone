const { withProjectBuildGradle } = require("expo/config-plugins");

module.exports = function withJitpackStripeExclude(config) {
    return withProjectBuildGradle(config, (config) => {
        if (config.modResults.language === "groovy") {
            // Remove jitpack entirely - no dependencies need it, and it causes
            // timeouts when Gradle tries to resolve com.stripe:stripe-android
            config.modResults.contents = config.modResults.contents.replace(
                /\s*maven\s*\{\s*url\s*['"]https:\/\/www\.jitpack\.io['"]\s*\}/,
                ""
            );
        }
        return config;
    });
};
