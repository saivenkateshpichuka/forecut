#!/bin/sh
# Rebuild every Forecut page from the data files. Run from this folder.
set -e
python3 check.py
python3 gen_seasons.py
python3 gen_prompts.py "${1:-$(date +'%B %Y')}"
echo "Built: forecut-<season>.html for each season and forecut-prompts.html"

# GitHub Pages site (run from build/): season pages, India page, homepage, India image prompts
STATIC=.. python3 gen_seasons.py
STATIC=.. python3 gen_india.py
python3 build_home.py
python3 india_prompts.py
