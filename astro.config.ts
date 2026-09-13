import { defineConfig, fontProviders } from 'astro/config';
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
  // The two latin font files ship from the installed fontsource packages, so the
  // build needs no network and Dependabot keeps the faces current. The local
  // provider is used on purpose: fontsource's CSS labels each face by file name,
  // not by subset, so the npm provider cannot apply `subsets` and would ship every
  // script the packages carry. Astro emits metric-matched fallbacks and preloads.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Archivo Variable',
      cssVariable: '--font-archivo',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
            ],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono Variable',
      cssVariable: '--font-jetbrains',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
            ],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
