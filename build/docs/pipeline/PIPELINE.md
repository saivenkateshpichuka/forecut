# Forecut final pipeline (approved by Sai, 24 November 2026)

Source: forecut-final-pipeline-2026-11-24.pdf / .png in this folder. This is the target structure for forecut.in.

Legend: green box = detailed separate page. Red box = detailed separate page **and** PDF.
Black line = direction link. Pink line = connects to another tool. Yellow line = imports details from another tool.

## 1. Two homes
- **Home page (public)**: shown only to visitors who have not signed up or have signed out. Sections: What we do, Services, About, Resources.
- **User home**: only for signed-in users. Sections: Forecasts, Insights, Tools, PLM (upcoming).

## 2. Forecasts
All seasonal forecasts, covering the current season and up to three years ahead.

Audiences (each a detailed page): mens, womens, kids, toddler boys, toddler girls, boys, girls.

Every audience has these topics (green = page; red = page + PDF):
| Topic | Reports (page + PDF) |
|---|---|
| Season themes | theme 1, theme 2, theme 3, theme 4 |
| Colours | season colours, theme 1, theme 2, theme 3, season stories |
| Silhouettes | woven: report 1, report 2 · knit: report 1, report 2 |
| Fabrics | woven: report 1, report 2 · knit: report 1, report 2 |
| Trims | trending trims, stories, market strategy, innovation (each report 1, report 2) |
| Styling | celebrity, casual wear, formal wear, party wear |
| Couture | report 1, report 2 |
| Business strategy | report 1, report 2 |
| Innovations | report 1, report 2 |

## 3. Insights
Up-to-date reports, journals, magazines, market data, brands' market updates, market news, brand news.

## 4. Tools (each a detailed page)
Collection Planner · Trend to Style Brief (Boards, Style brief) · Style Tracker · Colour Palette Builder · Textile Calculator ·
Textile Processing Studio (Dye recipe and batch cost, Colour blend, Processing route, Lab dips) · Fabric and Trims Library ·
Garment Studio (Draft, Edit pieces, 3D) · Size Chart Builder · Embroidery and Print Cost · Tech Pack Builder ·
Fit and QC Studio (Fit sessions and QC, 3D vs real sample, coming soon) · Price and Margin Calculator · Break-even Calculator ·
Production Calendar · Care Label Generator · Product Description Writer · Export Market Checker.

Connections:
- Pink (connect to tools): Style brief → Garment Studio; Style brief → Tech Pack Builder.
- Yellow (import details): Garment Studio → Tech Pack Builder, Price and Margin Calculator, Break-even Calculator; Tech Pack Builder → Price and Margin Calculator.

## 5. PLM (upcoming)

## Built on the site (24 Nov 2026)

- Forecast tree: `/{season}-{audience}` hub, `/{season}-{audience}-{topic}` topic page, and a report page per pipeline leaf,
  for all five seasons and the seven audiences (mens, womens, kids, toddler-boys, toddler-girls, boys, girls).
  Generator: `build/v2/tree.py`, called from `build/v2/build_v2.py`.
- Footwear sits inside each audience (hub block, styling looks, colour pages).
- Kidswear data: `build/kids_data.py` (pieces tagged by audience, plus kids versions of the season themes). Safety notes on kids pages.
- Every report page has a Download PDF button: the browser prints the page to A4 landscape (signed-in members only).
- Kids thumbnails: `kids-thumbnail-prompts.csv`; save pictures in `images/` as `kid-<slug>.png`.
- User home is private (signed-out visitors go to the public home). PLM page is "coming soon".
- Insights filters: Reports, Journal, Magazine, Market data, Brand updates, Market news, Brand news.
- Tools page shows sub-features and the tool connections (style brief share; import from my tools).
