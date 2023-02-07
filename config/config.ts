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
  ],
  jsMinifier: 'esbuild',
  jsMinifierOptions: {
    keepNames: true,
  },
  codeSplitting: {
    jsStrategy: 'depPerChunk',
    jsStrategyOptions: {},
  },
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

    memo.merge({
      optimization: {
        splitChunks: {
          cacheGroups: {
            antd: {
              name: 'antd',
              test: (module: any) => {
                return /antd/.test(module.context)
              },
              chunks: 'all',
              enforce: true,
              priority: 10,
            },
            vendor: {
              chunks(chunk: any) {
                return !['inpage-content', 'content-script'].includes(
                  chunk.name,
                )
              },
              name: 'vendors',
              test({ resource }: { resource: any }) {
                return /[\\/]node_modules[\\/]/.test(resource)
              },
              priority: 1,
              enforce: true,
              reuseExistingChunk: true,
            },
          },
        },
      },
    })

    return memo
  },
})
