#!/usr/bin/env python3
"""
Convert episodes.csv to episodes.json for the React app.
"""

import csv
import json
import os

def convert_csv_to_json():
    csv_file = 'episodes.csv'
    json_file = 'src/data/episodes.json'
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(json_file), exist_ok=True)
    
    # Read CSV and convert to JSON
    data = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    
    # Write JSON
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"Successfully converted {len(data)} episodes from {csv_file} to {json_file}")

if __name__ == '__main__':
    convert_csv_to_json()

