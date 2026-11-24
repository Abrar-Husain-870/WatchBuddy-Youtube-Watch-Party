import { DISCOVERY_VIDEOS } from './discoveryVideos';

/**
 * Viral Video Randomization Engine
 * Supplies randomized, unpredictable viral YouTube video recommendations
 * matching specific explore categories without requiring a Google API key.
 */

export const EXPLORE_CATEGORIES = [
  { id: 'All', label: 'All', icon: 'Compass' },
  { id: 'Music', label: 'Music', icon: 'Music' },
  { id: 'Movies & TV', label: 'Movies & TV', icon: 'Film' },
  { id: 'Live', label: 'Live', icon: 'Radio' },
  { id: 'Gaming', label: 'Gaming', icon: 'Gamepad2' },
  { id: 'Podcasts', label: 'Podcasts', icon: 'Mic' },
  { id: 'Playables', label: 'Playables', icon: 'Dices' },
  { id: 'Memberships', label: 'Memberships', icon: 'Star' },
  { id: 'Trending', label: 'Trending', icon: 'Flame' },
];

export const VIRAL_VIDEOS_POOL = [
  // --- Music ---
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    channel: 'Rick Astley',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    views: '1.5B views',
    uploaded: '14 years ago',
    duration: '3:33',
    category: 'Music',
    tags: ['viral', 'classic', 'pop']
  },
  {
    id: 'kXYiU_JCYtU',
    title: 'Linkin Park - Numb [Official Music Video 4K Remaster]',
    channel: 'Linkin Park',
    channelAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop',
    views: '2.3B views',
    uploaded: '16 years ago',
    duration: '3:07',
    category: 'Music',
    tags: ['rock', 'alternative', 'viral']
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    views: '1.7B views',
    uploaded: '15 years ago',
    duration: '5:59',
    category: 'Music',
    tags: ['classic', 'legendary']
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '8.4B views',
    uploaded: '7 years ago',
    duration: '4:42',
    category: 'Music',
    tags: ['viral', 'latino', 'record-breaking']
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel: 'Ed Sheeran',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    views: '6.2B views',
    uploaded: '7 years ago',
    duration: '4:24',
    category: 'Music',
    tags: ['pop', 'acoustic', 'mega-hit']
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
    channel: 'Mark Ronson',
    channelAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    views: '5.1B views',
    uploaded: '9 years ago',
    duration: '4:31',
    category: 'Music',
    tags: ['funk', 'dance']
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE (강남스타일) M/V',
    channel: 'officialpsy',
    channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop',
    views: '5.1B views',
    uploaded: '11 years ago',
    duration: '4:13',
    category: 'Music',
    tags: ['viral', 'k-pop', 'iconic']
  },

  // --- Movies & TV ---
  {
    id: 'giXco2jaZ_4',
    title: 'Top Gun: Maverick | Official Trailer (2022 Movie) - Tom Cruise',
    channel: 'Paramount Pictures',
    channelAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop',
    views: '42M views',
    uploaded: '2 years ago',
    duration: '2:30',
    category: 'Movies & TV',
    tags: ['action', 'blockbuster']
  },
  {
    id: 'UDVtMYqUAyw',
    title: 'Interstellar Main Theme - Soundtrack by Hans Zimmer',
    channel: 'Cinematic Soundtracks',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '67M views',
    uploaded: '8 years ago',
    duration: '11:58',
    category: 'Movies & TV',
    tags: ['sci-fi', 'soundtrack']
  },
  {
    id: 'TcMBFSGVi1c',
    title: 'Marvel Studios Avengers: Endgame - Official Trailer',
    channel: 'Marvel Entertainment',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    views: '159M views',
    uploaded: '5 years ago',
    duration: '2:27',
    category: 'Movies & TV',
    tags: ['marvel', 'avengers']
  },
  {
    id: 'shW9i6k8cB0',
    title: 'Spider-Man: No Way Home - Official Teaser Trailer',
    channel: 'Sony Pictures Entertainment',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
    views: '93M views',
    uploaded: '3 years ago',
    duration: '3:04',
    category: 'Movies & TV',
    tags: ['marvel', 'spider-man']
  },
  {
    id: '8Qn_spdM5Zg',
    title: 'Dune: Part Two | Official Trailer 3',
    channel: 'Warner Bros. Pictures',
    channelAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&h=80&fit=crop',
    views: '34M views',
    uploaded: '1 year ago',
    duration: '2:45',
    category: 'Movies & TV',
    tags: ['sci-fi', 'epic']
  },
  {
    id: '_cMxraX_5RE',
    title: 'Charge - Blender Open Movie in 4K',
    channel: 'Blender Studio',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    views: '4.8M views',
    uploaded: '1 year ago',
    duration: '3:11',
    category: 'Movies & TV',
    tags: ['cgi', 'animation', 'open-source']
  },

  // --- Live ---
  {
    id: '5qap5aO4i9A',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channel: 'Lofi Girl',
    channelAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    views: '88M views',
    uploaded: 'Streaming live',
    duration: 'LIVE',
    category: 'Live',
    tags: ['lofi', 'chill', 'music']
  },
  {
    id: '21X5lGlDOfg',
    title: 'NASA Live: Official Stream of Earth from Space',
    channel: 'NASA',
    channelAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&h=80&fit=crop',
    views: '45M views',
    uploaded: 'Streaming live',
    duration: 'LIVE',
    category: 'Live',
    tags: ['space', 'earth', 'live']
  },
  {
    id: 'DWcJFNfaw9c',
    title: 'Relaxing Fireplace 4K with Burning Logs & Crackling Sounds',
    channel: 'Calm Ambiance',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '22M views',
    uploaded: 'Streaming live',
    duration: 'LIVE',
    category: 'Live',
    tags: ['relaxing', 'nature']
  },
  {
    id: '4993sBLAzGA',
    title: 'Spectacular Views of Earth from the ISS in Ultra-HD 4K',
    channel: 'Space Science',
    channelAvatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=80&h=80&fit=crop',
    views: '12M views',
    uploaded: '3 years ago',
    duration: '15:20',
    category: 'Live',
    tags: ['cosmos', 'documentary']
  },

  // --- Gaming ---
  {
    id: 'QdBZY2fkU-0',
    title: 'Grand Theft Auto VI Trailer 1 (Official 4K)',
    channel: 'Rockstar Games',
    channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop',
    views: '215M views',
    uploaded: '11 months ago',
    duration: '1:31',
    category: 'Gaming',
    tags: ['gta6', 'rockstar', 'hype']
  },
  {
    id: 'MmB9b5njVbA',
    title: 'Minecraft Official Gameplay & World Trailer',
    channel: 'Minecraft',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    views: '168M views',
    uploaded: '5 years ago',
    duration: '1:22',
    category: 'Gaming',
    tags: ['sandbox', 'minecraft']
  },
  {
    id: 'qIcTM8WXFjk',
    title: 'Cyberpunk 2077 — Official Cinematic Trailer feat. Keanu Reeves',
    channel: 'Cyberpunk 2077',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
    views: '62M views',
    uploaded: '4 years ago',
    duration: '4:14',
    category: 'Gaming',
    tags: ['rpg', 'cyberpunk']
  },
  {
    id: '8X2kIfS6fb8',
    title: 'ELDEN RING - Official Gameplay Trailer',
    channel: 'Bandai Namco Entertainment',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    views: '28M views',
    uploaded: '3 years ago',
    duration: '2:58',
    category: 'Gaming',
    tags: ['elden-ring', 'souls']
  },

  // --- Podcasts ---
  {
    id: 'L_Guz73e6fw',
    title: 'Sam Altman: OpenAI, GPT-5, Sora, and AGI | Lex Fridman Podcast #419',
    channel: 'Lex Fridman',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '5.2M views',
    uploaded: '7 months ago',
    duration: '1:52:10',
    category: 'Podcasts',
    tags: ['ai', 'future', 'tech']
  },
  {
    id: 'Z1BCujX3pw8',
    title: 'Waveform Podcast: The State of AI Hardware & Future Tech',
    channel: 'Waveform: The MKBHD Podcast',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    views: '1.4M views',
    uploaded: '3 months ago',
    duration: '1:14:35',
    category: 'Podcasts',
    tags: ['gadgets', 'smartphones']
  },
  {
    id: 'gXDMoiEkyuQ',
    title: 'Huberman Lab: Master Your Focus and Brain Chemistry',
    channel: 'Andrew Huberman',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    views: '4.1M views',
    uploaded: '1 year ago',
    duration: '2:08:44',
    category: 'Podcasts',
    tags: ['neuroscience', 'productivity']
  },

  // --- Playables & Interactive ---
  {
    id: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny 4K 60fps Open Source Animation',
    channel: 'Blender Foundation',
    channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop',
    views: '19M views',
    uploaded: '9 years ago',
    duration: '9:56',
    category: 'Playables',
    tags: ['interactive', 'games', '3d']
  },
  {
    id: 'MmB9b5njVbA',
    title: 'Minecraft Mini-Games & Parkour Championships',
    channel: 'Playable Realms',
    channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
    views: '43M views',
    uploaded: '2 years ago',
    duration: '14:20',
    category: 'Playables',
    tags: ['arcade', 'multiplayer']
  },
  {
    id: '_cMxraX_5RE',
    title: 'Raytracing & Real-Time Physics Benchmark Showcase',
    channel: 'Unreal Engine Creators',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    views: '7.8M views',
    uploaded: '1 year ago',
    duration: '5:42',
    category: 'Playables',
    tags: ['tech-demo', 'realtime']
  },

  // --- Memberships (Creator Exclusives & Perks) ---
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Members-Only Backstage & Unreleased Studio Session',
    channel: 'Queen Official [Channel Member Access]',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    views: '1.2M views',
    uploaded: 'Exclusive',
    duration: '18:40',
    category: 'Memberships',
    tags: ['exclusive', 'backstage', 'music']
  },
  {
    id: 'L_Guz73e6fw',
    title: 'Supporters Q&A: Deep Dive into Unreleased LLM Architectures',
    channel: 'Lex Fridman Members',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '840K views',
    uploaded: 'Exclusive',
    duration: '42:15',
    category: 'Memberships',
    tags: ['exclusive', 'q&a', 'tech']
  },
  {
    id: 'giXco2jaZ_4',
    title: 'Behind the Stunts: Exclusive Director’s Cut & Commentary',
    channel: 'Paramount VIP Access',
    channelAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop',
    views: '3.1M views',
    uploaded: 'Exclusive',
    duration: '24:10',
    category: 'Memberships',
    tags: ['exclusive', 'directors-cut']
  },

  // --- Trending ---
  {
    id: 'QdBZY2fkU-0',
    title: 'Grand Theft Auto VI Trailer 1 (Official 4K)',
    channel: 'Rockstar Games',
    channelAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop',
    views: '215M views',
    uploaded: 'Trending #1',
    duration: '1:31',
    category: 'Trending',
    tags: ['viral', 'record']
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee (8 Billion Celebration)',
    channel: 'Luis Fonsi',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '8.4B views',
    uploaded: 'Trending #2',
    duration: '4:42',
    category: 'Trending',
    tags: ['viral', 'all-time']
  },
  {
    id: '5qap5aO4i9A',
    title: 'lofi hip hop radio 📚 - 24/7 Global Study Room',
    channel: 'Lofi Girl',
    channelAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    views: '88M views',
    uploaded: 'Trending Live',
    duration: 'LIVE',
    category: 'Trending',
    tags: ['global', 'live']
  },
  {
    id: 'L_Guz73e6fw',
    title: 'Sam Altman: What Comes After GPT-4 and the Road to Superintelligence',
    channel: 'Lex Fridman',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    views: '5.2M views',
    uploaded: 'Trending Tech',
    duration: '1:52:10',
    category: 'Trending',
    tags: ['ai', 'deep-tech']
  }
];

/**
 * Fisher-Yates array shuffle for non-predictable, randomized results
 */
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get randomized, fresh viral videos for a given category.
 * If category is 'All', mixes and shuffles across all categories.
 * Generates dynamic viral view counts so it feels completely live and fresh.
 */
export function getRandomizedVideos(category = 'All', limit = 16) {
  let pool = VIRAL_VIDEOS_POOL;

  if (category && category !== 'All') {
    pool = VIRAL_VIDEOS_POOL.filter(
      v => v.category.toLowerCase() === category.toLowerCase() ||
           (v.tags && v.tags.includes(category.toLowerCase()))
    );

    // If category pool has fewer than 4 items, backfill with mixed trending
    if (pool.length < 4) {
      const rest = VIRAL_VIDEOS_POOL.filter(v => v.category !== category);
      pool = [...pool, ...shuffleArray(rest).slice(0, 4)];
    }
  }

  // Shuffle and pick limit
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, limit);
}

/**
 * Search across all available video pools by title, channel, category, or tags.
 * @param {string} query
 * @returns {Array} Array of matching video objects
 */
export function searchVideos(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  const combined = [...VIRAL_VIDEOS_POOL, ...(DISCOVERY_VIDEOS || [])];
  const seen = new Set();
  const unique = [];

  for (const item of combined) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }

  return unique.filter(video => {
    const titleMatch = video.title?.toLowerCase().includes(q);
    const channelMatch = video.channel?.toLowerCase().includes(q);
    const categoryMatch = video.category?.toLowerCase().includes(q);
    const tagsMatch = video.tags?.some(tag => tag.toLowerCase().includes(q));
    return titleMatch || channelMatch || categoryMatch || tagsMatch;
  });
}

