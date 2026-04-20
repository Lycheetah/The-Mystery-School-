// i18n engine — simple key-value localisation
// Supports: en (default), es
// Usage: import { t, setLocale, getLocale } from './i18n'

import EN from '../data/locales/en'
import ES from '../data/locales/es'

const LOCALES = { en: EN, es: ES }
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
]

let _locale = 'en'

export function setLocale(code) {
  _locale = LOCALES[code] ? code : 'en'
}

export function getLocale() {
  return _locale
}

export function t(key) {
  const dict = LOCALES[_locale] || LOCALES.en
  if (dict[key] !== undefined) return dict[key]
  if (LOCALES.en[key] !== undefined) return LOCALES.en[key]
  return key
}
