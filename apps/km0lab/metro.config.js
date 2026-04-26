const path = require('path')

const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [monorepoRoot]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const blockedPaths = [
  path.resolve(monorepoRoot, 'packages/e2e/artifacts'),
  path.resolve(monorepoRoot, 'packages/e2e/node_modules'),
  path.resolve(monorepoRoot, 'apps/km0lab/dist'),
  path.resolve(monorepoRoot, 'apps/km0lab-back-office'),
  path.resolve(monorepoRoot, '.turbo'),
  path.resolve(monorepoRoot, 'apps/km0lab/.expo'),
]

config.resolver.blockList = new RegExp(
  `(${blockedPaths.map((p) => escapeForRegex(p)).join('|')})(\\\\|/).*`
)

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
}
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg')
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg']

module.exports = withNativeWind(config, {
  input: path.join(projectRoot, './styles/global.css'),
  configPath: path.join(projectRoot, './tailwind.config.js'),
  inlineRem: 16,
})
