const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require('fs')
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;
const Dotenv = require('dotenv-webpack');

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

function CopyWebpackPluginHelper(sourceFolder, allowedExtensions, destFolder) {
  const source = path.resolve(__dirname, sourceFolder);
  const files = fs.readdirSync(source);
  return files
    .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
    .map(file => ({
      from: path.resolve(source, file),
      to: path.resolve(__dirname, destFolder, file)
    }));
}

module.exports = {
  output: {
    uniqueName: "faq",
    publicPath: "auto",
    scriptType: 'text/javascript'
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
      '@assets': path.resolve(__dirname, 'src/assets'),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "faq",
      filename: "remoteEntry.js",
      exposes: {
        './Component': './src/app/faq/faq.component.ts',
        './Module': './src/app/faq/faq.module.ts',
      },
      shared: share({
        "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        "typlib": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
        ...sharedMappings.getDescriptors()
      })
    }),
    sharedMappings.getPlugin(),
    new Dotenv({
      path: './.env',
    })
  ],
};
