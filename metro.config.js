// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Spreadsheets (e.g. the heuristic evaluation) are bundled as downloadable files, like the PDFs.
config.resolver.assetExts.push('xlsx');

module.exports = config;
