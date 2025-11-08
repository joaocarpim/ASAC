// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Esta linha desabilita a nova funcionalidade que causa o erro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
