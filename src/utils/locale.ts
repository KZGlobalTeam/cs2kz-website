const LOCALE_STORAGE_KEY = 'cs2kz-locale'

const availableLocales = ['zh', 'ru', 'en']

export function getSavedLocale() {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem(LOCALE_STORAGE_KEY)
}

export function saveLocale(locale: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export function getPreferredLocale() {
  const savedLocale = getSavedLocale()

  if (savedLocale && availableLocales.includes(savedLocale)) {
    return savedLocale
  }

  const browserLocale = navigator.language.split('-')[0]

  if (availableLocales.includes(browserLocale)) {
    return browserLocale
  }

  return 'en'
}
