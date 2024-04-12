//import "intl-pluralrules"
import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import english from "./english.json";
import hindi from "./hindi.json";
import { languageDetectorPlugin } from "./languagedetector";

i18n.use(initReactI18next).use(languageDetectorPlugin).init({
    resources: {
        en: english,
        hi: hindi
    },
    lng: "en",
    fallbackLng: "en",
    debug: true,
    interpolation:{
        escapeValue: false
    },
    react: {
      useSuspense: false,
    },
});

export default i18n;