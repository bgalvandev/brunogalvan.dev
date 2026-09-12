import { preview } from 'astro';

// The CLI may auto-background in agent environments. The documented programmatic
// API keeps this process under Playwright ownership. Recheck on Astro upgrades:
// https://docs.astro.build/en/reference/programmatic-reference/#preview
const server = await preview({ server: { host: '127.0.0.1', port: 3100 } });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
