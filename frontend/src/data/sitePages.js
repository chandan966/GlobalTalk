export const sitePages = {
  about: {
    title: 'About GlobalTalk',
    description: 'Learn how GlobalTalk chat rooms and random video calls work.',
    path: '/about',
    sections: [
      {
        heading: 'A place for live conversations',
        paragraphs: [
          'GlobalTalk is a browser-based communication service with public text rooms and an optional one-to-one random video feature. Choose how you want to connect without creating an account.',
          'The app uses temporary generated nicknames. Country is optional. Messages are sent to the room in real time and are not saved as chat history by the application.',
        ],
      },
      {
        heading: 'Use the service thoughtfully',
        paragraphs: [
          'Rooms and random video calls connect you with strangers. Do not share passwords, contact details, financial information, private images, or precise location. Other people may record their screens with separate software.',
          'The report control can hide a message in your current browser session and send report metadata to service logs. GlobalTalk does not currently have a staffed moderation dashboard, so reports are not guaranteed to be reviewed.',
        ],
      },
      {
        heading: 'Service limits',
        paragraphs: [
          'GlobalTalk is an early-stage service. Connections may be limited or temporarily unavailable, and the service does not promise that a room or message will always be available.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    description:
      'What GlobalTalk handles when you use anonymous text chat and optional video calls.',
    path: '/privacy',
    sections: [
      {
        heading: 'Information handled by GlobalTalk',
        paragraphs: [
          'The app creates a temporary nickname in your browser. If you choose a country, that selection is also stored in session storage. The nickname and optional country are sent to the Cloudflare Worker when you join a room and are shown to people in that room.',
          'If you choose Random Video and press Start, your browser asks for camera and microphone permission. The call sends audio and video through WebRTC, directly through a TURN relay in production. The Cloudflare Worker handles matchmaking and signaling, not media. GlobalTalk does not record or store call media. Another participant could record their screen using separate software.',
          'Messages you send are transmitted through the Worker to people connected to the same room. The application does not save chat history or store messages in a database.',
          'When you report a message, the Worker writes the message ID, room, temporary nickname, and report time to service logs. The report does not include the message text. Reports are not actively reviewed in the current starter service.',
        ],
      },
      {
        heading: 'Browser storage and cookies',
        paragraphs: [
          'The application uses sessionStorage for your temporary nickname and optional country. This browser storage is not a cookie and is cleared by the browser when the tab session ends, subject to browser behavior. The application does not currently set advertising cookies.',
        ],
      },
      {
        heading: 'Infrastructure providers and technical data',
        paragraphs: [
          'The frontend is hosted by Vercel and chat connections are handled by Cloudflare Workers and Durable Objects. These providers may process network and diagnostic data, such as IP addresses and request information, to deliver and protect their services. Their processing and retention are governed by their own terms and privacy notices and by the project account configuration.',
          'Production video calls use relay-only WebRTC to avoid sharing your direct IP address with the other participant. The TURN relay provider still processes network information needed to relay media. The GlobalTalk application does not display IP addresses or device identifiers to other users. Google Fonts are requested from Google Fonts when the page loads.',
        ],
      },
      {
        heading: 'Retention and security',
        paragraphs: [
          'The application does not retain message history or call media. Nickname and country values remain in browser session storage for the tab session. Video reports include a reason and temporary call-session reference in service logs; chat reports include message metadata. These logs may remain under the retention settings of the deployment account, and there is no staffed moderation team.',
          'The service uses HTTPS/WSS, input validation, and abuse limits. No internet service can guarantee absolute security.',
        ],
      },
      {
        heading: 'Advertising and your choices',
        paragraphs: [
          'Google AdSense and other advertising scripts are not currently installed. If advertising is added later, this policy and any required consent controls will be updated before ads are enabled. Google and its partners may use cookies or similar technologies to serve or measure ads, subject to the applicable Google policies and your settings.',
          'You can clear session storage through your browser controls and block third-party requests using browser privacy settings. Doing so may affect site functionality.',
        ],
      },
      {
        heading: 'Your privacy requests and policy updates',
        paragraphs: [
          'Privacy rights depend on where you live and which laws apply. Use the Contact page to ask a question or make a request. Because chats are not stored as history and report metadata is limited, GlobalTalk may not be able to identify or retrieve a particular message.',
          'This policy should be reviewed and updated when hosting, logging, advertising, or data practices change. Last updated: November 9, 2026.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description: 'Rules and limitations for using GlobalTalk chat and random video.',
    path: '/terms',
    sections: [
      {
        heading: 'Using GlobalTalk',
        paragraphs: [
          'By using GlobalTalk, you agree to follow these terms and the Community Guidelines. Use the service only where permitted by applicable law and only if you are legally able to agree to these terms.',
          'GlobalTalk is an anonymous-by-default public communication service. You are responsible for what you say and show. The service does not verify age or identity.',
        ],
      },
      {
        heading: 'Prohibited conduct',
        paragraphs: [
          'Do not post illegal content, threats, harassment, hateful or abusive content, spam, scams, malware, sexual exploitation content, or another person’s private information. Do not impersonate others or attack, overload, reverse engineer, or disrupt the service.',
          'Do not record, distribute, or misuse another user’s video or personal information. Do not use chat messages to distribute executable content or deceive other users. A video call may still be recorded by another participant using separate software.',
        ],
      },
      {
        heading: 'Moderation and availability',
        paragraphs: [
          'GlobalTalk may restrict connections or change the service to address abuse, security, legal, or operational concerns. The current report feature writes limited metadata to service logs but there is no staffed moderation team and no guarantee that a report will be reviewed.',
          'The service is provided on an evolving basis and may be changed, interrupted, or discontinued. Chat messages and call media are not retained by the GlobalTalk application.',
        ],
      },
      {
        heading: 'Disclaimers and liability',
        paragraphs: [
          'GlobalTalk does not verify users, identities, or user-generated information and cannot guarantee the conduct of other users. Use public rooms at your own discretion.',
          'To the extent permitted by applicable law, the service is provided without warranties and GlobalTalk is not liable for indirect or consequential loss. Nothing in these terms limits liability or rights that cannot legally be excluded.',
        ],
      },
      {
        heading: 'Changes and contact',
        paragraphs: [
          'These terms may be updated as the service changes. Continued use after an update means you accept the revised terms to the extent allowed by law. For questions, use the Contact page.',
          'Last updated: November 9, 2026.',
        ],
      },
    ],
  },
  guidelines: {
    title: 'Community Guidelines',
    description: 'Practical rules for safer and more respectful GlobalTalk conversations.',
    path: '/guidelines',
    sections: [
      {
        heading: 'Do',
        paragraphs: [
          'Be respectful, keep conversation relevant to the room, and remember that people may have different backgrounds and views.',
          'Protect your privacy. Use a temporary nickname and share only information you are comfortable showing or saying to a stranger.',
          'Leave a room or hide a message if a conversation makes you uncomfortable.',
        ],
      },
      {
        heading: 'Do not',
        paragraphs: [
          'Post threats, harassment, hate, illegal content, scams, spam, malware, sexual exploitation content, or personal information about yourself or someone else.',
          'Impersonate another person, pressure anyone to move off-platform, or attempt to attack, overload, or disrupt GlobalTalk.',
        ],
      },
      {
        heading: 'Report and moderation',
        paragraphs: [
          'Use the report control to submit a reason and limited report metadata. Reports are written to service logs and are not guaranteed to be reviewed by a person. Blocking only lasts for the current anonymous session.',
          'If someone is in immediate danger, contact local emergency services. GlobalTalk is not an emergency response service.',
        ],
      },
    ],
  },
};
