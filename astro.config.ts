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
  // The three latin font files ship from installed packages, so the build needs
  // no network and Dependabot keeps the faces current. The local provider is
  // used on purpose: fontsource's CSS labels each face by file name, not by
  // subset, so the npm provider cannot apply `subsets` and would ship every
  // script the packages carry. Geist Pixel Square comes from Vercel's `geist`
  // package because it is the only one that names the shape it carries. Astro
  // emits metric-matched fallbacks and preloads.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist Variable',
      cssVariable: '--font-geist',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
            ],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono Variable',
      cssVariable: '--font-geist-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [
              '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
            ],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Pixel Square',
      cssVariable: '--font-geist-pixel',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            // geist's exports map hides its font files, so this is a root path.
            src: [
              './node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2',
            ],
            weight: '400',
            style: 'normal',
          },
        ],
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
