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
      'How GlobalTalk handles data across anonymous text chat and optional random video calls.',
    path: '/privacy',
    sections: [
      {
        heading: '1. Information handled by the GlobalTalk application',
        paragraphs: [
          'Temporary Nicknames and Country: The application generates a temporary nickname stored locally in your browser’s sessionStorage. If you select a country, that value is also kept in sessionStorage. This temporary profile is transmitted to the Cloudflare Worker when you connect to a room and is displayed only to participants in that room.',
          'Ephemeral Chat Messages: Text messages you send are transmitted in real time through Cloudflare Workers and Durable Objects to active participants in the selected room. The application does not store chat history or persist conversations in a database; messages exist ephemerally in server memory during transmission.',
          'Random Video Signaling and Media: If you choose Random Video and grant camera/microphone permissions, the Cloudflare Worker coordinates WebRTC signaling (exchanging session descriptions and connection candidates). In production, media packets travel through a TURN relay directly between participant browsers and the relay server. GlobalTalk does not intercept, record, or store video or audio streams.',
          'Abuse Reports and Moderation Evidence: When a participant reports a message, the application captures a moderation snapshot (including message ID, message text, temporary nickname, room, and timestamp) in service diagnostic logs. These records are maintained strictly for safety review, abuse mitigation, and compliance with statutory cybersecurity directions.',
        ],
      },
      {
        heading: '2. Browser storage and local data',
        paragraphs: [
          'The application uses browser sessionStorage to hold your temporary nickname and optional country selection. sessionStorage is cleared automatically by your browser when the tab or window session ends. GlobalTalk does not use persistent local tracking cookies for core chat operations.',
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
          'Google AdSense is utilized exclusively on static informational and editorial pages of the website (such as About, Safety, Guidelines, Terms, Privacy, and Contact). Ad scripts and advertising units are strictly prohibited and isolated from live chat rooms and random video calls.',
          'On static pages where ads are displayed, Google and its third-party advertising partners use cookies and web beacons to serve advertisements based on your prior visits to this website and other websites on the internet. You can learn more about how Google uses information from sites that use its services by visiting Google’s Privacy & Terms. You can manage or opt out of personalized advertising by visiting Google Ad Settings (adssettings.google.com) or the Network Advertising Initiative (optout.networkadvertising.org).',
        ],
      },
      {
        heading: '5. Data retention and data minimization',
        paragraphs: [
          'In alignment with data minimization principles (including under the Digital Personal Data Protection Act, 2023), GlobalTalk does not record, harvest, or archive ephemeral text chatter. Nickname and country data vanish from memory when your session disconnects.',
          'System access, firewall, and connection logs are maintained by edge infrastructure providers in accordance with statutory cybersecurity requirements (including applicable CERT-In directions under Section 70B of the IT Act). Abuse reports are retained in diagnostic logs for verification and legal compliance.',
        ],
      },
      {
        heading: '6. Privacy inquiries and user rights',
        paragraphs: [
          'Depending on your jurisdiction, you may have statutory rights regarding the processing of personal data. Because chat conversations are ephemeral and not linked to persistent user accounts or identities, GlobalTalk cannot retrieve or reconstruct past anonymous conversations. For privacy questions, contact requests, or regulatory inquiries, please consult the Contact page.',
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
          'By accessing or using GlobalTalk, you agree to be bound by these Terms of Service and our Community Guidelines. If you do not agree, do not use the service.',
          'GlobalTalk is intended for users who have reached the age of majority in their jurisdiction (18 years or older in India) or who are using the platform under the supervision of a parent or legal guardian. By using the platform, you represent that you meet these eligibility criteria.',
        ],
      },
      {
        heading: '2. Intermediary status under the Information Technology Act',
        paragraphs: [
          'GlobalTalk operates as an Intermediary under Section 2(1)(w) of the Information Technology Act, 2000. The platform provides automated, ephemeral electronic communication conduits without initiating transmissions, selecting message recipients, or altering message content.',
          'While GlobalTalk observes statutory due diligence under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and applicable amendments to maintain qualified intermediary safe harbor under Section 79 of the IT Act, this does not constitute an absolute or judicial guarantee of immunity from legal action.',
        ],
      },
      {
        heading: '3. Prohibited conduct and content restrictions',
        paragraphs: [
          'You agree not to host, display, upload, modify, publish, transmit, store, update, or share any information that: belongs to another person without authorization; is defamatory, obscene, pornographic, pedophilic, invasive of another’s privacy, or libelous; promotes harassment, hate speech, communal disharmony, violence, or unlawful gambling; harms minors in any way; or violates any law in force.',
          'Zero Tolerance for Exploitative Content: Any transmission of Child Sexual Abuse Material (CSAM), non-consensual sexual content, or extortion threats will result in immediate connection termination and referral to law enforcement authorities under the Protection of Children from Sexual Offences (POCSO) Act, 2012, and the Bharatiya Nyaya Sanhita (BNS), 2023.',
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
          '• Court Orders and Government Directives (Rule 3(1)(d)): Unlawful content subject to a valid judicial order or authorized government notification will be removed or disabled within 3 hours of receipt.',
        ],
      },
      {
        heading: '6. Disclaimers and limitation of liability',
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
          'If you encounter an abusive participant, click the report flag (⚑) on their message to hide it and submit an abuse snapshot. You can also leave the room or end a video call at any time.',
          'Important Advisory: GlobalTalk is an anonymous communication platform and does not provide emergency assistance. If you or someone else is in immediate danger or facing physical harm, immediately contact your local emergency services (such as dialing 112 in India or 911 in the United States).',
        ],
      },
    ],
  },
};
