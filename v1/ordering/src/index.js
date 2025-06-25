import NandosCoreUi from 'nandos-core-ui'
import NandosI18n from 'nandos-i18n'

import * as components from './components'

const LibraryModule = {
  install(Vue) {
    Vue.use(NandosI18n)
    Vue.use(NandosCoreUi)

    // Register components
    Object.keys(components)
      .forEach(key => Vue.component(`NOrdering${key}`, components[key]))

  }
}

// Export library
export default LibraryModule