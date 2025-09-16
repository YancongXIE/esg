import { useState, useEffect, useCallback } from 'react';
import { fetchGlobalESGNews, fetchAustralianESGNews, NEWS_UPDATE_INTERVAL } from '../services/newsService';

export const useNewsData = () => {
  const [globalNews, setGlobalNews] = useState([]);
  const [australianNews, setAustralianNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setError(null);
      const [globalData, australianData] = await Promise.all([
        fetchGlobalESGNews(),
        fetchAustralianESGNews()
      ]);
      
      setGlobalNews(globalData);
      setAustralianNews(australianData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up auto-refresh interval
    const interval = setInterval(fetchNews, NEWS_UPDATE_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Manual refresh function
  const refreshNews = useCallback(() => {
    setLoading(true);
    fetchNews();
  }, [fetchNews]);

  return {
    globalNews,
    australianNews,
    loading,
    error,
    lastUpdated,
    refreshNews
  };
};
