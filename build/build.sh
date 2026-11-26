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
python3 collection_tools.py
python3 studio_tools.py
python3 processing_tool.py
python3 stage8_tools.py
python3 drape_tool.py
python3 apps.py
python3 tools.py
python3 journal.py
python3 celebrity.py
python3 hubs.py
python3 regions.py
python3 image_requests.py
python3 account.py
python3 admin_page.py
cp auth_src.js ../auth.js
python3 reports.py
python3 seo.py
python3 search.py && ONLY=search.html python3 seo.py

python3 tools_hub.py
# redesigned pages (landing, home, forecasts, insights, report pages); after seo.py so the old home is replaced
python3 v2/build_v2.py
python3 v2/cover_prompts.py
python3 v2/tool_cover_prompts.py
python3 v2/kid_prompts.py
# report PDFs are slower: python3 v2/pdf_v2.py all
python3 clean_urls.py
python3 season_hub.py
python3 maintenance.py
