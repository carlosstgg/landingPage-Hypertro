import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

const messages = {
  es: esMessages,
  en: enMessages
};

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: messages[locale as keyof typeof messages]
  };
});

