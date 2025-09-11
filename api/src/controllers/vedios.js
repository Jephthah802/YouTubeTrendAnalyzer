import NodeCache from 'node-cache';
import { callYouTubeAPI } from '../utils/youtube.js';
import { parseISO8601Duration } from '../utils/duration.js';

const cache = new NodeCache({ stdTTL: 3600 });

export async function getTrendingVideos(req, res) {
  const { regions, categoryId, maxResults = 10, videoType = 'all', maxVideos = 5 } = req.query;
  if (!regions) return res.status(400).json({ error: 'Regions required' });
  if (!['all', 'short', 'long'].includes(videoType)) {
    return res.status(400).json({ error: 'Invalid videoType. Use all, short, or long.' });
  }

  const regionCodes = regions.split(',');
  const results = {};

  try {
    for (const region of regionCodes) {
      const cacheKey = `trending_${region}_${categoryId || 'all'}_${maxResults}_${videoType}_${maxVideos}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${cacheKey}`);
        results[region] = cached;
        continue;
      }

      let videos = [];
      let nextPageToken = null;
      const targetVideos = parseInt(maxVideos);
      const maxPages = 5;
      let pageCount = 0;

      do {
        const params = {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: region,
          maxResults: Math.min(parseInt(maxResults), 50),
        };
        if (categoryId) params.videoCategoryId = categoryId;
        if (nextPageToken) params.pageToken = nextPageToken;

        console.log(`Fetching page ${pageCount + 1} for region ${region}, category ${categoryId || 'all'}, videoType ${videoType}`);
        const data = await callYouTubeAPI('videos', params);
        console.log(`Received ${data.items.length} items, nextPageToken: ${data.nextPageToken || 'none'}`);

        const newVideos = data.items.map(video => {
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
            isShort: durationSecs <= 60 || (video.snippet.tags && video.snippet.tags.some(tag => tag.toLowerCase().includes('short'))),
            isLong: durationSecs > 60,
          };
        });

        videos.push(...newVideos);
        nextPageToken = data.nextPageToken || null;
        pageCount++;

        // Keep fetching until we reach target count for short/long videos
        if (videoType !== 'all') {
          const filteredCount = videos.filter(v => videoType === 'short' ? v.isShort : v.isLong).length;
          if (filteredCount >= targetVideos) break;
        }

        if (!nextPageToken || pageCount >= maxPages) break;
      } while (true);

      let filteredVideos = videos;
      let fallbackReason = null;

      if (videoType === 'short') {
        filteredVideos = videos.filter(v => v.isShort).slice(0, targetVideos);
      } else if (videoType === 'long') {
        filteredVideos = videos.filter(v => v.isLong).slice(0, targetVideos);
      } else {
        filteredVideos = videos.slice(0, parseInt(maxResults));
      }

      // fallback if no short/long found
      if (filteredVideos.length === 0 && videoType !== 'all') {
        console.log(`No ${videoType} videos found for region ${region}, category ${categoryId || 'all'}, using fallback`);
        fallbackReason = `No ${videoType} videos found in trending ${categoryId ? 'category ' + categoryId : 'videos'} for region ${region}. Showing all trending videos instead.`;

        const fallbackParams = {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: region,
          maxResults: parseInt(maxResults),
        };
        if (categoryId) fallbackParams.videoCategoryId = categoryId;

        const fallbackData = await callYouTubeAPI('videos', fallbackParams);
        filteredVideos = fallbackData.items.map(video => {
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
            isShort: durationSecs <= 60 || (video.snippet.tags && video.snippet.tags.some(tag => tag.toLowerCase().includes('short'))),
            isLong: durationSecs > 60,
          };
        }).slice(0, parseInt(maxResults));
      }

      console.log(`Final videos for ${region}: ${filteredVideos.length} (Shorts: ${filteredVideos.filter(v => v.isShort).length}, Long: ${filteredVideos.filter(v => v.isLong).length})`);
      const response = { videos: filteredVideos };
      if (fallbackReason) response.fallbackReason = fallbackReason;

      cache.set(cacheKey, response);
      results[region] = response;
    }
    res.json(results);
  } catch (error) {
    console.error('Error in getTrendingVideos:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  const regionCode = req.query.regionCode || 'US';
  const cacheKey = `categories_${regionCode}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log(`[getCategories] Cache hit for region ${regionCode}`);
    return res.json(cached);
  }

  try {
    console.log(`[getCategories] Cache miss for ${regionCode}, calling YouTube API...`);

    const data = await callYouTubeAPI('videoCategories', { 
      part: 'snippet', 
      regionCode 
    });

    console.log(`[getCategories] YouTube API returned ${data.items?.length || 0} categories`);

    const categories = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
    }));

    cache.set(cacheKey, categories);
    console.log(`[getCategories] Cached ${categories.length} categories for ${regionCode}`);

    res.json(categories);
  } catch (error) {
    console.error(`[getCategories] Failed to fetch categories:`, error.message);
    res.status(500).json({ error: error.message });
  }
}