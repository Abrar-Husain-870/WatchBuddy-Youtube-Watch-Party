const https = require('https');

// Simple in-memory cache to avoid redundant network round-trips
const searchCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Live YouTube Search Service
 * Queries YouTube for real-time video results without requiring an API key.
 * @param {string} query
 * @param {number} [limit=16]
 * @returns {Promise<Array>}
 */
function searchYouTube(query, limit = 16) {
  return new Promise((resolve) => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return resolve([]);
    }

    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = `${cleanQuery}_${limit}`;

    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return resolve(cached.data);
    }

    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    const options = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        return resolve([]);
      }

      let html = '';
      res.on('data', (chunk) => {
        html += chunk;
      });

      res.on('end', () => {
        try {
          const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
          if (!match) {
            return resolve([]);
          }

          const json = JSON.parse(match[1]);
          const contents =
            json.contents?.twoColumnSearchResultsRenderer?.primaryContents
              ?.sectionListRenderer?.contents || [];

          const videos = [];

          for (const section of contents) {
            const items = section.itemSectionRenderer?.contents || [];
            for (const item of items) {
              const vr = item.videoRenderer;
              if (vr && vr.videoId) {
                const title = vr.title?.runs?.[0]?.text || 'YouTube Video';
                const channel =
                  vr.ownerText?.runs?.[0]?.text ||
                  vr.longBylineText?.runs?.[0]?.text ||
                  'YouTube Creator';
                const channelAvatar =
                  vr.channelThumbnailSupportedRendered
                    ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]
                    ?.url ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop';
                const views =
                  vr.viewCountText?.simpleText ||
                  vr.shortViewCountText?.simpleText ||
                  'Popular';
                const uploaded =
                  vr.publishedTimeText?.simpleText || 'Recently uploaded';
                const duration = vr.lengthText?.simpleText || (vr.badges?.some(b => b.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW') ? 'LIVE' : 'Video');

                videos.push({
                  id: vr.videoId,
                  title,
                  channel,
                  channelAvatar,
                  views,
                  uploaded,
                  duration,
                  category: 'YouTube Search'
                });

                if (videos.length >= limit) break;
              }
            }
            if (videos.length >= limit) break;
          }

          searchCache.set(cacheKey, { timestamp: Date.now(), data: videos });
          resolve(videos);
        } catch (err) {
          console.warn('Error parsing YouTube search response:', err.message);
          resolve([]);
        }
      });
    });

    req.on('error', (err) => {
      console.warn('Network error during YouTube search:', err.message);
      resolve([]);
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

module.exports = { searchYouTube };
