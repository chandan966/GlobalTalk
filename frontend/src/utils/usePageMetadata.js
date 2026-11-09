import { useEffect } from 'react';
import { siteUrl } from '../config/site';

export default function usePageMetadata(title, description, path, robots = 'index, follow') {
  useEffect(() => {
    const pageTitle = `${title} | GlobalTalk`;
    const pageUrl = new URL(path, `${siteUrl}/`).href;

    document.title = pageTitle;
    setMetaContent('description', description);
    setMetaContent('robots', robots);
    setMetaContent('og:title', pageTitle, 'property');
    setMetaContent('og:description', description, 'property');
    setMetaContent('og:url', pageUrl, 'property');
    setMetaContent('og:type', 'website', 'property');
    setMetaContent('twitter:card', 'summary');
    setMetaContent('twitter:title', pageTitle);
    setMetaContent('twitter:description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = pageUrl;
  }, [title, description, path, robots]);
}

function setMetaContent(name, content, attribute = 'name') {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  element.content = content;
}
