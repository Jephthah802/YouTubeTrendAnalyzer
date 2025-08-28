import NodeCache from 'node-cache';
import { callYouTubeAPI } from '../utils/youtube.js';
import { parseISO8601Duration } from '../utils/duration.js';

const cache = new NodeCache({ stdTTL: 3600 });

export async function getTrendingVideos(req, res) {
  const { regions, categoryId, maxResults = 10, shortsOnly = 'false', maxShorts = 5 } = req.query;
  if (!regions) return res.status(400).json({ error: 'Regions required' });

  const regionCodes = regions.split(',');
  const results = {};

  try {
    for (const region of regionCodes) {
      const cacheKey = `trending_${region}_${categoryId || 'all'}_${maxResults}_${shortsOnly}_${maxShorts}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${cacheKey}`);
        results[region] = cached;
        continue;
      }

      let videos = [];
      let nextPageToken = null;
      const targetShorts = parseInt(maxShorts);
      const maxPages = 3; // Limit pagination to avoid quota issues

      let pageCount = 0;
      do {
        const params = {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: region,
          maxResults: Math.min(parseInt(maxResults), 50), // API max is 50
        };
        if (categoryId) params.videoCategoryId = categoryId;
        if (nextPageToken) params.pageToken = nextPageToken;

        console.log(`Fetching page ${pageCount + 1} for region ${region}, category ${categoryId || 'all'}`);
        const data = await callYouTubeAPI('videos', params);
        console.log(`Received ${data.items.length} items, nextPageToken: ${data.nextPageToken || 'none'}`);

        const newVideos = data.items.map(video => ({
          id: video.id,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails.high.url,
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          embedUrl: `https://www.youtube.com/watch?v=${video.id}`,
          duration: video.contentDetails.duration,
          isShort: parseISO8601Duration(video.contentDetails.duration) <= 60 || (video.snippet.tags && video.snippet.tags.includes('#shorts')),
        }));

        videos.push(...newVideos);
        nextPageToken = data.nextPageToken || null;
        pageCount++;

        // Stop if we have enough Shorts or no more pages
        if (shortsOnly === 'true' && videos.filter(v => v.isShort).length >= targetShorts) break;
        if (!nextPageToken || pageCount >= maxPages) break;
      } while (true);

      // Filter for Shorts if requested
      let filteredVideos = videos;
      if (shortsOnly === 'true') {
        filteredVideos = videos.filter(v => v.isShort).slice(0, targetShorts);
      } else {
        filteredVideos = videos.slice(0, parseInt(maxResults));
      }

      // Fallback: If no videos (or Shorts), try a single call without pagination
      if (filteredVideos.length === 0) {
        console.log(`No ${shortsOnly === 'true' ? 'Shorts' : 'videos'} found for region ${region}, category ${categoryId || 'all'}, trying fallback`);
        const fallbackParams = {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: region,
          maxResults: parseInt(maxResults),
        };
        if (categoryId) fallbackParams.videoCategoryId = categoryId;

        const fallbackData = await callYouTubeAPI('videos', fallbackParams);
        filteredVideos = fallbackData.items.map(video => ({
          id: video.id,
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails.high.url,
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          embedUrl: `https://www.youtube.com/watch?v=${video.id}`,
          duration: video.contentDetails.duration,
          isShort: parseISO8601Duration(video.contentDetails.duration) <= 60 || (video.snippet.tags && video.snippet.tags.includes('#shorts')),
        })).slice(0, parseInt(maxResults));
      }

      console.log(`Final videos for ${region}: ${filteredVideos.length} (${filteredVideos.filter(v => v.isShort).length} Shorts)`);
      cache.set(cacheKey, filteredVideos);
      results[region] = filteredVideos;
    }
    res.json(results);
  } catch (error) {
    console.error('Error in getTrendingVideos:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  const cacheKey = `categories_${req.query.regionCode || 'US'}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await callYouTubeAPI('videoCategories', { part: 'snippet', regionCode: req.query.regionCode || 'US' });
    const categories = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
    }));
    cache.set(cacheKey, categories);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}