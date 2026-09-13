import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site';
import { pagePath } from './src/i18n/routes';
import { locales, defaultLocale } from './src/i18n/locales';
import { cloudflareHeaders } from './scripts/build/cloudflare-headers.mjs';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  redirects: { '/': pagePath('home', defaultLocale) },
  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => page !== `${site.url}/` && !page.endsWith('/404/'),
      i18n: { defaultLocale, locales: { es: 'es', en: 'en' } },
    }),
    cloudflareHeaders(),
  ],
  vite: { plugins: [tailwindcss()] },
});
