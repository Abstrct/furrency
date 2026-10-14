/* The site plugin: absolute URLs for link previews and search, plus robots.txt and sitemap.xml.
 * Set SITE_URL (or VITE_SITE_URL) at build time to the address the game is served from, e.g.
 *   SITE_URL=https://furrency.example pnpm build
 * Social scrapers (Twitter/X, Discord, Slack, Facebook) need an absolute og:image URL; without
 * SITE_URL the page still works and the tags fall back to relative paths. */
const ROUTES = ['/'];

export function sitePlugin() {
  const site = String(process.env.SITE_URL || process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');
  return {
    name: 'furrency-site',
    transformIndexHtml(html) {
      if (site) return html.replaceAll('%SITE_URL%', site);
      // no known address: drop the tags that must be absolute, keep images relative
      return html
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/\s*<meta property="og:url"[^>]*>/, '')
        .replaceAll('%SITE_URL%/', '')
        .replaceAll('%SITE_URL%', '.');
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', '', site ? `Sitemap: ${site}/sitemap.xml` : '# set SITE_URL at build time to list the sitemap here', ''].join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      // GitHub Pages serves 404.html for any path it doesn't have; the game routes by #hash, so a
      // stray path just goes home (to the site root, which may be a project path like /furrency/).
      const home = site ? `${site}/` : '/';
      this.emitFile({ type: 'asset', fileName: '404.html', source: notFound(home) });
      if (site) {
        const today = new Date().toISOString().slice(0, 10);
        const urls = ROUTES.map((r) => `  <url><loc>${site}${r}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`).join('\n');
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      }
    },
  };
}

const notFound = (home) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>LOST · Furrency</title>
<meta http-equiv="refresh" content="2; url=${home}">
<style>
  html, body { margin: 0; height: 100%; background: #140C2B; color: #FFF8E7; }
  body { display: grid; place-items: center; font: 700 22px system-ui, sans-serif; letter-spacing: .12em; text-align: center; }
  b { display: block; font-size: 96px; color: #FFE53B; text-shadow: 6px 6px 0 #FF2E88; -webkit-text-stroke: 3px #0A0612; }
  a { color: #22E4FF; }
</style>
</head>
<body><p><b>LOST</b><a href="${home}">HOME →</a></p>
<script>setTimeout(function () { location.replace(${JSON.stringify(home)} + location.hash); }, 600);</script>
</body>
</html>
`;
