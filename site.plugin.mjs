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
      if (site) {
        const today = new Date().toISOString().slice(0, 10);
        const urls = ROUTES.map((r) => `  <url><loc>${site}${r}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`).join('\n');
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      }
    },
  };
}
