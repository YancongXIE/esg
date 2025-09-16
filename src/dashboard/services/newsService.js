// News service for fetching ESG news from various sources
const NEWS_UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Helper function to get DOMParser
const getDOMParser = async () => {
  if (typeof window !== 'undefined') {
    // Browser environment - use native DOMParser
    return window.DOMParser;
  } else {
    // Node.js environment - not supported in browser builds
    // console.log('DOMParser not available in Node.js environment');
    return null;
  }
};

// Helper function to simulate waiting for dynamic content to load
const waitForContent = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced wait function for dynamic content
const waitForDynamicContent = async (doc, maxAttempts = 10, interval = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    // Check for common dynamic content indicators
    const hasNewsList = doc.querySelector('.news-list, .news-item, article');
    const hasNewsLinks = doc.querySelectorAll('a[href*="/news/"]').length > 0;
    const hasContent = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 5;
    
    if (hasNewsList || hasNewsLinks || hasContent) {
      // console.log(`Dynamic content detected after ${(i + 1) * interval}ms`);
      return true;
    }
    
    // console.log(`Waiting for dynamic content... attempt ${i + 1}/${maxAttempts}`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // console.log('Dynamic content timeout - proceeding with available content');
  return false;
};

// Helper function to format publication date
const formatPublicationDate = (publishedAt) => {
  const date = new Date(publishedAt);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};

// Helper function to extract publication date from news page
const extractPublicationDate = async (url, source) => {
  try {
    // console.log(`${source}: Extracting publication date from ${url}`);
    
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      // console.log(`${source}: Failed to fetch page for date extraction: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const html = data.contents;
    
    const DOMParser = await getDOMParser();
    if (!DOMParser) {
      // console.log(`${source}: DOMParser not available for date extraction`);
      return null;
    }
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Try different selectors for publication date
    const dateSelectors = [
      'time[datetime]',
      '.published-date',
      '.post-date',
      '.article-date',
      '.news-date',
      '[class*="date"]',
      '[class*="time"]',
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="pubdate"]',
      'meta[property="og:article:published_time"]'
    ];
    
    for (const selector of dateSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        let dateStr = '';
        
        if (element.tagName === 'META') {
          dateStr = element.getAttribute('content');
        } else if (element.hasAttribute('datetime')) {
          dateStr = element.getAttribute('datetime');
        } else {
          dateStr = element.textContent.trim();
        }
        
        if (dateStr) {
          // console.log(`${source}: Found date string: "${dateStr}"`);
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // console.log(`${source}: Parsed date: ${date.toISOString()}`);
            return date;
          }
        }
      }
    }
    
    // console.log(`${source}: No valid publication date found`);
    return null;
  } catch (error) {
    // console.log(`${source}: Error extracting publication date: ${error.message}`);
    return null;
  }
};

// Helper function to extract news from HTML with multiple attempts
const extractNewsFromHTML = async (html, source, baseUrl) => {
  // console.log(`${source}: Parsing HTML content (${html.length} characters)`);
  
  const DOMParser = await getDOMParser();
  if (!DOMParser) {
    // console.log(`${source}: DOMParser not available, returning empty array`);
    return [];
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const newsItems = [];
  
  // Define selectors based on source
  let selectors = [];
  let urlPrefix = '';
  
  if (source === 'AASB') {
    selectors = [
      'section.light.boxes .box a.arrow',  // Primary selector for AASB news links
      'section.light.boxes a[href*="/news/"]',  // Direct news links
      'a[href*="/news/"]',
      'h3 a, h2 a, h1 a',
      '.news-item a',
      'article a',
      'a[href*="aasb.gov.au"]',
      'a[href*="/about-us/"]',
      'a[href*="/standards/"]'
    ];
    urlPrefix = 'https://www.aasb.gov.au';
  }
  
  let articleLinks = [];
  
  // Try each selector
  for (const selector of selectors) {
    const links = doc.querySelectorAll(selector);
    // console.log(`${source}: Selector "${selector}" found ${links.length} links`);
    
    if (links.length > 0) {
      articleLinks = links;
      // console.log(`${source}: Using selector: ${selector} with ${links.length} links`);
      break;
    }
  }
  
  // If no specific selectors work, try all links
  if (articleLinks.length === 0) {
    articleLinks = doc.querySelectorAll('a[href*="' + baseUrl + '"]');
    // console.log(`${source}: Fallback - Found ${articleLinks.length} total links containing "${baseUrl}"`);
  }
  
  // Also try all links as absolute fallback
  if (articleLinks.length === 0) {
    articleLinks = doc.querySelectorAll('a');
    // console.log(`${source}: Absolute fallback - Found ${articleLinks.length} total links`);
  }
  
      // Process the found links
      for (let index = 0; index < Math.min(articleLinks.length, 10); index++) {
        const link = articleLinks[index];
        let title = link.textContent.trim();
        let url = link.getAttribute('href');
          
      // For AASB "Read more" links, try to get the actual title from parent elements
      if (source === 'AASB' && (title.toLowerCase().includes('read more') || title === '')) {
        // Look for title in parent elements
        let parent = link.parentElement;
        while (parent && parent !== doc.body) {
          // Look for heading elements (h1, h2, h3, h4, h5, h6) in the parent
          const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) {
            const headingText = heading.textContent.trim();
            if (headingText && headingText.length > 10 && !headingText.toLowerCase().includes('read more')) {
              title = headingText;
              break;
            }
          }
          
          // Also check for strong or bold text
          const strongText = parent.querySelector('strong, b');
          if (strongText) {
            const strongTextContent = strongText.textContent.trim();
            if (strongTextContent && strongTextContent.length > 10 && !strongTextContent.toLowerCase().includes('read more')) {
              title = strongTextContent;
              break;
            }
          }
          
          // Fallback to parent text content
          const parentTitle = parent.textContent.trim();
          if (parentTitle && parentTitle.length > 10 && !parentTitle.toLowerCase().includes('read more')) {
            // Extract the first meaningful line
            const lines = parentTitle.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const meaningfulLine = lines.find(line => 
              line.length > 10 && 
              !line.toLowerCase().includes('read more') &&
              !line.toLowerCase().includes('standards') &&
              !line.toLowerCase().includes('registrations') &&
              !line.toLowerCase().includes('all')
            );
            if (meaningfulLine) {
              title = meaningfulLine;
              break;
            }
          }
          parent = parent.parentElement;
        }
      }
          
          // console.log(`${source}: Link ${index + 1}: "${title}" -> "${url}"`);
          
          // Ensure proper URL construction
          if (url) {
            if (url.startsWith('http')) {
              // Already a full URL - ensure it's the correct domain
              if (source === 'AASB' && !url.includes('aasb.gov.au')) {
                // Skip if it's not an AASB URL
                return;
              }
            } else if (url.startsWith('/')) {
              // Absolute path from root
              url = urlPrefix + url;
            } else {
              // Relative path - be more careful about construction
              if (source === 'AASB') {
                url = `https://www.aasb.gov.au/${url}`;
              } else {
                url = urlPrefix + '/' + url;
              }
            }
          }
      
      // Filter for actual news articles
      const isValidNews = title && url && title.length > 5 && 
        (url.includes(baseUrl) || url.includes('asic.gov.au') || url.includes('aasb.gov.au')) && 
        !title.toLowerCase().startsWith('search') &&
        !title.toLowerCase().includes('menu') &&
        !title.toLowerCase().includes('subscribe') &&
        !title.toLowerCase().includes('contact') &&
        !title.toLowerCase().includes('home') &&
        !title.toLowerCase().includes('privacy') &&
        !title.toLowerCase().includes('accessibility') &&
        !title.toLowerCase().includes('copyright') &&
        !title.toLowerCase().includes('media releases') &&
        !title.toLowerCase().includes('reports and publications') &&
        !title.toLowerCase().includes('asic\'s views') &&
        !title.toLowerCase().includes('bannings and alerts') &&
        !title.toLowerCase().includes('all news') &&
        !title.toLowerCase().includes('view all') &&
        !title.toLowerCase().includes('more news') &&
        !url.includes('outlook.com') && // Exclude email tracking links
        !url.includes('?category=') && // Exclude category filter links
        !url.includes('#') && // Exclude anchor links
        !url.includes('javascript:') && // Exclude JavaScript links
        (url.includes('/news/') || url.includes('/about-us/') || url.includes('/standards/')) &&
        // Additional validation for AASB: must be a news article or related content
        (source !== 'AASB' || ((url.includes('/news/') || url.includes('/about-us/') || url.includes('/standards/')) && title.length > 10));
      
      if (isValidNews) {
        // console.log(`${source}: Valid news found: "${title}" -> "${url}"`);
        
        let publishedAt = null;
        
        
        // For AASB, try to extract date from the list page first
        if (source === 'AASB' && !publishedAt) {
          // Look for date in the same container as the link
          let parent = link.parentElement;
          while (parent && parent !== doc.body) {
            // Look for date in div.date structure
            const dateElement = parent.querySelector('div.date');
            if (dateElement) {
              const dayElement = dateElement.querySelector('div.day');
              const monthElement = dateElement.querySelector('div.month');
              const yearElement = dateElement.querySelector('div.year');
              
              if (dayElement && monthElement && yearElement) {
                const day = parseInt(dayElement.textContent.trim());
                const monthName = monthElement.textContent.trim().toLowerCase();
                const year = parseInt(yearElement.textContent.trim());
                
                // console.log(`AASB: Found date in list page: ${day} ${monthName} ${year}`);
                
                // Convert month name to number
                const monthMap = {
                  'january': 0, 'february': 1, 'march': 2, 'april': 3,
                  'may': 4, 'june': 5, 'july': 6, 'august': 7,
                  'september': 8, 'october': 9, 'november': 10, 'december': 11
                };
                
                const month = monthMap[monthName];
                if (month !== undefined && !isNaN(day) && !isNaN(year)) {
                  publishedAt = new Date(year, month, day);
                  // console.log(`AASB: Parsed date from list page: ${publishedAt}`);
                  break;
                }
              }
            }
            
            parent = parent.parentElement;
          }
        }
        
        // If no date found from list page, try to extract from individual page
        if (!publishedAt) {
          publishedAt = await extractPublicationDate(url, source);
        }
        
        newsItems.push({
          id: `${source.toLowerCase()}-${index}`,
          title: title,
          source: source,
          time: publishedAt ? formatPublicationDate(publishedAt) : `${index + 1} hour${index > 0 ? 's' : ''} ago`,
          url: url,
          publishedAt: publishedAt || new Date(Date.now() - (index + 1) * 60 * 60 * 1000)
        });
      }
    }
  
  // console.log(`${source}: Final result: ${newsItems.length} valid news items`);
  return newsItems;
};

// Real news fetching functions
const fetchAASBNews = async () => {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const newsItems = [];
    
    const aasbPages = [
      'https://www.aasb.gov.au/news/',
      'https://www.aasb.gov.au/',
      'https://www.aasb.gov.au/about-us/news/'
    ];
    
    for (const pageUrl of aasbPages) {
      try {
        // console.log(`AASB: Trying to fetch from ${pageUrl}`);
        
        const aasbUrl = encodeURIComponent(pageUrl);
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(proxyUrl + aasbUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; ESG-News-Bot/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // console.log(`AASB: Parsing HTML content (${data.contents.length} characters)`);
        
        const DOMParser = await getDOMParser();
        if (!DOMParser) {
          // console.error('AASB: DOMParser not available');
          continue;
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        
        // Wait for dynamic content to load
        // console.log(`AASB: Waiting for dynamic content on ${pageUrl}...`);
        await waitForDynamicContent(doc, 10, 1000); // Wait up to 10 seconds
        
        // Extract news using the helper function
        const foundItems = await extractNewsFromHTML(data.contents, 'AASB', 'aasb.gov.au');
        
        if (foundItems.length > 0) {
          newsItems.push(...foundItems);
          // console.log(`AASB: Successfully found ${foundItems.length} news items from ${pageUrl}`);
          break; // Stop trying other pages if we found news
        }
        
      } catch (error) {
        // If timeout or network error, try next page
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('408')) {
          continue; // Try next page
        }
        // For other errors, also try next page
        continue;
      }
    }
    
    // If no news found from any page, return fallback data
    if (newsItems.length === 0) {
      return getFallbackAASBNews();
    }
    
    return newsItems.slice(0, 5); // Limit to 5 articles
  } catch (error) {
    // Return fallback data on any error
    return getFallbackAASBNews();
  }
};

// Fallback news data when parsing fails

const getFallbackAASBNews = () => {
  const baseDate = new Date('2025-09-16');
  return [
    { 
      id: 'aasb-fallback-1', 
      title: 'Registrations Open: 2025 AASB Research Forum', 
      source: 'AASB', 
      time: formatPublicationDate(baseDate),
      url: 'https://www.aasb.gov.au/news/registrations-open-2025-aasb-research-forum/',
      publishedAt: baseDate
    },
    { 
      id: 'aasb-fallback-2', 
      title: 'Proportionality Mechanisms in AASB S2', 
      source: 'AASB', 
      time: formatPublicationDate(new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000)),
      url: 'https://www.aasb.gov.au/news/proportionality-mechanisms-in-aasb-s2/',
      publishedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000)
    },
    { 
      id: 'aasb-fallback-3', 
      title: 'Statement of Cash Flows and Related Matters for Australian Listed Entities', 
      source: 'AASB', 
      time: formatPublicationDate(new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000)),
      url: 'https://www.aasb.gov.au/news/statement-of-cash-flows-and-related-matters-australian-listed-entities/',
      publishedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Mock news data for demonstration (in production, this would be replaced with real API calls)
const mockGlobalESGNews = [
  { 
    id: 1, 
    title: 'T. Rowe Price Launches $200 Million Emerging Markets Blue Bond Impact Fund', 
    source: 'ESG Today', 
    time: '2 hours ago',
    url: 'https://www.esgtoday.com/t-rowe-price-launches-200-million-emerging-markets-blue-bond-impact-fund/',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  { 
    id: 2, 
    title: 'Mars Launches Program to Transition Global Value Chain to Renewable Energy', 
    source: 'ESG Today', 
    time: '3 hours ago',
    url: 'https://www.esgtoday.com/mars-launches-program-to-transition-global-value-chain-to-renewable-energy/',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  },
  { 
    id: 3, 
    title: 'Wharton, PRI Launch Responsible Investment Executive Education Course', 
    source: 'ESG Today', 
    time: '4 hours ago',
    url: 'https://www.esgtoday.com/wharton-pri-launch-responsible-investment-executive-education-course/',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  { 
    id: 4, 
    title: 'Robeco Awarded $18 Billion Mandate for Dutch Pension Fund\'s Shift to More Sustainability-Focused Strategy', 
    source: 'ESG Today', 
    time: '5 hours ago',
    url: 'https://www.esgtoday.com/robeco-awarded-18-billion-mandate-for-dutch-pension-funds-shift-to-more-sustainability-focused-strategy/',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
  },
  { 
    id: 5, 
    title: 'U.S. EPA to Scrap Requirements to Report Greenhouse Gas Emissions', 
    source: 'ESG Today', 
    time: '6 hours ago',
    url: 'https://www.esgtoday.com/u-s-epa-to-scrap-requirements-to-report-greenhouse-gas-emissions/',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
];

const mockAustralianESGNews = [
  { 
    id: 1, 
    title: 'ASIC Climate Risk Disclosure Guidance for Directors', 
    source: 'ASIC', 
    time: '1 hour ago',
    url: 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/',
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  { 
    id: 2, 
    title: 'AASB Climate-related Financial Disclosures Consultation', 
    source: 'AASB', 
    time: '2 hours ago',
    url: 'https://www.aasb.gov.au/news/',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  { 
    id: 3, 
    title: 'ASIC Report on Climate Risk Disclosure by ASX Companies', 
    source: 'ASIC', 
    time: '4 hours ago',
    url: 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  { 
    id: 4, 
    title: 'AASB Sustainability Reporting Standards Update', 
    source: 'AASB', 
    time: '6 hours ago',
    url: 'https://www.aasb.gov.au/news/',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  { 
    id: 5, 
    title: 'ASIC Greenwashing Enforcement Actions', 
    source: 'ASIC', 
    time: '8 hours ago',
    url: 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  },
  { 
    id: 6, 
    title: 'AASB Assurance Standards for Sustainability Information', 
    source: 'AASB', 
    time: '1 day ago',
    url: 'https://www.aasb.gov.au/news/',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
];

// Helper function to format time ago
const formatTimeAgo = (publishedAt) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - publishedAt) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Simulate API call with random updates
const fetchGlobalESGNews = async () => {
  try {
    // console.log('ESG Today: Fetching global ESG news from category page...');
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.allorigins.win/get?url=https://www.esgtoday.com/category/esg-news/', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ESG-News-Bot/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return mockGlobalESGNews.map(news => ({
        ...news,
        time: formatTimeAgo(news.publishedAt)
      }));
    }
    
    const data = await response.json();
    const html = data.contents;
    
    const DOMParser = await getDOMParser();
    if (!DOMParser) {
      // console.log('ESG Today: DOMParser not available, using fallback data');
      return mockGlobalESGNews.map(news => ({
        ...news,
        time: formatTimeAgo(news.publishedAt)
      }));
    }
    
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract news articles from ESG News category page
    const newsItems = [];
    
    // Look for article containers - based on the page structure
    const articleSelectors = [
      'time[datetime]',  // Direct time elements with datetime
      'article time[datetime]',  // Time elements within articles
      '.post time[datetime]',  // Time elements within posts
      'h2',  // Main article headings
      'h3',  // Sub article headings
      'article',
      '.post',
      '.news-item',
      '.entry',
      '[class*="article"]',
      '[class*="post"]'
    ];
    
    let articles = [];
    for (const selector of articleSelectors) {
      const found = doc.querySelectorAll(selector);
      articles = [...articles, ...Array.from(found)];
    }
    
    // console.log(`ESG Today: Found ${articles.length} potential article containers`);
    
    // If no article containers found, try to extract from links directly
    if (articles.length === 0) {
      // console.log('ESG Today: No article containers found, trying direct link extraction');
      
      const linkSelectors = [
        'h2 a',
        'h3 a',
        '.post-title a',
        '.entry-title a',
        'a[href*="/20"]' // Links with year in URL
      ];
      
      let allLinks = [];
      for (const selector of linkSelectors) {
        const links = doc.querySelectorAll(selector);
        allLinks = [...allLinks, ...Array.from(links)];
      }
      
      // console.log(`ESG Today: Found ${allLinks.length} potential news links`);
      
      // Process each link
      for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
        const link = allLinks[i];
        const title = link.textContent.trim();
        let url = link.getAttribute('href');
        
        if (!title || !url || title.length < 10) continue;
        
        // Ensure proper URL construction
        if (url.startsWith('/')) {
          url = 'https://www.esgtoday.com' + url;
        } else if (!url.startsWith('http')) {
          url = 'https://www.esgtoday.com/' + url;
        }
        
        // Filter for actual news articles
        if (url.includes('esgtoday.com') && 
            !url.includes('#') && 
            !url.includes('?') &&
            !title.toLowerCase().includes('read more') &&
            !title.toLowerCase().includes('view all') &&
            !title.toLowerCase().includes('subscribe') &&
            !title.toLowerCase().includes('contact') &&
            !title.toLowerCase().includes('category') &&
            !title.toLowerCase().includes('newsletter')) {
          
          // console.log(`ESG Today: Processing article: "${title}"`);
          
          // Try to extract date from the link's parent container (category page)
          let publishedAt = null;
          let parent = link.parentElement;
          while (parent && parent !== doc.body) {
            // Look for <time> elements with datetime attribute
            const timeElement = parent.querySelector('time[datetime]');
            if (timeElement) {
              const datetime = timeElement.getAttribute('datetime');
              if (datetime) {
                publishedAt = new Date(datetime);
                if (!isNaN(publishedAt.getTime())) {
                  // console.log(`ESG Today: Found date in category page from time element: ${datetime}`);
                  break;
                } else {
                  publishedAt = null;
                }
              }
            }
            
            // If no time element found, try text content
            if (!publishedAt) {
              const dateText = parent.textContent;
              const dateMatch = dateText.match(/(\w+ \w+ \d{1,2}, \d{4})/g);
              if (dateMatch) {
                // Try each date match to find a valid one
                for (const match of dateMatch) {
                  const testDate = new Date(match);
                  if (!isNaN(testDate.getTime())) {
                    publishedAt = testDate;
                    // console.log(`ESG Today: Found date in category page parent: ${match}`);
                    break;
                  }
                }
                if (publishedAt) break;
              }
            }
            parent = parent.parentElement;
          }
          
          // If no date found in category page, use fallback time
          if (!publishedAt) {
            // console.log(`ESG Today: No date found in category page, using fallback time`);
            publishedAt = new Date(Date.now() - i * 60 * 60 * 1000);
          }
          
          newsItems.push({
            id: `esg-today-${i}`,
            title: title,
            source: 'ESG Today',
            time: publishedAt ? formatPublicationDate(publishedAt) : formatTimeAgo(new Date(Date.now() - i * 60 * 60 * 1000)),
            url: url,
            publishedAt: publishedAt || new Date(Date.now() - i * 60 * 60 * 1000)
          });
        }
      }
    } else {
      // Process article containers
      for (let i = 0; i < Math.min(articles.length, 15); i++) {
        const article = articles[i];
        
        // For time elements, find the associated article
        let titleLink = null;
        let title = '';
        let url = '';
        
        if (article.tagName === 'TIME') {
          // For time elements, find the associated article container
          let parent = article.parentElement;
          while (parent && parent !== doc.body) {
            const link = parent.querySelector('h2 a, h3 a, a[href*="/20"]');
            if (link) {
              titleLink = link;
              break;
            }
            parent = parent.parentElement;
          }
        } else if (article.tagName === 'H2' || article.tagName === 'H3') {
          // Check if the heading itself is a link
          if (article.querySelector('a')) {
            titleLink = article.querySelector('a');
          } else {
            // Look for a link in the next sibling elements
            let nextElement = article.nextElementSibling;
            while (nextElement && !titleLink) {
              titleLink = nextElement.querySelector('a');
              if (titleLink) break;
              nextElement = nextElement.nextElementSibling;
            }
          }
          
          if (!titleLink) {
            // If no link found, use the heading text as title and skip
            title = article.textContent.trim();
            if (title.length > 10) {
              // console.log(`ESG Today: Found heading without link: "${title}"`);
              // Skip headings without links
              continue;
            }
          }
        } else {
          // For other containers, look for title links
          titleLink = article.querySelector('h2 a, h3 a, .post-title a, .entry-title a, a');
        }
        
        if (titleLink) {
          title = titleLink.textContent.trim();
          url = titleLink.getAttribute('href');
        }
        
        if (!title || !url || title.length < 10) continue;
        
        // Ensure proper URL construction
        if (url.startsWith('/')) {
          url = 'https://www.esgtoday.com' + url;
        } else if (!url.startsWith('http')) {
          url = 'https://www.esgtoday.com/' + url;
        }
        
        // Filter for actual news articles
        if (!url.includes('esgtoday.com') || 
            url.includes('#') || 
            url.includes('?') ||
            title.toLowerCase().includes('read more') ||
            title.toLowerCase().includes('view all') ||
            title.toLowerCase().includes('subscribe') ||
            title.toLowerCase().includes('contact') ||
            title.toLowerCase().includes('category') ||
            title.toLowerCase().includes('newsletter')) {
          continue;
        }
        
        // console.log(`ESG Today: Processing article: "${title}"`);
        
        // Extract publication date from article container (category page)
        let publishedAt = null;
        
        if (article.tagName === 'TIME') {
          // Direct time element
          const datetime = article.getAttribute('datetime');
          if (datetime) {
            publishedAt = new Date(datetime);
            if (!isNaN(publishedAt.getTime())) {
              // console.log(`ESG Today: Found date in category page from time element: ${datetime}`);
            } else {
              publishedAt = null;
            }
          }
        } else {
          // Look for <time> elements with datetime attribute
          const timeElement = article.querySelector('time[datetime]');
          if (timeElement) {
            const datetime = timeElement.getAttribute('datetime');
            if (datetime) {
              publishedAt = new Date(datetime);
              if (!isNaN(publishedAt.getTime())) {
                // console.log(`ESG Today: Found date in category page from time element: ${datetime}`);
              } else {
                publishedAt = null;
              }
            }
          } else {
            // Debug: check what elements are available
            const allTimeElements = article.querySelectorAll('time');
            // console.log(`ESG Today: Found ${allTimeElements.length} time elements in article`);
            allTimeElements.forEach((el, idx) => {
              // console.log(`ESG Today: Time element ${idx}: class="${el.className}", datetime="${el.getAttribute('datetime')}", text="${el.textContent}"`);
            });
          }
        }
        
        // If no time element found, try to find date in text content
        if (!publishedAt) {
          const dateText = article.textContent;
          // Look for date patterns like "Mark Segal September 15, 2025" or "September 15, 2025"
          const dateMatch = dateText.match(/(\w+ \w+ \d{1,2}, \d{4})/g);
          if (dateMatch) {
            // Try each date match to find a valid one
            for (const match of dateMatch) {
              const testDate = new Date(match);
              if (!isNaN(testDate.getTime())) {
                publishedAt = testDate;
                // console.log(`ESG Today: Found date in category page from text: ${match}`);
                break;
              }
            }
          }
        }
        
        // If no date found in category page, use fallback time
        if (!publishedAt) {
          // console.log(`ESG Today: No date found in category page, using fallback time`);
          publishedAt = new Date(Date.now() - i * 60 * 60 * 1000);
        }
        
        newsItems.push({
          id: `esg-today-${i}`,
          title: title,
          source: 'ESG Today',
          time: publishedAt ? formatPublicationDate(publishedAt) : formatTimeAgo(new Date(Date.now() - i * 60 * 60 * 1000)),
          url: url,
          publishedAt: publishedAt || new Date(Date.now() - i * 60 * 60 * 1000)
        });
      }
    }
    
    // console.log(`ESG Today: Successfully extracted ${newsItems.length} news items`);
    
    // If no news found, use fallback data
    if (newsItems.length === 0) {
      // console.log('ESG Today: No news found, using fallback data');
      return mockGlobalESGNews.map(news => ({
        ...news,
        time: formatTimeAgo(news.publishedAt)
      }));
    }
    
    return newsItems.slice(0, 6); // Limit to 6 articles
    
  } catch (error) {
    // Handle timeout and other errors gracefully
    if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('408')) {
      // Timeout or network error - return fallback data
      return mockGlobalESGNews.map(news => ({
        ...news,
        time: formatTimeAgo(news.publishedAt)
      }));
    }
    // For other errors, also return fallback data
    return mockGlobalESGNews.map(news => ({
      ...news,
      time: formatTimeAgo(news.publishedAt)
    }));
  }
};

const fetchAustralianESGNews = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // console.log('Fetching Australian ESG news...');
    
    // Only fetch AASB news (ASIC now uses static link)
    const aasbNews = await fetchAASBNews();
    
    // console.log(`AASB news: ${aasbNews.length} items`);
    
    // Format the news
    const allNews = aasbNews.map(news => ({
      ...news,
      time: formatPublicationDate(news.publishedAt)
    }));
    
    // console.log(`Total Australian news: ${allNews.length} items`);
    return allNews.slice(0, 6); // Limit to 6 articles
  } catch (error) {
    // console.error('Error fetching Australian news:', error);
    return [];
  }
};

// Add some randomness to simulate new articles occasionally
const addRandomNews = (newsArray) => {
  const randomGlobalNews = [
    {
      id: Date.now(),
      title: 'New ESG Reporting Standards Take Effect Globally',
      source: 'ESG Today',
      time: 'Just now',
      url: 'https://www.esgtoday.com/new-esg-reporting-standards/',
      publishedAt: new Date()
    },
    {
      id: Date.now() + 1,
      title: 'Climate Risk Disclosure Requirements Expand',
      source: 'Reuters',
      time: 'Just now',
      url: 'https://reuters.com/climate-risk-disclosure/',
      publishedAt: new Date()
    }
  ];

  const randomAustralianNews = [
    {
      id: Date.now() + 100,
      title: 'ASIC Climate Risk Management in Investment Decisions',
      source: 'ASIC',
      time: 'Just now',
      url: 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/',
      publishedAt: new Date()
    },
    {
      id: Date.now() + 101,
      title: 'AASB Nature-related Financial Disclosures Discussion',
      source: 'AASB',
      time: 'Just now',
      url: 'https://www.aasb.gov.au/news/',
      publishedAt: new Date()
    },
    {
      id: Date.now() + 102,
      title: 'ASIC ESG Compliance Enforcement Priorities',
      source: 'ASIC',
      time: 'Just now',
      url: 'https://asic.gov.au/about-asic/news-centre/find-a-media-release/',
      publishedAt: new Date()
    },
    {
      id: Date.now() + 103,
      title: 'AASB Sustainability Climate Reporting Framework',
      source: 'AASB',
      time: 'Just now',
      url: 'https://www.aasb.gov.au/news/',
      publishedAt: new Date()
    }
  ];
  
  // 10% chance of adding random news
  if (Math.random() < 0.1) {
    const isGlobal = newsArray[0]?.source === 'ESG Today' || newsArray[0]?.source === 'Reuters';
    const randomNews = isGlobal ? randomGlobalNews : randomAustralianNews;
    const randomItem = randomNews[Math.floor(Math.random() * randomNews.length)];
    return [randomItem, ...newsArray.slice(0, 4)]; // Keep only 5 items
  }
  
  return newsArray;
};

export {
  fetchGlobalESGNews,
  fetchAustralianESGNews,
  fetchAASBNews,
  getFallbackAASBNews,
  getDOMParser,
  NEWS_UPDATE_INTERVAL,
  addRandomNews
};
