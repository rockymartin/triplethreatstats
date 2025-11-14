#!/usr/bin/env python3
"""
Script to verify which contestants from episodes.json appear in the comprehensive lists
"""

import json
import os

def load_json_file(filepath):
    """Load a JSON file"""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

def normalize_name(name):
    """Normalize name for comparison"""
    if not name:
        return ""
    # Remove extra spaces, convert to lowercase
    return " ".join(name.split()).lower()

def fuzzy_match(name1, name2):
    """Check if two names match (fuzzy matching)"""
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    # Exact match
    if n1 == n2:
        return True
    
    # Check if one contains the other (for nicknames/variations)
    if n1 in n2 or n2 in n1:
        return True
    
    # Check if last names match
    parts1 = n1.split()
    parts2 = n2.split()
    if len(parts1) > 0 and len(parts2) > 0:
        if parts1[-1] == parts2[-1]:  # Last name matches
            return True
    
    return False

def find_matches(episode_contestants, list_contestants):
    """Find matches between episode contestants and a list"""
    matches = []
    unmatched = []
    
    for ep_contestant in episode_contestants:
        found = False
        for list_contestant in list_contestants:
            if fuzzy_match(ep_contestant, list_contestant):
                matches.append({
                    'episode_name': ep_contestant,
                    'list_name': list_contestant,
                    'exact_match': normalize_name(ep_contestant) == normalize_name(list_contestant)
                })
                found = True
                break
        
        if not found:
            unmatched.append(ep_contestant)
    
    return matches, unmatched

def main():
    # Load episodes data
    episodes_file = 'src/data/episodes.json'
    episodes = load_json_file(episodes_file)
    
    if not episodes:
        print(f"Error: Could not load {episodes_file}")
        return
    
    # Get unique contestants from episodes
    episode_contestants = sorted(set([e['contestant'] for e in episodes]))
    
    print(f"=== Contestants in episodes data ===")
    print(f"Total: {len(episode_contestants)}")
    print()
    
    # Load comprehensive lists
    top_chef_file = 'src/data/topChefContestants.json'
    iron_chef_file = 'src/data/ironChefAmericaContestants.json'
    toc_file = 'src/data/tournamentOfChampionsContestants.json'
    beat_bobby_flay_file = 'src/data/beatBobbyFlayContestants.json'
    
    top_chef_contestants = load_json_file(top_chef_file)
    iron_chef_contestants = load_json_file(iron_chef_file)
    toc_contestants = load_json_file(toc_file)
    beat_bobby_flay_contestants = load_json_file(beat_bobby_flay_file)
    
    print(f"=== Comprehensive Lists ===")
    print(f"Top Chef: {len(top_chef_contestants)} contestants")
    print(f"Iron Chef America: {len(iron_chef_contestants)} contestants")
    print(f"Tournament of Champions: {len(toc_contestants)} contestants")
    print(f"Beat Bobby Flay: {len(beat_bobby_flay_contestants)} contestants")
    print()
    
    # Find matches
    print("=== Top Chef Matches ===")
    top_chef_matches, top_chef_unmatched = find_matches(episode_contestants, top_chef_contestants)
    print(f"Matches: {len(top_chef_matches)}")
    for match in top_chef_matches:
        match_type = "EXACT" if match['exact_match'] else "FUZZY"
        print(f"  {match_type}: '{match['episode_name']}' -> '{match['list_name']}'")
    print(f"Unmatched: {len(top_chef_unmatched)}")
    if top_chef_unmatched:
        print("  " + ", ".join(top_chef_unmatched))
    print()
    
    print("=== Iron Chef America Matches ===")
    iron_chef_matches, iron_chef_unmatched = find_matches(episode_contestants, iron_chef_contestants)
    print(f"Matches: {len(iron_chef_matches)}")
    for match in iron_chef_matches:
        match_type = "EXACT" if match['exact_match'] else "FUZZY"
        print(f"  {match_type}: '{match['episode_name']}' -> '{match['list_name']}'")
    print(f"Unmatched: {len(iron_chef_unmatched)}")
    if iron_chef_unmatched:
        print("  " + ", ".join(iron_chef_unmatched))
    print()
    
    print("=== Tournament of Champions Matches ===")
    toc_matches, toc_unmatched = find_matches(episode_contestants, toc_contestants)
    print(f"Matches: {len(toc_matches)}")
    for match in toc_matches:
        match_type = "EXACT" if match['exact_match'] else "FUZZY"
        print(f"  {match_type}: '{match['episode_name']}' -> '{match['list_name']}'")
    print(f"Unmatched: {len(toc_unmatched)}")
    if toc_unmatched:
        print("  " + ", ".join(toc_unmatched))
    print()
    
    print("=== Beat Bobby Flay Matches ===")
    bbf_matches, bbf_unmatched = find_matches(episode_contestants, beat_bobby_flay_contestants)
    print(f"Matches: {len(bbf_matches)}")
    for match in bbf_matches:
        match_type = "EXACT" if match['exact_match'] else "FUZZY"
        print(f"  {match_type}: '{match['episode_name']}' -> '{match['list_name']}'")
    print(f"Unmatched: {len(bbf_unmatched)}")
    if bbf_unmatched:
        print("  " + ", ".join(bbf_unmatched))
    print()
    
    # Generate updated list for contestantClassification.js
    print("=== Suggested Updates ===")
    top_chef_names = [m['episode_name'] for m in top_chef_matches]
    iron_chef_names = [m['episode_name'] for m in iron_chef_matches]
    toc_names = [m['episode_name'] for m in toc_matches]
    bbf_names = [m['episode_name'] for m in bbf_matches]
    
    print(f"\nTOP_CHEF_CONTESTANTS = {sorted(set(top_chef_names))}")
    print(f"\nIRON_CHEF_AMERICA_CONTESTANTS = {sorted(set(iron_chef_names))}")
    print(f"\nTOURNAMENT_OF_CHAMPIONS_CONTESTANTS = {sorted(set(toc_names))}")
    print(f"\nBEAT_BOBBY_FLAY_CONTESTANTS = {sorted(set(bbf_names))}")

if __name__ == '__main__':
    main()

