# Forecast library migration, Phase 1 (25 November 2026)

New hierarchy: **Forecasts → Season → Audience → Category → Subsection → Report or theme**

| Level | Address | Example |
|---|---|---|
| Forecasts index | `/forecasts/` | Featured year (2027) first, then later seasons, then earlier seasons; library search with season, audience and category filters |
| Season overview | `/forecasts/{season}/` | `/forecasts/ss27/` |
| Season and audience | `/forecasts/{season}/{audience}/` | `/forecasts/ss27/men/` |
| Category | `/forecasts/{season}/{audience}/{category}/` | `/forecasts/ss27/men/colours/` |
| Report (audience) | `/forecasts/{season}/{audience}/{category}/{report}/` | `/forecasts/ss27/women/silhouettes/dresses/` |
| Shared research (several audiences) | `/forecasts/{season}/{category}/{report}/` | `/forecasts/ss27/colours/colour-forecast/` |

Seasons, featured year, audiences and categories are set in `content/settings.json` (editable in the content manager at `/cms/`).

## Files

- `inventory.csv`: every forecast URL with its action (moved, kept in place and linked, redirected), new URL, season, audience, category, subsection and content ID.
- `pdfs.csv`: every PDF, its size, first commit date and the library pages that link to it.
- `images.csv`: every image used on library pages, with the provenance on record and a flag.
- `redirects.json`: the redirects written by the build. An old address redirects only after its new page passed the check.
- `checks.md`: results of `build/check_migration.py`.

## Results

- 283 forecast pages moved (season reports, department and category chapters, theme pages, colour pages, colour stories). For every one, the report text on the new page is identical to the last published version of the old page (git HEAD before the move), apart from link addresses and the build date. Each old address now redirects to the new page, keeping any `#section` anchor.
- 44 pages kept at their own address and linked from the hierarchy: complete season editions (`/aw26`, `/ss27`, `/aw27`, `/ss28`, `/aw28`), Resort 2027, Pre-Fall 2027, India regional editions, couture and innovation articles, runway fabric reports, regional selling guides and the celebrity style tracker.
- 120 PDFs kept at their addresses and linked from the moved reports; all links resolve.
- 684 library pages: no broken internal links, no missing images.
- Every moved page shows season, audience, category and subsection, first published and last updated dates, version, market, content ID and revision history (`content/versions.json`). The Download PDF button prints the current version; the print footer carries the address, content ID and version.
- Findings sent to Board, Style Brief and Collection Planner now carry the content ID and version.

## Flags for the owner

1. **Pages built automatically on 24 and 25 November 2026** (the first forecast tree for seven audiences): 2,341 addresses. They were assembled from the shared detail data, not separate research, so they are not presented as audience reports. Each now redirects to its category page. The data they used stays in the shared reports. The draft kidswear pieces (`build/kids_data.py`) and draft theme names for men and kids (`build/audience_themes.py`) are kept as drafts and are not published; only the SS27 and AW26 menswear themes have cited sources so far.
2. **Footwear**: the brief has no footwear category. Footwear reports are placed under Silhouettes → Footwear (heels and flats, boots → Women; men's shoes → Men; sneakers and the footwear season report → shared with Men and Women).
3. **Shared research**: season themes, fabrics, trims, knitwear and footwear reports cover women's and men's evidence, so they are linked from Women and Men only. The colour forecast, colour stories and footwear colour are linked from all seven audiences. Kidswear colour sits under Kids and is linked from Boys, Girls, Toddler Boys and Toddler Girls. Kids has no audience-specific report beyond kidswear colour yet.
4. **Complete season editions** (`/ss27` and the others) combine every department on one page. They are kept whole at their addresses and linked from each season overview, rather than split, so nothing is lost.
5. **Images**: all 1,649 images on library pages have a record of who supplied them or when they were added, but none records the generating tool or licence terms. Captions and credits are unchanged until you confirm these.
6. **Earlier PDF editions**: the 120 PDFs were produced before the move and are kept as earlier editions; the Download PDF button gives the current version.
7. **Content manager**: `/cms/` is in place. To switch it on, create a GitHub OAuth app and deploy the `sveltia-cms-auth` worker on Cloudflare, then add the worker address as `base_url` in `cms/config.yml`. Only accounts with write access to the repository can save. Secrets go in the Cloudflare worker settings, never in the repository.
8. **Drafts are visible in the repository**: the repository is public, so draft reports in `content/reports/` can be read on GitHub even though the website does not publish them (the `content` folder is excluded from the site). Making the repository private closes this.
