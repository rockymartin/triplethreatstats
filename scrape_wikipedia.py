#!/usr/bin/env python3
"""
Script to scrape and convert Bobby's Triple Threat episode data from Wikipedia to CSV.
"""

import requests
from bs4 import BeautifulSoup
import csv
import re
from typing import List, Dict, Optional

WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Bobby's_Triple_Threat"


def parse_result(result_str: str) -> Dict[str, Optional[str]]:
    """
    Parse a result string like "W; 9-7" or "L; 6-8" or "T; 15-15"
    Returns dict with outcome, contestant_score, titan_score
    """
    if not result_str or result_str.strip() == '':
        return {'outcome': None, 'contestant_score': None, 'titan_score': None}
    
    # Remove extra whitespace
    result_str = result_str.strip()
    
    # Split by semicolon
    parts = result_str.split(';')
    if len(parts) != 2:
        return {'outcome': None, 'contestant_score': None, 'titan_score': None}
    
    outcome = parts[0].strip()
    score_str = parts[1].strip()
    
    # Parse score "X-Y"
    score_match = re.match(r'(\d+)-(\d+)', score_str)
    if score_match:
        contestant_score = score_match.group(1)
        titan_score = score_match.group(2)
    else:
        contestant_score = None
        titan_score = None
    
    return {
        'outcome': outcome,
        'contestant_score': contestant_score,
        'titan_score': titan_score
    }


def clean_text(text: str) -> str:
    """Remove Wikipedia links and clean text."""
    if not text:
        return ''
    
    # Remove Wikipedia link markup like [text](/wiki/link)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove standalone links
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)
    # Clean up extra whitespace
    text = ' '.join(text.split())
    
    return text.strip()


def extract_table_data(soup: BeautifulSoup) -> List[Dict]:
    """
    Extract episode data from Wikipedia tables.
    Returns list of episode dictionaries.
    """
    episodes = []
    
    # Find all tables (each season has its own table)
    tables = soup.find_all('table', class_='wikitable')
    
    season_num = 1
    for table in tables:
        # Check if this looks like an episode table (has "Contestant" header)
        headers = table.find_all('th')
        header_texts = [h.get_text().strip() for h in headers]
        
        if 'Contestant' not in header_texts:
            continue
        
        # Find header row
        header_row = table.find('tr')
        if not header_row:
            continue
        
        # Get column indices
        headers = header_row.find_all(['th', 'td'])
        header_map = {}
        for idx, header in enumerate(headers):
            text = header.get_text().strip()
            if 'Contestant' in text:
                header_map['contestant'] = idx
            elif 'Judge' in text:
                header_map['judge'] = idx
            elif 'R1' in text and 'Ingredients' in text:
                header_map['r1_ingredients'] = idx
            elif 'R1' in text and 'Titan' in text:
                header_map['r1_titan'] = idx
            elif 'R1' in text and 'Result' in text:
                header_map['r1_result'] = idx
            elif 'R2' in text and 'Ingredients' in text:
                header_map['r2_ingredients'] = idx
            elif 'R2' in text and 'Titan' in text:
                header_map['r2_titan'] = idx
            elif 'R2' in text and 'Result' in text:
                header_map['r2_result'] = idx
            elif 'R3' in text and 'Ingredients' in text:
                header_map['r3_ingredients'] = idx
            elif 'R3' in text and 'Titan' in text:
                header_map['r3_titan'] = idx
            elif 'R3' in text and 'Result' in text:
                header_map['r3_result'] = idx
            elif 'Final' in text and 'Result' in text:
                header_map['final_result'] = idx
        
        # Extract data rows
        rows = table.find_all('tr')[1:]  # Skip header row
        episode_num = 1
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) < len(header_map):
                continue
            
            # Extract data
            episode = {
                'season': season_num,
                'episode_number': episode_num,
                'contestant': clean_text(cells[header_map['contestant']].get_text()) if 'contestant' in header_map else '',
                'judge': clean_text(cells[header_map['judge']].get_text()) if 'judge' in header_map else '',
            }
            
            # Round 1
            if 'r1_ingredients' in header_map:
                episode['r1_ingredients'] = clean_text(cells[header_map['r1_ingredients']].get_text())
            if 'r1_titan' in header_map:
                episode['r1_titan'] = clean_text(cells[header_map['r1_titan']].get_text())
            if 'r1_result' in header_map:
                r1_result = parse_result(clean_text(cells[header_map['r1_result']].get_text()))
                episode['r1_outcome'] = r1_result['outcome']
                episode['r1_contestant_score'] = r1_result['contestant_score']
                episode['r1_titan_score'] = r1_result['titan_score']
            
            # Round 2
            if 'r2_ingredients' in header_map:
                episode['r2_ingredients'] = clean_text(cells[header_map['r2_ingredients']].get_text())
            if 'r2_titan' in header_map:
                episode['r2_titan'] = clean_text(cells[header_map['r2_titan']].get_text())
            if 'r2_result' in header_map:
                r2_result = parse_result(clean_text(cells[header_map['r2_result']].get_text()))
                episode['r2_outcome'] = r2_result['outcome']
                episode['r2_contestant_score'] = r2_result['contestant_score']
                episode['r2_titan_score'] = r2_result['titan_score']
            
            # Round 3
            if 'r3_ingredients' in header_map:
                episode['r3_ingredients'] = clean_text(cells[header_map['r3_ingredients']].get_text())
            if 'r3_titan' in header_map:
                episode['r3_titan'] = clean_text(cells[header_map['r3_titan']].get_text())
            if 'r3_result' in header_map:
                r3_result = parse_result(clean_text(cells[header_map['r3_result']].get_text()))
                episode['r3_outcome'] = r3_result['outcome']
                episode['r3_contestant_score'] = r3_result['contestant_score']
                episode['r3_titan_score'] = r3_result['titan_score']
            
            # Final Result
            if 'final_result' in header_map:
                final_result = parse_result(clean_text(cells[header_map['final_result']].get_text()))
                episode['final_outcome'] = final_result['outcome']
                episode['final_contestant_score'] = final_result['contestant_score']
                episode['final_titan_score'] = final_result['titan_score']
            
            # Only add if we have at least contestant data
            if episode['contestant']:
                episodes.append(episode)
                episode_num += 1
        
        season_num += 1
    
    return episodes


def write_csv(episodes: List[Dict], filename: str = 'episodes.csv'):
    """Write episodes data to CSV file."""
    if not episodes:
        print("No episodes to write!")
        return
    
    # Get all possible keys
    all_keys = set()
    for episode in episodes:
        all_keys.update(episode.keys())
    
    # Define column order
    column_order = [
        'season', 'episode_number', 'contestant', 'judge',
        'r1_ingredients', 'r1_titan', 'r1_outcome', 'r1_contestant_score', 'r1_titan_score',
        'r2_ingredients', 'r2_titan', 'r2_outcome', 'r2_contestant_score', 'r2_titan_score',
        'r3_ingredients', 'r3_titan', 'r3_outcome', 'r3_contestant_score', 'r3_titan_score',
        'final_outcome', 'final_contestant_score', 'final_titan_score'
    ]
    
    # Ensure all columns exist
    for key in column_order:
        if key not in all_keys:
            all_keys.add(key)
    
    # Write CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=column_order, extrasaction='ignore')
        writer.writeheader()
        
        for episode in episodes:
            # Fill in missing keys with empty strings
            row = {key: episode.get(key, '') for key in column_order}
            writer.writerow(row)
    
    print(f"Successfully wrote {len(episodes)} episodes to {filename}")


def main():
    """Main function to scrape Wikipedia and create CSV."""
    print(f"Fetching data from {WIKIPEDIA_URL}...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(WIKIPEDIA_URL, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        print("Extracting episode data...")
        episodes = extract_table_data(soup)
        
        print(f"Found {len(episodes)} episodes")
        
        if episodes:
            print("Writing to CSV...")
            write_csv(episodes, 'episodes.csv')
            print("Done!")
        else:
            print("No episodes found. Check the Wikipedia page structure.")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()

