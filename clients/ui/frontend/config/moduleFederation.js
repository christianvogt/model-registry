const path = require('path');
// const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

const {
  NativeFederationTypeScriptRemote,
} = require('@module-federation/native-federation-typescript/webpack');

const deps = require('../package.json').dependencies;

const moduleFederationConfig = {
  name: 'modelRegistry',
  filename: 'remoteEntry.js',
  // Required for module federation to work because of the runtimeChunk:
  // See https://github.com/webpack/webpack/issues/18810
  //
  // optimization: {
  //   runtimeChunk: 'single',
  // },
  runtime: false,
  shared: {
    react: { singleton: true, eager: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, eager: true, requiredVersion: deps['react-dom'] },
    'react-router': { singleton: true, eager: true, requiredVersion: deps['react-router'] },
    'react-router-dom': { singleton: true, eager: true, requiredVersion: deps['react-router-dom'] },
    // TODO list all shared dependencies here
  },
  exposes: {
    // Set the modules to be exported, default export as '.'
    // TODO seems default is './index'
    './index': './src/plugin/index.tsx',
    './plugin': './src/plugin/index.tsx',
    './Test': './src/Test.tsx',
    // '.': './src/test.ts'
  },
};

module.exports = {
  moduleFederationPlugins: [
    new ModuleFederationPlugin(moduleFederationConfig),
    NativeFederationTypeScriptRemote({ moduleFederationConfig, tsConfigPath: path.resolve(__dirname, '../tsconfig.json') }),
  ],
};
