import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonPt from '@/locales/pt/common.json'

void i18n.use(initReactI18next).init({
  resources: {
    pt: { common: commonPt },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
