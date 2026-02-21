const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [
  /node_modules[\/\\]\.react-native-[^\/\\]+[\/\\].*/,
  /node_modules[\/\\]react-native[\/\\]types_generated[\/\\]Libraries[\/\\]Animated[\/\\]components[\/\\].*/,
];

module.exports = withNativeWind(config, { input: "./styles/global.css" });
