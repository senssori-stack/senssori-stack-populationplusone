// Learn more https://docs.expo.dev/guides/customizing-metro/

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add PDF to asset extensions
config.resolver.assetExts.push('pdf');

module.exports = config;
