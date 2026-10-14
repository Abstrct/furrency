/* Link previews and indexing: the site plugin makes every share tag absolute when SITE_URL is
 * known (including a GitHub project-page path), and leaves no placeholder behind when it isn't. */
import { readFileSync } from 'node:fs';
import { ok, done } from './check';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const load = async (site: string) => { process.env.SITE_URL = site; return (await import(`../site.plugin.mjs?${site}`)).sitePlugin(); };

for (const site of ['https://furrency.example', 'https://example.github.io/furrency']) {
  const p = await load(site);
  const out: string = p.transformIndexHtml(html);
  ok(!out.includes('%SITE_URL%'), `${site}: no placeholder left`);
  ok(out.includes(`<meta property="og:image" content="${site}/og.png">`), `${site}: og:image is absolute`);
  ok(out.includes(`<link rel="canonical" href="${site}/">`), `${site}: canonical`);
  const files: Record<string, string> = {};
  p.generateBundle.call({ emitFile: (f: { fileName: string; source: string }) => { files[f.fileName] = f.source; } });
  ok(files['robots.txt']?.includes('Allow: /') && files['robots.txt'].includes(`Sitemap: ${site}/sitemap.xml`), `${site}: robots.txt allows all and lists the sitemap`);
  ok(files['sitemap.xml']?.includes(`<loc>${site}/</loc>`), `${site}: sitemap`);
  ok(files['404.html']?.includes(`${site}/`), `${site}: 404 sends strays home`);
}
{
  const p = await load('');
  const out: string = p.transformIndexHtml(html);
  ok(!out.includes('%SITE_URL%') && !out.includes('rel="canonical"'), 'no SITE_URL: no placeholder, no canonical');
  ok(out.includes('<meta property="og:image" content="og.png">'), 'no SITE_URL: images stay relative');
}
for (const tag of ['og:title', 'og:description', 'og:image:width', 'twitter:card', 'twitter:image']) ok(html.includes(tag), `index.html has ${tag}`);
ok(/href="https:\/\/playstructs\.com"/.test(html) && /href="https:\/\/structs\.ai"/.test(html), 'links to Structs and its docs');
done('site');
