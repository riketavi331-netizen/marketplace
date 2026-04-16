import { useLangStore } from '@/store/lang.store';
import { translations, TranslationKey } from '@/lib/i18n';

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: TranslationKey): string => translations[lang][key] ?? translations.ru[key];
}
