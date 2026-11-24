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

## Built on the site (corrected 24 Nov 2026)

Forecasts > Season > Audience > Forecast section > Named report or theme > Related tool
e.g. Forecasts > SS27 > Men > Colours > "SS27 Men's Season Palette" > Colour Palette Builder

- Audiences: Men, Women, Boys, Girls, Toddler Boys, Toddler Girls. `/{season}-kids` is a landing page that helps people choose; it has no reports of its own.
- Sections per audience: Themes, Colour Direction, Silhouette Direction, Fabric Direction, Trim Direction, Styling Direction,
  Couture Direction (kids: Couture and Occasion Direction), Business Strategy, Innovation Outlook. Page title pattern: "SS27 Men's Colour Direction".
- Placeholders become named reports, e.g. "SS27 Men's Woven Silhouette Direction", "SS27 Men's Trim Innovation Outlook".
- Themes are named stories per season and audience: women from the researched season themes (seasons.json/themes.json),
  men and kids from `build/audience_themes.py`. Each theme page has its own colours, silhouettes, fabrics, trims and
  product recommendations, and links to the same season-audience colour, fabric, silhouette and trim reports.
- Every named report and theme: web page + Download PDF (browser print, A4 landscape, signed-in members).
- Every section and report lists its related tools.
- Send to tools: findings go to a Board, the Trend to Style brief or the Collection Planner (localStorage `fc-forecast-inbox`,
  read by `tools/inbox.js`). Each finding keeps season + audience + report/theme title + page link.
- Generator: `build/v2/tree.py`; kidswear pieces: `build/kids_data.py`. Pages from the earlier structure redirect to the nearest current page.
