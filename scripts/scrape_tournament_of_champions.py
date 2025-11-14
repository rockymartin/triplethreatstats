#!/usr/bin/env python3
"""
Comprehensive script to scrape ALL Tournament of Champions contestants from Wikipedia
"""

import requests
from bs4 import BeautifulSoup
import json
import re

WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Tournament_of_Champions_(TV_series)"

def is_valid_name(name):
    """Check if a string looks like a valid person's name"""
    if not name or len(name) < 3 or len(name) > 50:
        return False
    
    # Must start with capital letter
    if not name[0].isupper():
        return False
    
    # Common non-person patterns
    non_person_patterns = [
        r'^\d+',  # Starts with number
        r'^\$',   # Starts with dollar sign
        r'^\d+:', # Number followed by colon
        r'^Season', r'^Episode', r'^Round', r'^Final', r'^Semifinal', r'^Quarterfinal',
        r'^First Round', r'^Second Round', r'^Third Round',
        r'^Region', r'^East', r'^West', r'^North', r'^South',
        r'^Winner', r'^Runner', r'^Champion', r'^Tournament',
        r'^Randomizer', r'^Guy Fieri', r'^Judge', r'^Judges',
        r'^Food Network', r'^United States', r'^Poster',
    ]
    
    for pattern in non_person_patterns:
        if re.match(pattern, name, re.IGNORECASE):
            return False
    
    # Noise words that shouldn't be in names (show titles, common words, etc.)
    noise_words = [
        'tournament', 'champions', 'champion', 'competition', 'battle', 'match',
        'bracket', 'region', 'final', 'semifinal', 'quarterfinal', 'randomizer',
        'guy fieri', 'judge', 'judges', 'food network', 'season', 'episode',
        'winner', 'runner-up', 'contestant', 'chef', 'defeated', 'vs', 'vs.',
        'beat', 'won', 'lost', 'prize', 'money', 'dollar', 'thousand',
        'show', 'series', 'network', 'poster', 'genre', 'starring', 'country',
        'language', 'production', 'executive', 'producers', 'running', 'time',
        'release', 'network', 'banner', 'logo', 'participate', 'competition',
        'science', 'photo', 'hide', 'jump', 'content', 'main', 'menu', 'search',
        'wikipedia', 'encyclopedia', 'donate', 'create', 'account', 'log',
        'contents', 'format', 'analysis', 'results', 'references', 'external',
        'links', 'categories', 'navigation', 'tools', 'personal', 'site',
        'about', 'article', 'talk', 'read', 'edit', 'view', 'history', 'search',
        'what links', 'related changes', 'upload', 'special', 'pages', 'printable',
        'permanent', 'cite', 'page', 'information', 'wikidata', 'item', 'download',
        'qr code', 'pdf', 'url', 'shortened', 'disclaimers', 'privacy', 'policy',
        'cookie', 'statement', 'code', 'conduct', 'community', 'portal', 'contact',
        'current', 'events', 'recent', 'changes', 'random', 'article', 'help',
        'learn', 'edit', 'terms', 'use', 'party', 'cakes', 'cook', 'bbq', 'brawl',
        'blitz', 'usa', 'contessa', 'bash', 'baker', 'barbecue', 'addiction',
        'threat', 'wars', 'chocolate', 'chopped', 'hours', 'junior', 'live',
        'miss', 'brown', 'delicious', 'games', 'asphalt', 'court', 'detectives',
        'everyday', 'italian', 'essence', 'emil', 'food', 'detectives', 'feasting',
        'road', 'tasted', 'tasty', 'travels', 'rachael', 'ray', 'paula', 'home',
        'cooking', 'best', 'dishes', 'valerie', 'throwdown', 'bobby', 'flay',
        'tyler', 'ultimate', 'recipe', 'showdown', 'unwrapped', 'work', 'worst',
        'bakers', 'cooks', 'america', 'kitchen', 'sink', 'casino', 'halloween',
        'street', 'hook', 'big', 'bite', 'grocery', 'games', 'sugar', 'rush',
        'sweet', 'genius', 'mystery', 'diners', 'stakeout', 'restaurant', 'impossible',
        'dinner', 'drive', 'ins', 'dives', 'glutton', 'punishment', 'guilty',
        'pleasures', 'good', 'eats', 'deal', 'dave', 'lieberman', 'boil', 'water',
        'hart', 'heat', 'seekers', 'ham', 'how', 'get', 'plate', 'dweezil', 'lisa',
        'rewrapped', 'wrapped'
    ]
    
    # Show title patterns (common Food Network show naming patterns)
    show_title_patterns = [
        r'.*\s(Party|Cakes|Cook|BBQ|Brawl|Blitz|USA|Contessa|Bash|Baker|Wars|Chocolate|Chopped|Live|Brown|Games|Asphalt|Court|Detectives|Italian|Essence|Food|Ray|Cooking|Dishes|Valerie|Throwdown|Ultimate|Showdown|Unwrapped|Work|Bakers|Cooks|Kitchen|Sink|Casino|Halloween|Street|Hook|Bite|Grocery|Sugar|Rush|Genius|Mystery|Diners|Stakeout|Restaurant|Impossible|Dinner|Drive|Dives|Punishment|Pleasures|Eats|Deal|Water|Hart|Seekers|Ham|Plate)$',
        r'^(Ace|Ask|BBQ|Best|Bobby|Brunch|Cake|Chopped|Cookie|Cooking|Cupcake|Cutthroat|Delicious|Dessert|Diners|Dinner|Emeril|Essence|Everyday|Food|Girl|Giada|Glutton|Good|Guy|Halloween|Ham|Heat|How|I|Kitchen|Mystery|Paula|Rachael|Restaurant|Road|Sara|Sugar|Supermarket|Sweet|Throwdown|Top|Tyler|Ultimate|Unwrapped|Valerie|Will|Worst)',
    ]
    
    name_lower = name.lower()
    for word in noise_words:
        if word in name_lower:
            return False
    
    # Check against show title patterns
    for pattern in show_title_patterns:
        if re.match(pattern, name, re.IGNORECASE):
            return False
    
    # Should not start with common prefixes
    if name_lower.startswith(('the ', 'a ', 'an ', '$', 'http', 'www.')):
        return False
    
    # Should not end with common suffixes
    if name_lower.endswith((' show', ' series', ' tournament', ' competition', ' network', '.com', '.org')):
        return False
    
    # Should be mostly alphabetic (allow spaces, hyphens, apostrophes)
    if not re.match(r'^[A-Za-z\s\-\']+$', name):
        return False
    
    # Should have reasonable word count (1-4 words typical for names)
    words = name.split()
    if len(words) > 4:
        return False
    
    # If single word, should be at least 4 characters (to filter out initials)
    if len(words) == 1 and len(name) < 4:
        return False
    
    return True

def scrape_all_tournament_of_champions_contestants():
    """Scrape ALL Tournament of Champions contestants from Wikipedia"""
    print(f"Fetching data from {WIKIPEDIA_URL}...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    contestants = set()
    
    try:
        response = requests.get(WIKIPEDIA_URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all tables (bracket tables don't always have wikitable class)
        tables = soup.find_all('table')
        
        for table in tables:
            # Skip the infobox table (first table, has many columns)
            if 'infobox' in table.get('class', []):
                continue
            
            # Check if this table looks like a bracket/matchup table
            # Bracket tables typically have "First Round", "Quarterfinals", "Semifinals", "Final" in headers
            table_text = table.get_text().lower()
            is_bracket_table = any(term in table_text for term in ['first round', 'quarterfinal', 'semifinal', 'final', 'round 1', 'round 2'])
            
            # Also check if table has numeric scores (bracket tables have scores like "92", "89")
            has_scores = bool(re.search(r'\b\d{2,3}\b', table.get_text()))
            
            # Process bracket/matchup tables more carefully
            if is_bracket_table or has_scores:
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    for cell in cells:
                        cell_text = cell.get_text(strip=True)
                        # Skip cells that are clearly headers or scores
                        if (cell_text.isdigit() or 
                            cell_text.lower() in ['first round', 'quarterfinal', 'semifinal', 'final', 'round', '']):
                            continue
                        
                        # Look for links to chef pages
                        links = cell.find_all('a', href=True)
                        for link in links:
                            name = link.get_text(strip=True)
                            href = link.get('href', '')
                            
                            # Only process wiki links that aren't special pages
                            if (href.startswith('/wiki/') and
                                not href.startswith('/wiki/Category:') and
                                not href.startswith('/wiki/File:') and
                                not href.startswith('/wiki/Template:') and
                                not href.startswith('/wiki/Help:') and
                                not href.startswith('/wiki/Wikipedia:') and
                                not href.startswith('/wiki/Special:') and
                                not href.startswith('/wiki/User:') and
                                not href.startswith('/wiki/Talk:') and
                                not href.startswith('/wiki/Portal:')):
                                
                                if is_valid_name(name):
                                    contestants.add(name)
        
        # Also check for names in list items within season sections
        season_sections = soup.find_all(['h2', 'h3'], id=re.compile(r'Season_\d+'))
        for section in season_sections:
            # Look for lists or tables in this section
            parent = section.find_parent()
            if parent:
                # Find next sibling content until next heading
                for elem in parent.find_all_next(['ul', 'ol', 'table']):
                    # Stop at next heading
                    if elem.find_previous(['h2', 'h3']):
                        prev_heading = elem.find_previous(['h2', 'h3'])
                        if prev_heading and prev_heading != section:
                            break
                    
                    # Extract names from links
                    links = elem.find_all('a', href=True)
                    for link in links:
                        name = link.get_text(strip=True)
                        href = link.get('href', '')
                        
                        if (href.startswith('/wiki/') and
                            not href.startswith('/wiki/Category:') and
                            not href.startswith('/wiki/File:') and
                            not href.startswith('/wiki/Template:')):
                            
                            if is_valid_name(name):
                                contestants.add(name)
        
        # Normalize names and remove duplicates (handle case variations)
        normalized = {}
        for name in contestants:
            # Normalize: lowercase for comparison, but keep original capitalization
            key = name.lower().strip()
            # Prefer version with proper capitalization (first letter uppercase)
            # For specific known corrections
            if key == 'rocco dispirito':
                normalized[key] = 'Rocco DiSpirito'
            elif key not in normalized:
                normalized[key] = name
            elif name[0].isupper() and not normalized[key][0].isupper():
                normalized[key] = name
        
        # Remove "Rewrapped" if it slipped through
        normalized.pop('rewrapped', None)
        
        return sorted(list(normalized.values()))
        
    except Exception as e:
        print(f"Error scraping Wikipedia: {e}")
        import traceback
        traceback.print_exc()
        return []

def main():
    contestants = scrape_all_tournament_of_champions_contestants()
    
    if contestants:
        print(f"\nFound {len(contestants)} contestants:")
        for contestant in contestants[:50]:  # Show first 50
            print(f"  - {contestant}")
        if len(contestants) > 50:
            print(f"  ... and {len(contestants) - 50} more")
        
        # Save to JSON file
        output_file = 'src/data/tournamentOfChampionsContestants.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(contestants, f, indent=2, ensure_ascii=False)
        
        print(f"\nSaved {len(contestants)} contestants to {output_file}")
    else:
        print("No contestants found")

if __name__ == '__main__':
    main()
