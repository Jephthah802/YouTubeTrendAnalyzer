import NodeCache from 'node-cache';
import { callYouTubeAPI } from '../utils/youtube.js';
import { parseISO8601Duration } from '../utils/duration.js';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export async function getTrendingVideos(req, res) {
  const { regions, categoryId, maxResults = 10, videoType = 'all' } = req.query;
  console.log('[getTrendingVideos] Request query:', req.query);

  if (!regions) return res.status(400).json({ error: 'Regions required' });
  if (!['all', 'short', 'long'].includes(videoType)) {
    return res.status(400).json({ error: 'Invalid videoType. Use all, short, or long.' });
  }

  const regionCodes = regions.split(',');
  const results = {};

  try {
    for (const region of regionCodes) {
      const cacheKey = `trending_${region}_${categoryId || 'all'}_${maxResults}_${videoType}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`[getTrendingVideos] Cache hit for ${cacheKey}`);
        results[region] = cached;
        continue;
      }

      console.log(`[getTrendingVideos] Cache miss for ${cacheKey}, fetching from YouTube API...`);

      // Fetch only one page to prevent timeout
      const params = {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: region,
        maxResults: Math.min(parseInt(maxResults), 50),
      };
      if (categoryId) params.videoCategoryId = categoryId;

      const data = await callYouTubeAPI('videos', params);
      console.log(`[getTrendingVideos] Received ${data.items?.length || 0} items for region ${region}`);

      const videos = data.items.map(video => {
        const durationSecs = parseISO8601Duration(video.contentDetails.duration);
        return {
          id: video.id,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails.high.url,
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          embedUrl: `https://www.youtube.com/watch?v=${video.id}`,
          duration: video.contentDetails.duration,
          isShort: durationSecs <= 60,
          isLong: durationSecs > 60,
        };
      });

      // Filter based on videoType
      let filteredVideos = videos;
      if (videoType === 'short') filteredVideos = videos.filter(v => v.isShort);
      if (videoType === 'long') filteredVideos = videos.filter(v => v.isLong);

      cache.set(cacheKey, filteredVideos);
      results[region] = filteredVideos;
    }

    console.log('[getTrendingVideos] Sending response');
    return res.json(results);
  } catch (error) {
    console.error('[getTrendingVideos] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  const regionCode = req.query.regionCode || 'US';
  const cacheKey = `categories_${regionCode}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`[getCategories] Cache hit for ${regionCode}`);
    return res.json(cached);
  }

  try {
    console.log(`[getCategories] Cache miss, fetching from YouTube API for region ${regionCode}`);
    const data = await callYouTubeAPI('videoCategories', { part: 'snippet', regionCode });
    const categories = data.items.map(item => ({ id: item.id, title: item.snippet.title }));

    cache.set(cacheKey, categories);
    console.log(`[getCategories] Returning ${categories.length} categories for ${regionCode}`);
    return res.json(categories);
  } catch (error) {
    console.error('[getCategories] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
