import axios from 'axios';
import { YOUTUBE_API_BASE } from '../config/youtubeConfig.js';
import dotenv from 'dotenv';

dotenv.config();

export async function callYouTubeAPI(endpoint, params) {
  const url = `${YOUTUBE_API_BASE}/${endpoint}?${new URLSearchParams({
    ...params,
    key: process.env.YOUTUBE_API_KEY,
  })}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}