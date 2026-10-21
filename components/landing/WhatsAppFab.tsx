'use client';
import { useLocale } from 'next-intl';
import { deepLinkWhatsAppLibre } from '@/lib/whatsapp';
import type { AppLocale } from '@/lib/i18n';

export function WhatsAppFab() {
  const locale = useLocale() as AppLocale;
  const href = deepLinkWhatsAppLibre(locale);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.94 11.94 0 0 0 12.07 0C5.46 0 .1 5.36.1 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.64a11.94 11.94 0 0 0 5.84 1.49h.01c6.6 0 11.97-5.36 11.97-11.96 0-3.2-1.25-6.2-3.53-8.42ZM12.07 21.8h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.7.97.99-3.6-.24-.37a9.85 9.85 0 0 1-1.52-5.24c0-5.45 4.43-9.88 9.88-9.88a9.83 9.83 0 0 1 6.99 2.89 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.84-9.9 9.83Zm5.42-7.36c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.07 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
