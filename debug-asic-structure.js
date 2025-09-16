// Debug ASIC page structure to find the correct selectors
const pkg = require('./src/dashboard/services/newsService.js');
const { getDOMParser } = pkg;

console.log('Debugging ASIC page structure...');

async function debugASICStructure() {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const asicUrl = encodeURIComponent('https://asic.gov.au/about-asic/news-centre/find-a-media-release/');
    
    console.log('Fetching ASIC page...');
    const response = await fetch(proxyUrl + asicUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch ASIC page');
      return;
    }
    
    const data = await response.json();
    const html = data.contents;
    
    console.log(`HTML content length: ${html.length} characters`);
    
    const DOMParser = await getDOMParser();
    if (!DOMParser) {
      console.error('DOMParser not available');
      return;
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check for section.nr-list
    const nrListSection = doc.querySelector('section.nr-list');
    console.log(`\nsection.nr-list found: ${nrListSection ? 'Yes' : 'No'}`);
    
    if (nrListSection) {
      console.log('section.nr-list content preview:');
      console.log(nrListSection.textContent.substring(0, 200) + '...');
      
      const linksInSection = nrListSection.querySelectorAll('a');
      console.log(`Links in section.nr-list: ${linksInSection.length}`);
      
      linksInSection.forEach((link, index) => {
        if (index < 5) { // Show first 5 links
          console.log(`  ${index + 1}. "${link.textContent.trim()}" -> "${link.getAttribute('href')}"`);
        }
      });
    }
    
    // Check for other possible containers
    const containers = [
      'section[class*="nr"]',
      'section[class*="list"]',
      'section[class*="news"]',
      'div[class*="nr"]',
      'div[class*="list"]',
      'div[class*="news"]',
      'ul[class*="nr"]',
      'ul[class*="list"]',
      'ul[class*="news"]'
    ];
    
    console.log('\n=== Checking for news containers ===');
    containers.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`${selector}: ${elements.length} elements found`);
        elements.forEach((element, index) => {
          if (index < 2) { // Show first 2 elements
            console.log(`  Element ${index + 1}: ${element.textContent.substring(0, 100)}...`);
          }
        });
      }
    });
    
    // Check for any links that might be news
    const allLinks = doc.querySelectorAll('a');
    console.log(`\nTotal links on page: ${allLinks.length}`);
    
    const newsLikeLinks = Array.from(allLinks).filter(link => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      return href && text && 
        (href.includes('release') || href.includes('news') || 
         text.length > 10 && text.length < 200);
    });
    
    console.log(`\nNews-like links: ${newsLikeLinks.length}`);
    newsLikeLinks.forEach((link, index) => {
      if (index < 10) { // Show first 10 links
        console.log(`${index + 1}. "${link.textContent.trim()}" -> "${link.getAttribute('href')}"`);
      }
    });
    
  } catch (error) {
    console.error('Error debugging ASIC structure:', error);
  }
}

debugASICStructure();
