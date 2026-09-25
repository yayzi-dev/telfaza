const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://perkvex.online';
const TODAY = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '', priority: '1.0', changefreq: 'hourly', title: 'Perkvex – Watch Free Movies, TV Shows & Anime in Ultra HD' },
  { path: '?tab=movies', priority: '0.9', changefreq: 'daily', title: 'Watch Free Movies Online 1080p & 4K HD – Perkvex Cinema' },
  { path: '?tab=tv', priority: '0.9', changefreq: 'daily', title: 'Stream Full TV Shows & Complete Series Free Online – Perkvex' },
  { path: '?tab=anime', priority: '0.9', changefreq: 'daily', title: 'Watch Trending Anime Online in HD with English Subtitles – Perkvex' },
  { path: '?tab=trending', priority: '0.9', changefreq: 'hourly', title: 'Top Trending Movies & Viral TV Shows Today – Perkvex' },
  { path: '?tab=top_rated', priority: '0.8', changefreq: 'daily', title: 'Top Rated Movies of All Time – Perkvex' },
];

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

// 50+ Top Movies, TV Shows & Anime for High-Ranking Programmatic SEO
const popularTitles = [
  // Blockbuster Movies
  { id: 550, title: 'Fight Club', type: 'movie', year: '1999', desc: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.' },
  { id: 157336, title: 'Interstellar', type: 'movie', year: '2014', desc: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.' },
  { id: 27205, title: 'Inception', type: 'movie', year: '2010', desc: 'A thief who steals corporate secrets through the use of dream-sharing technology.' },
  { id: 155, title: 'The Dark Knight', type: 'movie', year: '2008', desc: 'When the menace known as the Joker wreaks havoc and chaos on Gotham City, Batman must accept one of the greatest tests.' },
  { id: 299534, title: 'Avengers Endgame', type: 'movie', year: '2019', desc: 'After Thanos wiped out half of all life, the remaining Avengers assemble once more to reverse his actions.' },
  { id: 299536, title: 'Avengers Infinity War', type: 'movie', year: '2018', desc: 'The Avengers and their allies must sacrifice all in an attempt to defeat the powerful Thanos.' },
  { id: 693134, title: 'Dune Part Two', type: 'movie', year: '2024', desc: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.' },
  { id: 438631, title: 'Dune', type: 'movie', year: '2021', desc: 'Paul Atreides leads nomadic tribes in a battle to control the desert planet Arrakis.' },
  { id: 872585, title: 'Oppenheimer', type: 'movie', year: '2023', desc: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
  { id: 346698, title: 'Barbie', type: 'movie', year: '2023', desc: 'To live in Barbie Land is to be a perfect being in a perfect place. Unless you have an existential crisis.' },
  { id: 671, title: 'Harry Potter and the Sorcerers Stone', type: 'movie', year: '2001', desc: 'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself.' },
  { id: 19995, title: 'Avatar', type: 'movie', year: '2009', desc: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world.' },
  { id: 76600, title: 'Avatar The Way of Water', type: 'movie', year: '2022', desc: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.' },
  { id: 507089, title: 'Five Nights at Freddys', type: 'movie', year: '2023', desc: 'A troubled security guard begins working at Freddy Fazbear\'s Pizza.' },
  { id: 634649, title: 'Spider-Man No Way Home', type: 'movie', year: '2021', desc: 'Peter Parker seeks Doctor Strange\'s help to make people forget his identity as Spider-Man.' },
  { id: 569094, title: 'Spider-Man Across the Spider-Verse', type: 'movie', year: '2023', desc: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People.' },
  { id: 1022789, title: 'Inside Out 2', type: 'movie', year: '2024', desc: 'Joy, Sadness, Anger, Fear and Disgust are not sure how to feel when new emotions arrive.' },
  { id: 519182, title: 'Despicable Me 4', type: 'movie', year: '2024', desc: 'Gru, Lucy and their girls welcome a new member to the family, Gru Jr.' },
  { id: 533535, title: 'Deadpool and Wolverine', type: 'movie', year: '2024', desc: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him.' },
  { id: 786892, title: 'Furiosa A Mad Max Saga', type: 'movie', year: '2024', desc: 'The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max.' },

  // TV Series
  { id: 1399, title: 'Game of Thrones', type: 'tv', year: '2011', desc: 'Nine noble families fight for control over the lands of Westeros.' },
  { id: 1396, title: 'Breaking Bad', type: 'tv', year: '2008', desc: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.' },
  { id: 66732, title: 'Stranger Things', type: 'tv', year: '2016', desc: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.' },
  { id: 71446, title: 'Money Heist', type: 'tv', year: '2017', desc: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history.' },
  { id: 85271, title: 'WandaVision', type: 'tv', year: '2021', desc: 'Blends the style of classic sitcoms with the MCU in which Wanda Maximoff and Vision live their ideal suburban lives.' },
  { id: 94605, title: 'Arcane', type: 'tv', year: '2021', desc: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic champions.' },
  { id: 82856, title: 'The Mandalorian', type: 'tv', year: '2019', desc: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.' },
  { id: 100088, title: 'The Last of Us', type: 'tv', year: '2023', desc: 'After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl.' },
  { id: 119051, title: 'Wednesday', type: 'tv', year: '2022', desc: 'Wednesday Addams misadventures as a student at Nevermore Academy.' },
  { id: 93405, title: 'Squid Game', type: 'tv', year: '2021', desc: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games.' },
  { id: 94997, title: 'House of the Dragon', type: 'tv', year: '2022', desc: 'The story of the House Targaryen, set 200 years before the events of Game of Thrones.' },
  { id: 202411, title: 'Monarch Legacy of Monsters', type: 'tv', year: '2023', desc: 'Set after the battle between Godzilla and the Titans, revealing that monsters are real.' },
  { id: 70523, title: 'Dark', type: 'tv', year: '2017', desc: 'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes secrets.' },
  { id: 84958, title: 'Loki', type: 'tv', year: '2021', desc: 'The mercurial villain Loki resumes his role as the God of Mischief following the events of Avengers: Endgame.' },
  { id: 60059, title: 'Better Call Saul', type: 'tv', year: '2015', desc: 'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White.' },
  { id: 60625, title: 'Rick and Morty', type: 'tv', year: '2013', desc: 'An animated series that follows the exploits of a super scientist and his not-so-bright grandson.' },
  { id: 1398, title: 'The Sopranos', type: 'tv', year: '1999', desc: 'New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life.' },

  // Anime Shows & Movies
  { id: 1429, title: 'Attack on Titan', type: 'tv', year: '2013', desc: 'After his hometown is destroyed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.' },
  { id: 85937, title: 'Demon Slayer Kimetsu no Yaiba', type: 'tv', year: '2019', desc: 'A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon.' },
  { id: 37854, title: 'One Piece', type: 'tv', year: '1999', desc: 'Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gol D Roger.' },
  { id: 46260, title: 'Naruto Shippuden', type: 'tv', year: '2007', desc: 'Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition.' },
  { id: 95479, title: 'Jujutsu Kaisen', type: 'tv', year: '2020', desc: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.' },
  { id: 209867, title: 'Frieren Beyond Journeys End', type: 'tv', year: '2023', desc: 'The adventure is over but life goes on for an elf mage just beginning to learn what living is all about.' },
  { id: 127532, title: 'Solo Leveling', type: 'tv', year: '2024', desc: 'In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo is the weakest of all hunters.' },
  { id: 310569, title: 'Bleach Thousand Year Blood War', type: 'tv', year: '2022', desc: 'The peace is suddenly broken when warning sirens blare through the Soul Society.' },
  { id: 30984, title: 'Bleach', type: 'tv', year: '2004', desc: 'High school student Ichigo Kurosaki, who has the ability to see ghosts, gains soul reaper powers.' },
  { id: 129, title: 'Spirited Away', type: 'movie', year: '2001', desc: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.' },
  { id: 372058, title: 'Your Name', type: 'movie', year: '2016', desc: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?' }
];

function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // Core Landing Routes
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/${route.path}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Genre PSEO Routes
  for (const genre of genres) {
    const slug = encodeURIComponent(genre.toLowerCase().replace(/\s+/g, '-'));
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/?genre=${slug}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Programmatic Media Entries with Rich Video Tags for Googlebot Rich Snippets
  for (const item of popularTitles) {
    const titleSlug = encodeURIComponent(item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const pageUrl = `${DOMAIN}/?watch=${item.type}-${item.id}-${titleSlug}`;
    
    xml += `  <url>\n`;
    xml += `    <loc>${pageUrl}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `    <video:video>\n`;
    xml += `      <video:thumbnail_loc>https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&amp;w=1200</video:thumbnail_loc>\n`;
    xml += `      <video:title>${escapeXml(item.title)} (${item.year}) Free HD Stream – Perkvex</video:title>\n`;
    xml += `      <video:description>${escapeXml(item.desc)}</video:description>\n`;
    xml += `      <video:player_loc>${pageUrl}</video:player_loc>\n`;
    xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
    xml += `      <video:live>no</video:live>\n`;
    xml += `    </video:video>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), xml);
  console.log(`sitemap.xml generated with ${staticRoutes.length + genres.length + popularTitles.length} indexable URLs`);
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRobots() {
  const robots = `User-agent: *
Allow: /

# Priority Crawl instructions for Googlebot, Bingbot, DuckDuckGo & Yandex
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

# Full PSEO XML Sitemap Index
Sitemap: ${DOMAIN}/sitemap.xml
`;
  fs.writeFileSync(path.resolve(__dirname, '../public/robots.txt'), robots);
  console.log('robots.txt generated successfully');
}

generateSitemap();
generateRobots();
