#!/usr/bin/env python3
"""
Comprehensive script to scrape ALL Iron Chef America contestants from Wikipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re

WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Iron_Chef_America"

def scrape_all_iron_chef_contestants():
    """Scrape ALL Iron Chef America contestants from Wikipedia"""
    print(f"Fetching data from {WIKIPEDIA_URL}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    contestants = set()
    
    try:
        response = requests.get(WIKIPEDIA_URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find sections about Iron Chefs
        iron_chef_section = soup.find('span', {'id': 'Iron_Chefs'})
        if iron_chef_section:
            section = iron_chef_section.find_parent()
            # Look for lists or tables in this section
            for elem in section.find_all_next(['ul', 'ol', 'table']):
                if elem.find_parent('span', {'id': 'Challengers'}):
                    break  # Stop at Challengers section
                
                # Extract names from links
                links = elem.find_all('a')
                for link in links:
                    name = link.get_text(strip=True)
                    href = link.get('href', '')
                    title = link.get('title', '')
                    
                    if (name and 
                        len(name) > 2 and 
                        len(name) < 60 and
                        not name.isdigit() and
                        ('chef' in title.lower() or '/wiki/' in href)):
                        contestants.add(name)
        
        # Find section about Challengers
        challengers_section = soup.find('span', {'id': 'Challengers'})
        if challengers_section:
            section = challengers_section.find_parent()
            # Look for lists or tables
            for elem in section.find_all_next(['ul', 'ol', 'table']):
                links = elem.find_all('a')
                for link in links:
                    name = link.get_text(strip=True)
                    href = link.get('href', '')
                    title = link.get('title', '')
                    
                    if (name and 
                        len(name) > 2 and 
                        len(name) < 60 and
                        not name.isdigit() and
                        ('chef' in title.lower() or '/wiki/' in href)):
                        contestants.add(name)
        
        # Also check tables for Iron Chef roster
        tables = soup.find_all('table', class_='wikitable')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                for cell in cells:
                    link = cell.find('a')
                    if link:
                        name = link.get_text(strip=True)
                        if (name and 
                            len(name) > 2 and 
                            len(name) < 60 and
                            not name.isdigit()):
                            contestants.add(name)
        
        # Filter out ingredients and noise
        filtered_contestants = set()
        noise_words = [
            'chiles', 'cobia', 'elk', 'kent', 'parmigiano reggiano', 'grappa', 'jalapeño',
            '[1]', '[2]', '[3]', 'edit', 'view', 'history', 'talk', 'article', 'articles'
        ]
        
        for name in contestants:
            name_lower = name.lower().strip()
            is_noise = False
            
            for noise in noise_words:
                if noise in name_lower or name_lower == noise:
                    is_noise = True
                    break
            
            # Additional filtering
            if (not is_noise and
                len(name) > 2 and
                len(name) < 50 and
                name[0].isupper() and
                not name.isdigit() and
                not name.startswith(('(', '[', '{')) and
                not name_lower.endswith('chef') and  # Avoid "Iron Chef" as a name
                ':' not in name[:5]):
                filtered_contestants.add(name)
        
        return sorted(list(filtered_contestants))
        
    except Exception as e:
        print(f"Error scraping Wikipedia: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    contestants = scrape_all_iron_chef_contestants()
    
    if contestants:
        print(f"\nFound {len(contestants)} Iron Chef America contestants")
        
        # Save to JSON file
        output_file = 'src/data/ironChefAmericaContestants.json'
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

