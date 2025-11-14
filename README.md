# Triple Threat Stats

A fan website and data analysis project for the competitive cooking show **Bobby's Triple Threat**.

## Overview

This repository contains a React web application for analyzing episode performance from the Food Network show "Bobby's Triple Threat", where competing chefs face off against Bobby Flay's team of Titans (Brooke Williamson, Michael Voltaggio, and Tiffany Derry/Ayesha Nurdjaja).

## Features

- **Overall Statistics**: Win/loss rates, total episodes, and contestant vs titan performance
- **Titan Performance Analysis**: 
  - Win rate by titan
  - Round appearance frequency
  - Margin of victory/loss (normalized to 10-point scale)
  - Round-by-round win rates
  - Detailed statistics table
- **Titan Detail Pages**: Click any Titan name to view their personal dashboard with:
  - Overall performance metrics
  - Round-by-round breakdowns
  - Complete episode history with contestant and judge information
  - Links to Wikipedia pages for contestants and judges
- **Season Filtering**: Filter statistics by season
- **Contestant Classification**: Shows other appearances (Top Chef, Tournament of Champions, Iron Chef America, Beat Bobby Flay)
- **Responsive Design**: Fully optimized for desktop and mobile devices

## Data Source

Episode data is sourced from the Wikipedia page: https://en.wikipedia.org/wiki/Bobby's_Triple_Threat

## Project Structure

- `src/` - React application source code
  - `components/` - React components (Overview, TitanStats, TitanDetail, Filters, StatCard)
  - `utils/` - Utility functions for calculating statistics and classifying contestants
  - `data/` - JSON data files (episodes and contestant lists)
- `scripts/` - Python scripts for data management
  - `scrape_wikipedia.py` - Scrape and convert Wikipedia episode tables to CSV
  - `scrape_all_top_chef.py` - Scrape Top Chef contestant list
  - `scrape_all_iron_chef.py` - Scrape Iron Chef America contestant list
  - `scrape_tournament_of_champions.py` - Scrape Tournament of Champions contestant list
  - `scrape_beat_bobby_flay.py` - Scrape Beat Bobby Flay contestant list
  - `verify_contestants.py` - Verify contestant classifications
- `episodes.csv` - Structured CSV file containing all episode data
- `Dockerfile` - Docker configuration for Cloud Run deployment
- `convert_csv_to_json.py` - Convert CSV to JSON format
- `validate_data.py` - Script to validate CSV data integrity

## Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.7+ (for data scraping)

### Install Dependencies

1. Install Node.js dependencies:
```bash
npm install
```

2. (Optional) Install Python dependencies for data scraping:
```bash
pip install -r requirements.txt
```

### Generate Data

1. Run the scraper to generate/update the CSV:
```bash
python scrape_wikipedia.py
```

2. Convert CSV to JSON (automatically done by the scraper, or manually):
```bash
python3 -c "import csv, json; data = []; f = open('episodes.csv', 'r', encoding='utf-8'); reader = csv.DictReader(f); [data.append(row) for row in reader]; f.close(); json.dump(data, open('src/data/episodes.json', 'w'), indent=2)"
```

### Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173 (Vite default port)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to Google Cloud Run

### Prerequisites

1. Install Google Cloud SDK:
   ```bash
   gcloud --version
   ```

2. Authenticate:
   ```bash
   gcloud auth login
   gcloud config set project triple-threat-stats
   ```

3. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

### Deploy

Deploy directly to Cloud Run (builds and deploys in one command):

```bash
gcloud run deploy triplethreatstats \
  --source . \
  --platform managed \
  --region us-central1 \
  --project triple-threat-stats \
  --allow-unauthenticated \
  --port 8080
```

The app will be available at the URL provided after deployment completes.

## CSV Structure

The CSV file contains one row per episode with the following columns:

- `season` - Season number
- `episode_number` - Episode number within season
- `contestant` - Name of competing chef
- `judge` - Name of judge for the episode
- `r1_ingredients`, `r1_titan`, `r1_outcome`, `r1_contestant_score`, `r1_titan_score` - Round 1 data
- `r2_ingredients`, `r2_titan`, `r2_outcome`, `r2_contestant_score`, `r2_titan_score` - Round 2 data
- `r3_ingredients`, `r3_titan`, `r3_outcome`, `r3_contestant_score`, `r3_titan_score` - Round 3 data
- `final_outcome`, `final_contestant_score`, `final_titan_score` - Final results

## Scoring System

- Round 1 & 2: Each worth 10 points
- Round 3: Worth 20 points
- Final Score: Sum of all three rounds

## Analysis Features

The web application provides:

- **Win Rate Analysis**: Overall and round-by-round win rates for each titan
- **Round Frequency**: How often each titan appears in each round
- **Margin of Victory**: Average margins when titans win or lose
- **Performance Trends**: Visual charts showing titan performance patterns

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Google Cloud Run** - Hosting platform
- **Docker** - Containerization
- **Nginx** - Web server for production
- **Python** - Data scraping and processing

## License

ISC
