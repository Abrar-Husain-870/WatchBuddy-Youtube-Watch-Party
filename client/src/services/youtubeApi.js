import { searchVideos } from '../data/viralVideoEngine';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Fetch live YouTube video search results from backend API.
 * Falls back to local curated pool if network is unreachable.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function fetchLiveYouTubeSearch(query) {
  if (!query || !query.trim()) return [];

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/search?q=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
      return data.videos;
    }

    // Fallback to local pool if backend returned empty
    return searchVideos(query);
  } catch (err) {
    console.warn('Backend live search failed, using local video pool:', err.message);
    return searchVideos(query);
  }
}
