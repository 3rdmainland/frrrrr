import { formatCurrency} from 'nandos-i18n-v2'

const formatToCurrency = (value: number) => {
  return formatCurrency(value ?? 0, import.meta.env.VITE_DEFAULT_LOCALE )
}

export default formatToCurrency
