export const sitePages = {
  about: {
    title: 'About GlobalTalk',
    description: 'Learn how GlobalTalk public chat rooms and random video calls work.',
    path: '/about',
    sections: [
      {
        heading: 'A place for live conversations',
        paragraphs: [
          'GlobalTalk is an international browser-based communication platform featuring public topic rooms and an optional one-to-one random video feature. It is designed to connect people across the world for spontaneous, open discussions without requiring account registration or personal profiling.',
          'The application assigns temporary nicknames. Country selection is optional. Messages are transmitted to connected participants in real time and are not retained as chat history by the application.',
        ],
      },
      {
        heading: 'Thoughtful and safe communication',
        paragraphs: [
          'GlobalTalk connects you with strangers across the globe. Never share passwords, bank or payment information, home addresses, private photos, or personal phone numbers. Always remember that any participant can use separate software on their device to take screenshots or record screens.',
          'The in-room report control allows you to hide an offending message in your browser session and submits an abuse snapshot to service logs. GlobalTalk maintains zero tolerance for harassment, hate speech, and illegal conduct.',
        ],
      },
      {
        heading: 'Platform architecture and availability',
        paragraphs: [
          'GlobalTalk relies on modern edge computing, utilizing Cloudflare Workers and Durable Objects for WebSocket messaging and WebRTC TURN relays for media. As a growing platform, connections may be subject to capacity limits and maintenance without prior notice.',
        ],
      },
      {
        heading: 'Student & College Engineering Project',
        paragraphs: [
          'GlobalTalk was developed as a student engineering college project to explore and demonstrate modern real-time web technologies, WebSockets, serverless edge computing, and WebRTC streaming.',
          'This platform is created for educational exploration, learning, and lighthearted fun. Visitors and participants are encouraged to interact respectfully, enjoy casual conversations, and treat the service in the spirit of fun and community discovery.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'How GlobalTalk handles data across anonymous text chat, age assurance, and random video calls.',
    path: '/privacy',
    sections: [
      {
        heading: '1. Information handled by the GlobalTalk application',
        paragraphs: [
          'Temporary Nicknames and Country: The application generates a temporary nickname stored locally in your browser’s sessionStorage. If you select a country, that value is also kept in sessionStorage. This temporary profile is transmitted to the Cloudflare Worker when you connect to a room and is displayed only to participants in that room.',
          'Age-Assurance Status: To protect minors under Indian law, the platform asks for your year of birth before entering chat or video rooms. This calculation occurs entirely in client-side memory; your age confirmation is held only in sessionStorage during your visit and is never stored in a central database.',
          'Ephemeral Chat Messages: Text messages you send are transmitted in real time through Cloudflare Workers and Durable Objects to active participants in the selected room. The application does not store chat history or persist conversations in a database; messages exist ephemerally in server memory during transmission and are auto-cleared in browser memory every 45 seconds.',
          'Random Video Signaling and Media: If you choose Random Video and grant camera/microphone permissions, the Cloudflare Worker coordinates WebRTC signaling (exchanging session descriptions and connection candidates). In production, media packets travel through a TURN relay directly between participant browsers and the relay server. GlobalTalk does not intercept, record, or store video or audio streams.',
          'Abuse Reports and Diagnostic Evidence: When a participant reports a message or a video call peer, the application captures a diagnostic snapshot (including report ID, message text if applicable, temporary nickname, room, and network timestamp) in persistent Durable Object storage for legal compliance and administrative safety review.',
        ],
      },
      {
        heading: '2. Browser storage and local data',
        paragraphs: [
          'The application uses browser sessionStorage to hold your temporary nickname, age verification confirmation, and optional country selection. sessionStorage is cleared automatically by your browser when the tab or window session ends. GlobalTalk does not use persistent local tracking cookies for core chat operations.',
        ],
      },
      {
        heading: '3. Infrastructure providers and technical network data',
        paragraphs: [
          'GlobalTalk is hosted on Vercel (frontend static delivery) and Cloudflare Workers (real-time WebSocket signaling and edge routing). When you access the service, these hosting providers process standard network transmission and diagnostic data—such as IP addresses, connection timestamps, User-Agent strings, and HTTP request headers—to deliver the service, defend against Denial-of-Service (DDoS) attacks, and maintain network integrity.',
          'Production video calls are configured to use relay-only WebRTC via TURN servers to prevent exposing your direct residential IP address to other call participants. Web fonts are retrieved from Google Fonts upon initial page load.',
        ],
      },
      {
        heading: '4. Third-party advertising and cookies',
        paragraphs: [
          'Google AdSense is utilized exclusively on static informational and editorial pages of the website (such as About, Safety, Guidelines, Terms, Privacy, Cookies, Copyright, Grievance, and Contact). Ad scripts and advertising units are strictly prohibited and isolated from live chat rooms and random video calls.',
          'On static pages where ads are displayed, Google and its third-party advertising partners use cookies and web beacons to serve advertisements based on your prior visits to this website and other websites on the internet. You can manage or opt out of personalized advertising by visiting Google Ad Settings (adssettings.google.com) or the Network Advertising Initiative (optout.networkadvertising.org). For complete details, see our dedicated Cookie Policy.',
        ],
      },
      {
        heading: '5. Data retention and CERT-In compliance',
        paragraphs: [
          'In alignment with data minimization principles under the Digital Personal Data Protection Act, 2023 (DPDP Act), GlobalTalk does not record or archive public chat chatter. Nickname and country data vanish from memory when your session disconnects.',
          'In accordance with applicable cybersecurity directions issued by the Indian Computer Emergency Response Team (CERT-In) under Section 70B of the Information Technology Act, 2000, cybersecurity diagnostic logs, administrative action records, and recorded abuse snapshots are maintained in secure persistent edge storage for a period of 180 days to facilitate investigation of cyber incidents.',
        ],
      },
      {
        heading: '6. User rights and regulatory inquiries',
        paragraphs: [
          'Under the Digital Personal Data Protection Act, 2023, Data Principals in India have rights regarding personal data. Because chat conversations are ephemeral and not linked to persistent user accounts or identities, GlobalTalk cannot retrieve or reconstruct past anonymous conversations.',
          'For formal privacy inquiries, statutory grievance redressal, or questions for our Resident Grievance Officer, please consult the Grievance Redressal and Contact pages. Users also have the statutory right to approach the Data Protection Board of India regarding unresolved grievances.',
          'Last updated: November 2026.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Legal terms, prohibited conduct, and intermediary disclosures for using GlobalTalk.',
    path: '/terms',
    sections: [
      {
        heading: '1. Acceptance and platform eligibility',
        paragraphs: [
          'By accessing or using GlobalTalk, you agree to be bound by these Terms of Service, our Community Guidelines, Privacy Policy, and Safety Rules. If you do not agree, do not use the service.',
          'Age Requirement (Strict Adult Service): GlobalTalk is exclusively intended for natural persons who have reached the age of majority in their jurisdiction (18 years or older in India). Minors are strictly prohibited from entering chat rooms or random video calling. By using the platform, you confirm through the browser Age Gate that you meet this statutory eligibility requirement.',
        ],
      },
      {
        heading: '2. Intermediary status under the Information Technology Act',
        paragraphs: [
          'GlobalTalk operates as an Intermediary under Section 2(1)(w) of the Information Technology Act, 2000. The platform provides automated, ephemeral electronic communication conduits without initiating transmissions, selecting message recipients, or altering message content.',
          'Conditional Safe Harbor Notice: While GlobalTalk observes statutory due diligence under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (including 2026 amendments) to maintain qualified intermediary safe harbor under Section 79 of the IT Act, such due diligence does not constitute an unconditional guarantee of judicial immunity. The platform cooperates with lawful government and judicial directives.',
        ],
      },
      {
        heading: '3. Prohibited conduct and content restrictions',
        paragraphs: [
          'You agree not to host, display, upload, modify, publish, transmit, store, update, or share any information that: belongs to another person without authorization; is defamatory, obscene, pornographic, pedophilic, invasive of another’s privacy, or libelous; promotes harassment, hate speech, communal disharmony, violence, or unlawful gambling; harms minors in any way; or violates any law in force.',
          'Zero Tolerance for Exploitative Content: Any transmission of Child Sexual Abuse Material (CSAM), non-consensual sexual content, or extortion threats will result in immediate connection termination, IP restriction, and referral to law enforcement authorities under the Protection of Children from Sexual Offences (POCSO) Act, 2012, and the Bharatiya Nyaya Sanhita (BNS), 2023.',
        ],
      },
      {
        heading: '4. Synthetically Generated Information (SGI) and deepfakes',
        paragraphs: [
          'In compliance with Rule 3(1)(b) and Rule 3(3) of the IT Rules (as amended in February 2026), users are strictly prohibited from transmitting or broadcasting deceptive Synthetically Generated Information (SGI), including AI-generated deepfakes, morphed imagery, or synthetic audio/video designed to impersonate natural persons, fabricate events, or deceive other users without clear, conspicuous disclosure.',
          'Users are notified that deploying or transmitting non-consensual synthetic intimate imagery or malicious impersonation media may lead to immediate session termination, network-level restrictions, and mandatory reporting to law enforcement authorities under applicable provisions of Indian cyber and criminal law.',
        ],
      },
      {
        heading: '5. Statutory grievance redressal and takedown timelines',
        paragraphs: [
          'In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and applicable amendments, GlobalTalk observes the following statutory response timelines upon receipt of formal notice:',
          '• General Grievance Acknowledgement (Rule 3(2)(a)): User grievances submitted to the Resident Grievance Officer will be formally acknowledged within 24 hours with a unique tracking ticket.',
          '• General Grievance Resolution (Rule 3(2)(a)): User grievances will be investigated and disposed of within 7 days of receipt.',
          '• Unlawful Content Removal Requests (Rule 3(1)(b)): Prohibited content notified under Rule 3(1)(b) will be reviewed and access disabled within 36 hours.',
          '• Intimate Imagery, Nudity, and Electronic Impersonation (Rule 3(2)(b)): Complaints regarding non-consensual sexual content, nudity, or morphed synthetic impersonation will be acted upon within 2 hours.',
          '• Court Orders and Government Directives (Rule 3(1)(d)): Takedown executed within 3 hours upon receipt of lawful direction.',
        ],
      },
      {
        heading: '6. Governing law, dispute resolution and jurisdiction',
        paragraphs: [
          'These Terms of Service and any dispute, controversy, or claim arising out of or related to the service shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.',
          'Subject to applicable statutory grievance escalation under the IT Rules (including appeals to the Grievance Appellate Committee), courts situated in India shall have jurisdiction over any legal proceedings arising hereunder. (Specific municipal jurisdiction to be designated upon formal legal counsel review).',
        ],
      },
      {
        heading: '7. Disclaimers and limitation of liability',
        paragraphs: [
          'GlobalTalk is provided on an "as is" and "as available" basis without warranties of any kind. The platform does not verify user identities or pre-screen anonymous speech. Users interact at their own risk.',
          'To the fullest extent permitted by applicable law, GlobalTalk and its operators shall not be liable for any indirect, incidental, special, or consequential damages resulting from user conduct, connection interruptions, or third-party recordings.',
        ],
      },
    ],
  },
  guidelines: {
    title: 'Community Guidelines',
    description: 'Core rules for civil, safe, and respectful interactions on GlobalTalk.',
    path: '/guidelines',
    sections: [
      {
        heading: '1. Be respectful to others',
        paragraphs: [
          'GlobalTalk is an international platform bringing together individuals from diverse cultures, languages, and backgrounds. Treat every participant with respect. Disagreements are natural, but personal attacks, hate speech, ethnic slurs, and harassment will not be tolerated.',
        ],
      },
      {
        heading: '2. Safeguard your personal privacy',
        paragraphs: [
          'Never share passwords, credit card numbers, banking details, personal phone numbers, or residential addresses with strangers. Be mindful that anything you say in public rooms or display on camera can be recorded by third parties using external screen-recording software.',
        ],
      },
      {
        heading: '3. Prohibited activities',
        paragraphs: [
          'The following behaviors are strictly prohibited and will result in immediate connection termination:',
          '• Transmitting threats, stalking, or abusive messages.',
          '• Displaying nudity, sexual acts, or solicitation on video calls or in chat.',
          '• Disseminating deceptive deepfakes, morphed imagery, or non-consensual synthetic media.',
          '• Automated message flooding, spamming, bot attacks, or commercial solicitation.',
          '• Distributing malicious URLs, phishing links, or executable files.',
        ],
      },
      {
        heading: '4. Reporting and emergency situations',
        paragraphs: [
          'If you encounter an abusive participant, click the report flag (⚑) on their message or the block button (🚫) to immediately hide all messages from that user. You can also leave the room or end a video call at any time.',
          'Important Advisory: GlobalTalk is an anonymous communication platform and does not provide emergency assistance. If you or someone else is in immediate danger or facing physical harm, immediately contact your local emergency services (such as dialing 112 in India or 911 in the United States).',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie & Storage Policy',
    description: 'Details regarding browser session storage and third-party advertising cookies.',
    path: '/cookies',
    sections: [
      {
        heading: '1. Overview of local browser storage',
        paragraphs: [
          'GlobalTalk operates without requiring account creation, email sign-up, or user profiles. We do not use persistent first-party cookies for tracking user identities across the web.',
          'To enable real-time features and statutory safety compliance, the platform utilizes your browser’s sessionStorage for: (a) temporary nickname (gt-name), (b) optional country filter (gt-country), and (c) local age assurance confirmation (gt-age-gate-status). All sessionStorage data is ephemeral and is automatically erased by your web browser when your tab or browser session is closed.',
        ],
      },
      {
        heading: '2. Third-party advertising cookies (Google AdSense)',
        paragraphs: [
          'Google AdSense is enabled exclusively on static informational and editorial pages (About, Safety, Guidelines, Terms, Privacy, Cookies, Copyright, Grievance, Contact). Advertising scripts are strictly prevented from loading or executing inside live chat rooms or video calls.',
          'On pages where advertisements are displayed, Google and its certified third-party ad vendors use cookies, web beacons, and mobile identifiers to serve personalized and non-personalized advertisements based on your prior visits to this website and other websites across the Internet.',
          'Google’s use of advertising cookies enables it and its partners to serve ads based on your visit to GlobalTalk and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google Ad Settings (https://adssettings.google.com/) or by visiting www.aboutads.info.',
        ],
      },
      {
        heading: '3. Managing and disabling cookies',
        paragraphs: [
          'You can control and manage cookies through your browser settings. Most browsers allow you to block third-party cookies, clear existing cookies, or browse in private/incognito mode. Please note that disabling cookies will not affect your ability to use GlobalTalk’s core anonymous chat rooms.',
          'For more information on how Google handles data in advertising products, visit Google’s Privacy & Terms at https://policies.google.com/technologies/ads.',
        ],
      },
    ],
  },
  copyright: {
    title: 'Copyright & Takedown Policy',
    description:
      'Procedures for reporting copyright infringement under the Indian Copyright Act, 1957.',
    path: '/copyright',
    sections: [
      {
        heading: '1. Intellectual property compliance',
        paragraphs: [
          'GlobalTalk respects the intellectual property rights of creators and adheres to the provisions of the Indian Copyright Act, 1957 (as amended) and Section 79 of the Information Technology Act, 2000.',
          'Users are strictly prohibited from transmitting, sharing, or publishing any copyrighted text, literary works, lyrics, source code, images, or multimedia content without valid authorization or statutory license from the copyright owner.',
        ],
      },
      {
        heading: '2. Notice of copyright infringement',
        paragraphs: [
          'If you believe that your copyrighted work has been infringed on GlobalTalk, please submit a formal written takedown notice to our designated contact email: contactchandan0101@gmail.com with the subject line "[COPYRIGHT INFRINGEMENT NOTICE]".',
          'Your notice must include the following statutory details: (a) Description of the copyrighted work claimed to have been infringed; (b) Exact URL, room name, temporary sender nickname, and exact timestamp (IST) of the infringing material; (c) Contact information of the copyright owner or authorized representative (Full legal name, physical address, email, telephone); (d) A good-faith statement that the disputed use is not authorized by the copyright owner, its agent, or the law; (e) A statement that the information in the notification is accurate and under penalty of perjury; (f) Physical or electronic signature.',
        ],
      },
      {
        heading: '3. Review, takedown, and counter-notice procedure',
        paragraphs: [
          'Upon receipt of a valid and actionable copyright notice, GlobalTalk will review the complaint and, where technically feasible in our ephemeral architecture, take prompt steps to disable access to the identified infringing material within statutory timelines.',
          'Counter-Notice Procedure: If a user believes their content was removed or disabled by mistake or misidentification, they may submit a formal counter-notice within 14 days specifying the reasons, evidence of ownership/fair use, and contact details for legal service of process.',
          'Designated Legal Contact: Chandan (contactchandan0101@gmail.com). Physical Office Address in India is pending configuration in platform settings.',
        ],
      },
    ],
  },
  grievance: {
    title: 'Grievance Redressal Policy',
    description:
      'Statutory redressal framework under Rule 3(2) of the Information Technology Rules, 2021.',
    path: '/grievance',
    sections: [
      {
        heading: '1. Statutory framework and Resident Grievance Officer',
        paragraphs: [
          'In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the February 2026 MeitY amendments, GlobalTalk has designated a Resident Grievance Officer in India to address user grievances regarding content and platform safety.',
          'Intermediary Safe Harbor: GlobalTalk operates as an electronic communication intermediary under Section 2(1)(w) of the IT Act, 2000. Observance of due diligence under the IT Rules is mandatory to maintain qualified safe harbor under Section 79. Users may submit complaints regarding prohibited content, synthetic deception, or privacy breaches.',
        ],
      },
      {
        heading: '2. Resident Grievance Officer details',
        paragraphs: [
          'Designation: Resident Grievance Officer',
          'Officer Name: Chandan (Designated Resident Grievance Officer)',
          'Official Email: contactchandan0101@gmail.com (Subject: Statutory Grievance Notice)',
          'Physical Office Address: [Physical Office Address in India — Pending Configuration by Platform Owner]',
          'Country: India',
        ],
      },
      {
        heading: '3. Statutory response timelines (as amended 2026)',
        paragraphs: [
          '• Formal Acknowledgement: Acknowledged within 24 hours of receipt with a unique complaint ticket reference.',
          '• General Grievance Resolution: Investigated and disposed of within 7 days of receipt.',
          '• Unlawful Content Removal (Rule 3(1)(b)): Reviewed and access disabled within 36 hours upon valid notice.',
          '• Non-Consensual Intimate Imagery / Deepfakes (Rule 3(2)(b)): Acted upon within 2 hours to disable access.',
          '• Judicial Orders / Government Directives (Rule 3(1)(d)): Complied with within 3 hours upon lawful direction.',
        ],
      },
      {
        heading: '4. Grievance Appellate Committee (GAC) escalation',
        paragraphs: [
          'Under Rule 3A of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, any user aggrieved by a decision of the Resident Grievance Officer, or in the event of failure to resolve the grievance within the statutory timeline, may appeal to the Grievance Appellate Committee (GAC) established by the Central Government.',
          'Appeals can be lodged within 30 days of receipt of the Grievance Officer’s communication via the official GAC online portal: https://gac.gov.in.',
        ],
      },
    ],
  },
};
