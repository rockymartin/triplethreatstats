#!/usr/bin/env python3
"""
Comprehensive script to scrape ALL Beat Bobby Flay contestants from Wikipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re

WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Beat_Bobby_Flay"

def scrape_all_beat_bobby_flay_contestants():
    """Scrape ALL Beat Bobby Flay contestants from Wikipedia"""
    print(f"Fetching data from {WIKIPEDIA_URL}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    contestants = set()
    
    try:
        response = requests.get(WIKIPEDIA_URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find tables with contestant/episode data
        tables = soup.find_all('table', class_='wikitable')
        
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # Skip header
                cells = row.find_all(['td', 'th'])
                for cell in cells:
                    # Look for links to chef pages
                    links = cell.find_all('a')
                    for link in links:
                        name = link.get_text(strip=True)
                        href = link.get('href', '')
                        title = link.get('title', '')
                        
                        # Filter for valid chef names
                        if (name and 
                            len(name) > 2 and 
                            len(name) < 50 and
                            not name.isdigit() and
                            not name.lower().startswith(('season', 'episode', 'winner', 'beat bobby', 'bobby flay')) and
                            '/' in href and
                            name[0].isupper() and
                            not name.isupper()):
                            contestants.add(name)
        
        # Also look for lists of contestants
        lists = soup.find_all(['ul', 'ol'])
        for list_elem in lists:
            items = list_elem.find_all('li')
            for item in items:
                link = item.find('a')
                if link:
                    name = link.get_text(strip=True)
                    if (name and 
                        len(name) > 2 and 
                        len(name) < 50 and
                        not name.isdigit() and
                        name[0].isupper()):
                        contestants.add(name)
        
        # Filter out noise (ingredients, show names, etc.)
        noise_words = [
            'bobby flay', 'beat bobby', 'food network', 'episode', 'season',
            'winner', 'challenger', 'judge', 'about', 'article', 'edit', 'view', 'history',
            'a cook\'s tour', 'ace of cakes', 'adobo', 'agnolotti', 'alaskan king crab',
            'almond butter', 'anchovy', 'artichoke', 'asparagus', 'avocado', 'bacon',
            'beef', 'butter', 'crab', 'chicken', 'chocolate', 'coconut', 'corn',
            'cream', 'duck', 'egg', 'fish', 'garlic', 'honey', 'lamb', 'lobster',
            'mushroom', 'onion', 'pasta', 'pepper', 'pork', 'potato', 'rice',
            'salmon', 'shrimp', 'tomato', 'truffle', 'turkey', 'wine'
        ]
        
        # Common show/book titles and non-person names
        non_person_patterns = [
            r'^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z]',  # Likely show/book title
        ]
        
        filtered_contestants = set()
        for name in contestants:
            name_lower = name.lower().strip()
            is_noise = False
            
            # Check noise words
            for noise in noise_words:
                if noise in name_lower or name_lower == noise:
                    is_noise = True
                    break
            
            # Check if it looks like an ingredient (single word, common food)
            if not is_noise and len(name.split()) == 1:
                if name_lower in ['adobo', 'agnolotti', 'adobo', 'artichoke', 'asparagus']:
                    is_noise = True
            
            # Check patterns
            if not is_noise:
                for pattern in non_person_patterns:
                    if re.match(pattern, name):
                        is_noise = True
                        break
            
            # Final validation - must look like a person's name
            if (not is_noise and
                len(name) > 2 and
                len(name) < 50 and
                name[0].isupper() and
                not name.isdigit() and
                not name.startswith(('(', '[', '{')) and
                ' ' in name and  # Person names usually have spaces
                not name_lower.endswith(('tour', 'cakes', 'party', 'butter', 'crab', 'cherries', 'cook')) and
                not name_lower.startswith(('america', 'alaskan', 'almond'))):
                filtered_contestants.add(name)
        
        return sorted(list(filtered_contestants))
        
    except Exception as e:
        print(f"Error scraping Wikipedia: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    contestants = scrape_all_beat_bobby_flay_contestants()
    
    if contestants:
        print(f"\nFound {len(contestants)} Beat Bobby Flay contestants")
        
        # Save to JSON file
        output_file = 'src/data/beatBobbyFlayContestants.json'
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

