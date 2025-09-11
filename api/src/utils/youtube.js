import axios from 'axios';
import { YOUTUBE_API_BASE } from '../config/youtubeConfig.js';
import dotenv from 'dotenv';

dotenv.config();

export async function callYouTubeAPI(endpoint, params) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('[callYouTubeAPI]  Missing YOUTUBE_API_KEY in environment variables!');
    throw new Error('YouTube API key not set on server');
  }

  const url = `${YOUTUBE_API_BASE}/${endpoint}?${new URLSearchParams({
    ...params,
    key: apiKey,
  })}`;

  console.log(`[callYouTubeAPI] 🔗 Requesting: ${url.replace(apiKey, '***KEY***')}`);

  try {
    const response = await axios.get(url, { timeout: 10000 }); 
    console.log(`[callYouTubeAPI]  Success: ${response.data.items?.length || 0} items returned`);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('[callYouTubeAPI] ⏱ Request timed out after 10s');
      throw new Error('YouTube API request timed out');
    }

    console.error(
      '[callYouTubeAPI]  API Error:',
      error.response?.data?.error?.message || error.message
    );

    throw new Error(error.response?.data?.error?.message || error.message);
  }
}
