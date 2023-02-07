import { defineConfig } from '@umijs/max'
// import fs from 'fs'
import GenerateJsonPlugin from 'generate-json-webpack-plugin'

// import path from 'path'
// import type { Compiler } from 'webpack'
import manifest from './manifest'
import routes from './routes'

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: false,
  npmClient: 'npm',
  routes,
  history: {
    type: 'hash',
  },
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  writeToDisk: true,
  copy: [
    {
      from: './node_modules/webextension-polyfill/dist/browser-polyfill.js',
      to: './dist/browser-polyfill.js',
    },
    {
      from: './node_modules/webextension-polyfill/dist/browser-polyfill.js.map',
      to: './dist/browser-polyfill.js.map',
    },
  ],
  jsMinifier: 'esbuild',
  jsMinifierOptions: {
    keepNames: true,
  },
  codeSplitting: {
    jsStrategy: 'depPerChunk',
    jsStrategyOptions: {},
  },
  polyfill: {
    imports: ['core-js/stable'],
  },
  fastRefresh: false,
  targets: {
    chrome: 80,
  },
  mfsu: false,
  chainWebpack(memo, { env }) {
    if (env !== 'development') {
      memo.devServer.hot(false)
      memo.plugins.delete('hmr')
    }

    // generate manifest.json, it will auto load version/env
    memo
      .plugin('generate-json-webpack-plugin')
      .use(new GenerateJsonPlugin('manifest.json', manifest))

    // to chrome extension content script
    memo
      .entry('content-script')
      .add('@/extension/content/content-script.ts')
      .end()

    // to chrome extension background script
    memo
      .entry('service-script')
      .add('@/extension/background/bootstrap.ts')
      .end()

    // to chrome extension inpage content script
    memo
      .entry('inpage-content')
      .add('@/extension/content/inpage-content.ts')
      .end()

    return memo
  },
})
