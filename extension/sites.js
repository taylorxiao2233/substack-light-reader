// Generated from config/sites.json.
(() => {
  const hosts = new Set([
  "letters.thedankoe.com",
  "www.lennysnewsletter.com",
  "www.noahpinion.blog",
  "newsletter.semianalysis.com",
  "newsletter.pragmaticengineer.com",
  "blog.bytebytego.com",
  "www.exponentialview.co",
  "www.news.aakashg.com",
  "www.newcomer.co",
  "www.generalist.com",
  "www.citriniresearch.com",
  "newsletter.doomberg.com",
  "www.blockedandreported.org"
]);
  globalThis.SubstackLightReaderSites = Object.freeze({
    isSupportedURL(value) {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && (url.hostname.endsWith('.substack.com') || hosts.has(url.hostname));
      } catch { return false; }
    }
  });
})();
