export const siteUrl = (
  import.meta.env.VITE_SITE_URL || 'https://globaltalk-tau-plum-26.vercel.app'
)
  .trim()
  .replace(/\/+$/, '');

export const contactEmail =
  import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'contactchandan0101@gmail.com';

// Google AdSense Configuration (loaded strictly on approved static editorial pages)
export const adsenseClientId =
  import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim() || 'ca-pub-6527373182140065';

// Statutory Grievance Redressal details (Rule 3(2) of Indian IT Rules, 2021 as amended 2026)
export const grievanceOfficer = {
  name: import.meta.env.VITE_GRIEVANCE_OFFICER_NAME?.trim() || 'Chandan',
  designation: 'Resident Grievance Officer',
  email: import.meta.env.VITE_GRIEVANCE_OFFICER_EMAIL?.trim() || 'contactchandan0101@gmail.com',
  address:
    import.meta.env.VITE_GRIEVANCE_OFFICER_ADDRESS?.trim() ||
    'Chandan (Resident Grievance Officer), India',
  country: 'India',
};
