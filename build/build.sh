#!/bin/sh
# Rebuild every Forecut page from the data files. Run from this folder.
set -e
python3 check.py
python3 keep_check.py
python3 gen_seasons.py
python3 gen_prompts.py "${1:-$(date +'%B %Y')}"
echo "Built: forecut-<season>.html for each season and forecut-prompts.html"

# GitHub Pages site (run from build/): season pages, India page, homepage, India image prompts
STATIC=.. python3 gen_seasons.py
STATIC=.. python3 gen_india.py
python3 build_home.py
python3 india_prompts.py

# SEO tags, sitemap, robots (run last)
python3 season_prompts.py
python3 legal.py
python3 journal.py
python3 hubs.py
python3 regions.py
python3 image_requests.py
python3 account.py
cp auth_src.js ../auth.js
python3 reports.py
python3 seo.py
