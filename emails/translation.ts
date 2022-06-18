import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonEn from "../public/locales/en/common.json";
import commonSk from "../public/locales/sk/common.json";
import mailEn from "../public/locales/en/mail.json";
import mailSk from "../public/locales/sk/mail.json";

export const i18nInstance = i18n.createInstance({
  fallbackLng: "en",
});

export const resources = {
  en: {
    common: commonEn,
    mail: mailEn,
  },
  sk: {
    common: commonSk,
    mail: mailSk,
  },
};

i18nInstance.use(initReactI18next).init({
  interpolation: {
    escapeValue: false,
  },
});
