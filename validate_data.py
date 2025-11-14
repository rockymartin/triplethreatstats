#!/usr/bin/env python3
"""
Simple script to validate the episode data CSV.
"""

import csv

def validate_scores():
    """Validate that round scores add up to final scores."""
    with open('episodes.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        matches = 0
        mismatches = 0
        
        for row in reader:
            try:
                r1 = int(row['r1_contestant_score']) if row['r1_contestant_score'] else 0
                r2 = int(row['r2_contestant_score']) if row['r2_contestant_score'] else 0
                r3 = int(row['r3_contestant_score']) if row['r3_contestant_score'] else 0
                final = int(row['final_contestant_score']) if row['final_contestant_score'] else 0
                
                calculated = r1 + r2 + r3
                
                if calculated == final:
                    matches += 1
                else:
                    mismatches += 1
                    print(f"Mismatch - Season {row['season']}, Episode {row['episode_number']}: {row['contestant']}")
                    print(f"  R1: {r1}, R2: {r2}, R3: {r3}, Sum: {calculated}, Final: {final}")
            except ValueError as e:
                print(f"Error parsing row: {e}")
                mismatches += 1
        
        total = matches + mismatches
        print(f"\nValidation Results:")
        print(f"  Total episodes: {total}")
        print(f"  Matching scores: {matches}")
        print(f"  Mismatches: {mismatches}")
        
        if mismatches == 0:
            print("  ✓ All scores validated successfully!")

if __name__ == '__main__':
    validate_scores()

