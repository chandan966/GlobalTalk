export const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://globaltalk-tau-plum-26.vercel.app')
  .trim()
  .replace(/\/+$/, '');

export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || '';
