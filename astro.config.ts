import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { site } from './src/config/site';
import { pagePath } from './src/i18n/routes';
import { locales, defaultLocale } from './src/i18n/locales';
import { cloudflareHeaders } from './scripts/build/cloudflare-headers.mjs';

// geist's exports map hides its font files, so they resolve by root path.
const face = (file: string, weight: string) => ({
  src: [`./node_modules/geist/dist/fonts/${file}.woff2`] as [string],
  weight,
  style: 'normal' as const,
});

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
  // The faces ship from Vercel's `geist` package, so the build needs no
  // network and Dependabot keeps them current. Geist and Geist Mono are its
  // static, hinted files, one per weight the site sets, the same files the
  // master serves: Windows renders unhinted outlines, the variable files'
  // among them, lighter and softer (ADR 0013). Astro emits metric-matched
  // fallbacks and preloads.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          face('geist-sans/Geist-Regular', '400'),
          face('geist-sans/Geist-Medium', '500'),
          face('geist-sans/Geist-SemiBold', '600'),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          face('geist-mono/GeistMono-Regular', '400'),
          face('geist-mono/GeistMono-Medium', '500'),
          face('geist-mono/GeistMono-SemiBold', '600'),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Pixel Square',
      cssVariable: '--font-geist-pixel',
      fallbacks: ['monospace'],
      options: {
        variants: [face('geist-pixel/GeistPixel-Square', '400')],
      },
    },
  ],
  vite: { plugins: [tailwindcss()] },
});
