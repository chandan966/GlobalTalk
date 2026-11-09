const adjectives = [
  'Quiet',
  'Bright',
  'Curious',
  'Swift',
  'Cosmic',
  'Kind',
  'Blue',
  'Lucky',
  'Brave',
  'Sunny',
];

const nouns = ['Panda', 'Comet', 'Fox', 'River', 'Tiger', 'Pixel', 'Owl', 'Maple', 'Wolf', 'Star'];

export default function randomName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(10 + Math.random() * 90);

  return `${adjective}${noun}${number}`;
}
