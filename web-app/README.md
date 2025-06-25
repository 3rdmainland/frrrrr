# nandos-web-app

> A vue.js app that allows users to order food online from Nandos



## Getting started

This package is part of a larger monorepo. To install the dependencies for this package, see the *Getting started* section in the `README` in the [root of this repo](../../).
This is a [Vue CLI](https://cli.vuejs.org/) project, more info can be found [here](https://cli.vuejs.org/guide/)


> Internationalization note

The web-app supports multiple regions, so when running any commands you **must** specify a region using the `region` flag.
Currently we support 3 regions:
 - South Africa (`za`)
 - Botswana (`bw`)
 - Mauritius (`mu`)

All examples below will use the South African (`za`) region

## Developing

``` bash
# serve with hot reload
yarn serve --region za

# build for production with minification
yarn build --region za

# build for staging (a production build, but uses staging environment variables)
yarn build --region za --mode staging
```

### Environment Variables

You can specify env variables by placing the following files in your project root, as well as region specific overrides in `./build/env/`:

```bash
.env                        # loaded in all cases
.env.local                  # loaded in all cases, ignored by git
.env.[mode]                 # only loaded in specified mode
.env.[mode].local           # only loaded in specified mode, ignored by git
[region]/.env               # loaded for region in all cases
[region]/.env.local         # loaded for region in all cases, ignored by git
[region]/.env.[mode]        # loaded for region only in specified mode
[region]/.env.[mode].local  # loaded for region only in specified mode, ignored by git
```

For detailed explanation about modes and environment variables see [this guide](https://cli.vuejs.org/guide/mode-and-env.html)

### Building for Capacitor apps

To ease the process of creating a build for the Capacitor apps you can use the interactive build script by running:
```bash
yarn build:prompt
```

This script will help you build for a particular **region** and **platform**, as well as moving the built files into your capacitor project.
