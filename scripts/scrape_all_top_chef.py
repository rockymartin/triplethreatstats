#!/usr/bin/env python3
"""
Comprehensive script to scrape ALL Top Chef contestants from Wikipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re

WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/List_of_Top_Chef_contestants"

def scrape_all_top_chef_contestants():
    """Scrape ALL Top Chef contestants from Wikipedia"""
    print(f"Fetching data from {WIKIPEDIA_URL}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(WIKIPEDIA_URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        contestants = set()
        
        # Find all tables with contestant data
        tables = soup.find_all('table', class_='wikitable')
        
        for table in tables:
            # Check if this table has contestant data (has columns like "Contestant" or "Chef")
            headers = table.find_all('th')
            header_text = ' '.join([h.get_text().lower() for h in headers])
            
            if 'contestant' in header_text or 'chef' in header_text or 'name' in header_text:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header
                    cells = row.find_all(['td', 'th'])
                    if len(cells) > 0:
                        # First cell usually contains the name
                        first_cell = cells[0]
                        
                        # Look for a link (most reliable)
                        link = first_cell.find('a')
                        if link:
                            name = link.get_text(strip=True)
                            href = link.get('href', '')
                            
                            # More strict filtering for valid names
                            if (name and 
                                len(name) > 2 and 
                                len(name) < 50 and
                                not name.isdigit() and
                                not re.match(r'^\d+[:\-]', name) and
                                not name.lower().startswith(('season', 'episode', 'top chef', 'winner', 'runner', 'eliminated', 'about', 'article', 'articles', 'contestants', 'references', 'navigation', 'menu', 'tools', 'languages', 'categories', 'talk', 'edit', 'view', 'history', 'search', 'create', 'account', 'log', 'contributions', 'donate')) and
                                not name.startswith('(') and
                                not name.startswith('[') and
                                '/' in href and  # Valid Wikipedia link
                                ':' not in name[:3]):  # Not "1:Location"
                                # Check if it looks like a person's name (has capital letter, not all caps)
                                if name[0].isupper() and not name.isupper():
                                    contestants.add(name)
                        else:
                            # Try text content
                            text = first_cell.get_text(strip=True)
                            # Remove footnotes
                            text = re.sub(r'\[.*?\]', '', text)
                            text = re.sub(r'\(.*?\)', '', text)
                            text = text.strip()
                            
                            if (text and 
                                len(text) > 2 and 
                                len(text) < 60 and
                                not text.isdigit() and
                                not re.match(r'^\d+[:\-]', text) and
                                not text.lower().startswith(('season', 'episode', 'top chef:', 'winner', 'runner-up', 'eliminated')) and
                                ':' not in text[:5]):  # Avoid "1:Location" format
                                contestants.add(text)
        
        # Remove common Wikipedia navigation/UI elements
        noise_words = [
            'about wikipedia', 'article', 'articles', 'contestants', 'references',
            'navigation', 'menu', 'tools', 'languages', 'categories', 'talk', 'edit',
            'view', 'history', 'search', 'create', 'account', 'log', 'contributions',
            'donate', 'top', 'contestants', 'references', 'hide', 'show', 'main page',
            'contents', 'featured content', 'current events', 'random article'
        ]
        
        # Filter out noise
        filtered_contestants = set()
        for name in contestants:
            name_lower = name.lower()
            is_noise = False
            for noise in noise_words:
                if noise in name_lower or name_lower == noise:
                    is_noise = True
                    break
            
            # Additional checks
            if (not is_noise and
                len(name) > 2 and
                len(name) < 50 and
                name[0].isupper() and
                not name.isdigit() and
                not re.match(r'^\d+', name) and
                ':' not in name[:5] and
                not name.startswith(('(', '[', '{'))):
                filtered_contestants.add(name)
        
        return sorted(list(filtered_contestants))
        
    except Exception as e:
        print(f"Error scraping Wikipedia: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    contestants = scrape_all_top_chef_contestants()
    
    if contestants:
        print(f"\nFound {len(contestants)} Top Chef contestants")
        
        # Save to JSON file
        output_file = 'src/data/topChefContestants.json'
        with open(output_file, 'w') as f:
            json.dump(contestants, f, indent=2)
        
        print(f"Saved to {output_file}")
        print("\nSample contestants (first 30):")
        for contestant in contestants[:30]:
            print(f"  - {contestant}")
        if len(contestants) > 30:
            print(f"  ... and {len(contestants) - 30} more")
    else:
        print("No contestants found")

if __name__ == '__main__':
    main()

