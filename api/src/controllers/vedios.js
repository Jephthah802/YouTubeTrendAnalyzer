import NodeCache from 'node-cache';
import { callYouTubeAPI } from '../utils/youtube.js';
import { parseISO8601Duration } from '../utils/duration.js';

const cache = new NodeCache({ stdTTL: 3600 });

export async function getTrendingVideos(req, res) {
  const { regions, categoryId, maxResults = 10, videoType = 'all', maxVideos = 5 } = req.query;
  console.log(`[getTrendingVideos] 🟢 Request received with query:`, req.query);

  if (!regions) {
    console.log('[getTrendingVideos] ❌ Missing regions parameter');
    return res.status(400).json({ error: 'Regions required' });
  }

  if (!['all', 'short', 'long'].includes(videoType)) {
    console.log('[getTrendingVideos] ❌ Invalid videoType parameter');
    return res.status(400).json({ error: 'Invalid videoType. Use all, short, or long.' });
  }

  console.log(`[getTrendingVideos] 🔑 API Key Present?`, process.env.YOUTUBE_API_KEY ? '✅ Yes' : '❌ No');

  const regionCodes = regions.split(',');
  const results = {};

  try {
    for (const region of regionCodes) {
      const cacheKey = `trending_${region}_${categoryId || 'all'}_${maxResults}_${videoType}_${maxVideos}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        console.log(`[getTrendingVideos] 💾 Cache hit for ${cacheKey}`);
        results[region] = cached;
        continue;
      }

      console.log(`[getTrendingVideos] 🔄 Cache miss for ${cacheKey}, fetching data...`);

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

        console.log(`[getTrendingVideos] 🌍 Fetching page ${pageCount + 1} for ${region}, category=${categoryId || 'all'}, type=${videoType}`);
        const data = await callYouTubeAPI('videos', params);

        console.log(`[getTrendingVideos] 📥 Received ${data.items?.length || 0} items, nextPageToken=${data.nextPageToken || 'none'}`);

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

      if (filteredVideos.length === 0 && videoType !== 'all') {
        console.log(`[getTrendingVideos] ⚠️ No ${videoType} videos found for ${region}, fetching fallback...`);
        fallbackReason = `No ${videoType} videos found, showing all trending videos`;

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

      console.log(`[getTrendingVideos] ✅ Final result for ${region}: ${filteredVideos.length} videos`);
      const response = { videos: filteredVideos };
      if (fallbackReason) response.fallbackReason = fallbackReason;

      cache.set(cacheKey, response);
      results[region] = response;
    }

    console.log(`[getTrendingVideos] 🟢 Sending response for ${regionCodes.length} region(s)`);
    res.json(results);
  } catch (error) {
    console.error('[getTrendingVideos] ❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getCategories(req, res) {
  const regionCode = req.query.regionCode || 'US';
  const cacheKey = `categories_${regionCode}`;
  const cached = cache.get(cacheKey);

  console.log(`[getCategories] 🟢 Request received for region ${regionCode}`);
  console.log(`[getCategories] 🔑 API Key Present?`, process.env.YOUTUBE_API_KEY ? '✅ Yes' : '❌ No');

  if (cached) {
    console.log(`[getCategories] 💾 Cache hit for ${regionCode}`);
    return res.json(cached);
  }

  try {
    console.log(`[getCategories] 🔄 Cache miss. Calling YouTube API...`);
    const data = await callYouTubeAPI('videoCategories', { part: 'snippet', regionCode });

    console.log(`[getCategories] 📥 Received ${data.items?.length || 0} categories from YouTube`);

    const categories = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
    }));

    cache.set(cacheKey, categories);
    console.log(`[getCategories] ✅ Cached and returning ${categories.length} categories for ${regionCode}`);

    res.json(categories);
  } catch (error) {
    console.error(`[getCategories] ❌ Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
}
