// One excerpt per case study, verbatim, pinned to the commit it was read at.
// `lines` marks an excerpt from a longer file; without it the file is whole.
export const excerpts = {
  'brunogalvan-dev': {
    lang: 'js',
    repository: 'bgalvandev/brunogalvan.dev',
    commit: '3fadbdb3c298e73263af1a072852ce54fbbd7841',
    path: 'scripts/build/cloudflare-headers.mjs',
    lines: [6, 15],
    code: "// Cloudflare Pages reads `_headers` from the build output. The Content Security\n// Policy is derived from the built HTML: every inline script and style block\n// becomes a sha256 source, so the pre-paint theme initializer and the font\n// pipeline's @font-face block keep working without 'unsafe-inline', and an\n// edited inline block can never ship with a stale hash.\nconst inlineScript = /<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>/g;\nconst inlineStyle = /<style[^>]*>([\\s\\S]*?)<\\/style>/g;\n\nconst sha256 = (text) =>\n  `'sha256-${createHash('sha256').update(text).digest('base64')}'`;",
  },
} as const;
