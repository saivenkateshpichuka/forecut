# Forecut build kit

Everything needed to rebuild the Forecut website. The published pages are generated from these files.

## Live pages (keep these URLs)
- Homepage: https://claude.ai/artifact/NqT7n8hWTei6RbndhLrHe6 (source: forecut_home.txt, hand-maintained HTML)
- Season pages: see urls.json (aw26, ss27, aw27, ss28, aw28)
- Image prompt report: https://claude.ai/artifact/9ECYybGy3EDw5fFcWsxpY1
- This build kit: https://claude.ai/artifact/PkA51enYNx2HGHt5S4xuXH

## Files
- details.json: source of truth. `order` = department/category order; `model["Dept|Category"]` = list of details
  {name, area, note, life}. `life` has one character per season in seasons.json order:
  e = emerging, r = rising, p = peaking, f = fading, - = not shown that season.
- seasons.json: season list and per-season meta (title, stage, window, research/projection basis, intro,
  themes [title, text, pattern, bg, fg, key detail name, keywords], palette, colour of the year, sources).
- themes.json: theme deep-dives keyed "season|Theme title" (story, why, brands, src, kw, prices, cost, actions).
  Only name brands that a published source names. Prices are labelled as Forecut estimates.
- subcats.json: detail area -> subcategory mapping (garment and footwear).
- flats.js: sketch engine + SPEC (one sketch spec per detail name). Every detail name needs a SPEC entry.
- images.json: list of image slugs that exist (e.g. "raglan-sleeve-coats"). Images live at img/<slug>.webp
  as supporting files on EACH season artifact. Details without an image show their sketch.
- season_tpl.txt, prompt_tpl.txt: page templates. gen_seasons.py, gen_prompts.py: generators.
- check.py: validation (lifecycle lengths, 25+ details per category per season, sketch specs, no duplicates).
- rollover.py: drops the oldest season and appends a new one.
- build.sh: check + build all pages. Usage: `sh build.sh "November 2026"`

## Rules
- Every category must have at least 25 details in every season (check.py enforces this).
- Write everything in your own words; never copy article text or use brand photos.
- Seasons with runway coverage: basis "research". Seasons without: basis "projection"; never invent brands.
- Detail names must be unique across the whole site (names are also image file names).

## Monthly update (scheduled task)
1. Download every kit file listed in "Files" with the Artifact tool (read with `path`) into one folder.
2. `sh build.sh` once to confirm the kit reproduces the live pages.
3. Research recent runway, fashion-week, trade and colour coverage for each season in seasons.json.
4. Edit the data:
   - Update `life` statuses in details.json where evidence supports a change.
   - Add new details where coverage shows new ones (append to the right category, with area, note and a full
     lifecycle string). Add a SPEC entry for each new name in flats.js (reuse existing options; see other specs).
   - Write the list of new detail names to new_this_month.json (used to flag "New this month" in the prompt report).
   - Update themes/palette/colour of the year in seasons.json and themes.json if new information exists.
     Pantone announces its colour of the year each December; add it to the matching seasons.
5. Season rollover: when the "In stores now" season has ended (AW ends late January, SS ends late July):
   run `python3 rollover.py <code> "<title>" "<window>"`, fill in the TODO fields, themes, colour, statuses,
   and theme deep-dives for the new season; shift the stage labels (In stores now / Next season forecast /
   Early outlook / Long-range outlook); publish the new season as a NEW artifact (declare capabilities
   {"downloads": true}), add its URL to urls.json, and keep the old page live as an archive.
6. `sh build.sh "<Month Year>"`, then render a contact sheet of every new sketch and fix any that look wrong.
7. Publish each forecut-<season>.html to its URL in urls.json (Artifact publish with `url`), publish
   forecut-prompts.html to the prompt report URL, and update the homepage Seasons section in forecut_home.txt
   (tab items, tracker, report button counts) and publish it to the homepage URL.
8. Republish this kit with the updated files so next month starts from them.
9. Send the owner a summary: what changed (status moves, new and removed details, season rollover), the number
   of new image prompts, and a Sources list.

## Adding images from the owner (in a chat)
1. Unzip, match each file name to a detail slug (lowercase, non-letters become "-"). List unmatched files.
2. Convert to WebP, 800x800, quality ~80. Publish to every season artifact as supporting files img/<slug>.webp
   (upload once, then copy to the other artifacts with files: {"img/x.webp": {"artifact": "<url>", "path": "img/x.webp"}}).
3. Add the slugs to images.json, rebuild, publish all season pages and republish this kit.


## Descriptions and download cards (added Oct 2026)
- desc.py writes the full description for every detail (overview, design notes, fabric & trims, where to use it). New details get one automatically from their name, note, area and category.
- To hand-write or correct one, add `"desc": {"o": "...", "d": ["...","..."], "f": "...", "u": "..."}` to that detail in details.json (any key is optional).
- site.json holds the website name, tagline and address printed in the footer of every downloaded card. Change `url` when a domain is bought, then rebuild and republish.
- Sketch style: clean technical flats (bold outline, flat fill, dashed topstitch, soft fold lines). Keep new SPEC entries in this style.

## India forecast (added Oct 2026)
- India data lives in india_data.py: windows (CODES), themes, key colours, categories and ~100 details with life strings for Festive 26 / Summer 27 / Festive 27.
- gen_india.py builds ../india.html (STATIC=..) from season_tpl.txt, so it shares the viewer, descriptions, download cards and photo support. Details without a sketch show a "photo coming soon" pattern until a photo is uploaded.
- india_prompts.py writes ../india-image-prompts.csv (same file-name rules as the main report). Photos go in images/ like the rest.
- Homepage source is forecut_home.txt; build_home.py writes ../index.html. GitHub Pages is the live site (forecut.in); Claude artifacts are backups.
- Homepage visual blocks (season cards, region cards, featured construction detail, colour palettes) are in home_blocks.py. Season pages accept filters in the link (ss27.html?dept=womenswear&st=r&q=collar) and region pages accept #s-<season> (region-africa.html#s-aw27); the homepage forecast explorer uses both.
- Site search: search.py writes search.html and search-index.json from details.json, india_data.py and every built page (title + meta description), so it runs after seo.py: `python3 search.py && ONLY=search.html python3 seo.py`. Methodology page (method.html) is in legal.py. seo.py swaps every <img> to the photo-only file (<slug>-photo.webp) when one exists: the owner does not want flat sketches shown on pages; they stay only behind the "Flat sketch" button in the detail viewer.
- Each month also refresh India: move lifecycles on, add new Indian runway/retail/festive signals, keep 10+ details per India category.

## SEO (added Oct 2026)
- seo.py adds titles, meta descriptions, canonical URLs, Open Graph/Twitter tags, JSON-LD (Organization, WebSite, WebPage + breadcrumbs) to every page, and writes ../sitemap.xml, ../robots.txt and ../favicon.svg. build.sh runs it last; always run it after rebuilding pages.
- Google Search Console and Bing Webmaster Tools are verified for forecut.in (DNS TXT on GoDaddy). Sitemap: https://forecut.in/sitemap.xml

## Season-specific photos (added Oct 2026)
- A detail can have a different photo in each season. File name rules: first season = <slug>.webp (from the main prompt report); later seasons = <slug>-<season>.webp (e.g. cape-lehengas-ss27.webp). Both live in img/ and are listed in images.json.
- gen_seasons.py uses <slug>-<season> if present, else the plain photo only in the detail's first season, else the sketch.
- season_prompts.py writes ../season-prompts/<season>-image-prompts.csv with season colours, fabric weight and camera angle so photos differ by season; rows already uploaded are marked Done.

## Two-panel detail images (photo | flat sketch)
`split_panels.py` runs after `process_images.py` in the image workflow. For each uploaded detail image that has a
white flat-sketch panel on the right, it writes `img/<slug>-photo.webp` (photo only) and `img/<slug>-f1..fN.webp`
(each flat drawing separately, e.g. front and back), and records them in `panels.json`. The detail viewer shows the
photo alone under "Photo" and the separate drawings under "Flat sketch". Cards keep the combined image.

## Image rule (articles, hubs, Journal)
1. **Real, free-licensed photo first.** Use only photos you may legally reuse: Unsplash, Pexels (free commercial use),
   Wikimedia Commons (follow the licence, credit required) or The Met Open Access (CC0). Never copy runway, campaign,
   celebrity or news-agency photos without written permission.
2. **If no good real photo exists, generate one** that matches the article (realistic, modest, no logos, no real people).
3. Upload to `images/` with the exact file name from `image-requests.csv`.
4. For every real photo, add a row to `image-credits.csv` (File name, Credit, Source URL, Licence). The credit appears
   under the image on the site.
`image-requests.csv` is rebuilt on every build and lists each needed image with search links and an AI fallback prompt.
New Journal articles may set `'hero_new': 'art-<slug>'`, `'img_kw': '<search words>'` and `'img_prompt': '<AI prompt>'`.
The existing `'hero'` image is shown until `art-<slug>` is uploaded; the request appears in `image-requests.csv`.

### India season research

`india_research.json` holds the dated source register, four independent seasonal
editorials, original palettes, category actions and validation checkpoints.
`india_seasons.py` adds future-only development ideas and explicit lifecycle
reassessments while preserving Festive 26. These are editorial priorities, not
measured sales; 2028 is explicitly a conditional scenario.

Build only this page with Python 3.12+ (the generator uses modern f-strings):

```sh
STATIC=.. python3 gen_india.py
ONLY=india.html python3 seo.py
python3 test_india.py
python3 keep_check.py
```

`ONLY` restricts SEO processing to named, comma-separated pages and skips
shared sitemap/assets. The normal complete build remains unchanged. Node.js
is needed by the India inline-script validation. Do not publish local member
preview fixtures; they only simulate an authenticated UI during testing.

### Complete India PDF downloads

`india_pdfs.py` produces one illustrated report per season in `output/pdf/`,
including every active detail, themed strategy, palettes, category guidance,
calendar and sources. `india_pdf_manifest.json` records completeness, page
counts, size and cover imagery. `india_downloads.py` adds the corresponding
buttons while retaining the existing member gates for later seasons.

After changing India content, run from `build/` with Python 3.12+:

```sh
STATIC=.. python3 gen_india.py
python3 india_pdfs.py
STATIC=.. python3 gen_india.py
ONLY=india.html python3 seo.py
python3 test_india.py
```

PDF builds need reportlab, Pillow and pypdf. Set `FORECUT_PDF_FONTS` to a
folder containing LiberationSans-Regular.ttf, LiberationSans-Bold.ttf and
LiberationSans-Italic.ttf when outside the bundled workspace runtime.
Seasonal concept-art assets live in `img/india-season-art/`; their AI origin
is disclosed in both the website and PDFs. Keep the existing reference
images when adding or refreshing seasonal art.
