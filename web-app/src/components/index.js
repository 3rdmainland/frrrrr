import * as ContactComponents from './contact'
import * as GeneralComponents from './general'
import * as HelpComponents from './help'
import * as AuthenticationComponents from './authentication'
import * as MeComponents from './me'
import * as StoreComponents from './stores'
//Gift card components imported in router if region requires them


export default Object.assign({},
  ContactComponents,
  GeneralComponents,
  HelpComponents,
  AuthenticationComponents,
  MeComponents,
  StoreComponents,
)