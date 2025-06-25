const path = require('path')
const chalk = require('chalk')

/**
 * Read package version, and set for application as "VUE_APP_VERSION"
 */
process.env.VUE_APP_VERSION = require('./package.json').version

const publicPath = process.env.VUE_APP_CONTEXT == 'WEB'
  ? process.env.NODE_ENV == 'production' ? '/static/' : '/' 
  : ''

const template = path.resolve(__dirname, './public/index.html')

logSettings()

module.exports = {
  publicPath,

  runtimeCompiler: true,

  // Make sure that our linked packages go through the same transpilation/compilation chain as the rest of our code
  transpileDependencies: ['nandos-a-b-testing', 'nandos-core-ui', 'nandos-dev-logger', 'nandos-i18n', 'nandos-middleware-api', 'nandos-ordering', 'nandos-timing-utils', 'nandos-tracking', 'qr-scanner'],

  chainWebpack: config => {
    
    // Change the HTML template
    config
      .plugin('html')
      .tap(args => {
        args[0].template = template
        return args
      })
    
    config
      .plugin('prefetch')
      .tap(options => {
        options[0].fileBlacklist = options[0].fileBlacklist || []
        options[0].fileBlacklist.push(/i18n-lang-(.)+?\.js$/) // Prevent language translation files from being pre-loaded
        return options
      })

    config.performance
      .maxEntrypointSize(9900000)
      .maxAssetSize(9900000)
  }
}

function logSettings() {
  console.log(chalk.gray('  Using the following configuration:'))

  Object.entries(process.env)
    .filter(([prop, value]) => prop.startsWith('VUE_APP') || prop == 'NODE_ENV')
    .sort()
    .forEach(([prop, value]) => console.log(chalk.bold(`    ${prop}:`, chalk.blue(value))) )

  console.log('')
  console.log(chalk.bold(`    publicPath:`, chalk.blue(publicPath)))
  console.log(chalk.bold(`    template:`, chalk.blue(template)))
  console.log('')
}