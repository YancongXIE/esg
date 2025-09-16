// News service using Vite proxy instead of CORS proxy
import { getDOMParser, formatPublicationDate, NEWS_UPDATE_INTERVAL } from './newsService.js';

// Helper function to wait for dynamic content
const waitForDynamicContent = async (doc, maxAttempts = 10, interval = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const hasNewsList = doc.querySelector('.news-list, .news-item, article');
    const hasNewsLinks = doc.querySelectorAll('a[href*="/news/"]').length > 0;
    const hasContent = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 5;
    
    if (hasNewsList || hasNewsLinks || hasContent) {
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return false;
};

// Extract news from HTML using Vite proxy
const extractNewsFromHTML = async (html, source, baseUrl) => {
  const newsItems = [];
  
  const DOMParser = await getDOMParser();
  if (!DOMParser) {
    return newsItems;
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let selectors = [];
  let urlPrefix = '';
  
  if (source === 'AASB') {
    selectors = [
      'section.light.boxes .box a.arrow',
      'section.light.boxes a[href*="/news/"]',
      'a[href*="/news/"]',
      'h3 a, h2 a, h1 a',
      '.news-item a',
      'article a',
      'a[href*="aasb.gov.au"]',
      'a[href*="/about-us/"]',
      'a[href*="/standards/"]'
    ];
    urlPrefix = 'https://www.aasb.gov.au';
  } else if (source === 'ESG Today') {
    selectors = [
      'article a',
      'h2 a, h3 a',
      '.entry-title a',
      '.post-title a',
      'a[href*="/esg-news/"]',
      'a[href*="esgtoday.com"]'
    ];
    urlPrefix = 'https://www.esgtoday.com';
  }
  
  let links = [];
  for (const selector of selectors) {
    const foundLinks = doc.querySelectorAll(selector);
    if (foundLinks.length > 0) {
      links = Array.from(foundLinks);
      break;
    }
  }
  
  if (links.length === 0) {
    return newsItems;
  }
  
  for (let index = 0; index < Math.min(links.length, 10); index++) {
    const link = links[index];
    let title = link.textContent.trim();
    let url = link.getAttribute('href');
    
    if (!title || !url) continue;
    
    // Clean up title
    title = title.replace(/\s+/g, ' ').trim();
    
    // Ensure proper URL construction
    if (url) {
      if (url.startsWith('http')) {
        if (source === 'AASB' && !url.includes('aasb.gov.au')) {
          continue;
        }
      } else if (url.startsWith('/')) {
        url = urlPrefix + url;
      } else {
        if (source === 'AASB') {
          url = `https://www.aasb.gov.au/${url}`;
        } else {
          url = urlPrefix + '/' + url;
        }
      }
    }
    
    // Filter for actual news articles
    const isValidNews = title && url && title.length > 5 && 
      (url.includes(baseUrl) || url.includes('aasb.gov.au') || url.includes('esgtoday.com')) && 
      !title.toLowerCase().startsWith('search') &&
      !title.toLowerCase().includes('menu') &&
      !title.toLowerCase().includes('subscribe') &&
      !title.toLowerCase().includes('contact') &&
      !title.toLowerCase().includes('home') &&
      !title.toLowerCase().includes('privacy') &&
      !title.toLowerCase().includes('accessibility') &&
      !title.toLowerCase().includes('copyright') &&
      !url.includes('outlook.com') &&
      !url.includes('?category=') &&
      !url.includes('#') &&
      !url.includes('javascript:') &&
      (url.includes('/news/') || url.includes('/about-us/') || url.includes('/standards/') || url.includes('/esg-news/')) &&
      (source !== 'AASB' || ((url.includes('/news/') || url.includes('/about-us/') || url.includes('/standards/')) && title.length > 10));
    
    if (isValidNews) {
      let publishedAt = null;
      
      // For AASB, try to extract date from the list page first
      if (source === 'AASB' && !publishedAt) {
        let parent = link.parentElement;
        while (parent && parent !== doc.body) {
          const dateElement = parent.querySelector('div.date');
          if (dateElement) {
            const dayElement = dateElement.querySelector('div.day');
            const monthElement = dateElement.querySelector('div.month');
            const yearElement = dateElement.querySelector('div.year');
            
            if (dayElement && monthElement && yearElement) {
              const day = parseInt(dayElement.textContent.trim());
              const monthName = monthElement.textContent.trim().toLowerCase();
              const year = parseInt(yearElement.textContent.trim());
              
              const monthMap = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              
              const month = monthMap[monthName];
              if (month !== undefined && !isNaN(day) && !isNaN(year)) {
                publishedAt = new Date(year, month, day);
                break;
              }
            }
          }
          parent = parent.parentElement;
        }
      }
      
      // For ESG Today, try to extract date from time elements
      if (source === 'ESG Today' && !publishedAt) {
        const timeElement = link.closest('article')?.querySelector('time[datetime]');
        if (timeElement) {
          const datetime = timeElement.getAttribute('datetime');
          if (datetime) {
            publishedAt = new Date(datetime);
          }
        }
      }
      
      // Fallback to current time if no date found
      if (!publishedAt) {
        publishedAt = new Date(Date.now() - index * 60 * 60 * 1000);
      }
      
      newsItems.push({
        id: `${source.toLowerCase()}-${index}`,
        title: title,
        source: source,
        time: formatPublicationDate(publishedAt),
        url: url,
        publishedAt: publishedAt
      });
    }
  }
  
  return newsItems;
};

// Fetch AASB news using Vite proxy
const fetchAASBNewsViteProxy = async () => {
  try {
    const newsItems = [];
    
    const aasbPages = [
      '/api/aasb/news/',
      '/api/aasb/',
      '/api/aasb/about-us/news/'
    ];
    
    for (const pageUrl of aasbPages) {
      try {
        const response = await fetch(pageUrl);
        
        if (!response.ok) {
          continue;
        }
        
        const html = await response.text();
        
        const DOMParser = await getDOMParser();
        if (!DOMParser) {
          continue;
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        await waitForDynamicContent(doc, 5, 1000);
        
        const foundItems = await extractNewsFromHTML(html, 'AASB', 'aasb.gov.au');
        
        if (foundItems.length > 0) {
          newsItems.push(...foundItems);
          return newsItems.slice(0, 5);
        }
        
      } catch (error) {
        continue;
      }
    }
    
    return [];
    
  } catch (error) {
    return [];
  }
};

// Fetch Global ESG news using Vite proxy
const fetchGlobalESGNewsViteProxy = async () => {
  try {
    const response = await fetch('/api/esgtoday/category/esg-news/');
    
    if (!response.ok) {
      return [];
    }
    
    const html = await response.text();
    
    const DOMParser = await getDOMParser();
    if (!DOMParser) {
      return [];
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    await waitForDynamicContent(doc, 5, 1000);
    
    const foundItems = await extractNewsFromHTML(html, 'ESG Today', 'esgtoday.com');
    
    return foundItems.slice(0, 6);
    
  } catch (error) {
    return [];
  }
};

export {
  fetchAASBNewsViteProxy,
  fetchGlobalESGNewsViteProxy
};
