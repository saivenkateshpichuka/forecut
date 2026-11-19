"""Responsive, labelled original cover art for the Southeast Asia SS27 guide."""
import re
SLUG = "southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide"
HERO = "<figure class=\"jhero\" style=\"aspect-ratio:auto;background:none;overflow:visible\"><img src=\"img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide.webp\" srcset=\"img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide-640.webp 640w, img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide-960.webp 960w, img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide.webp 1672w\" sizes=\"(max-width: 892px) calc(100vw - 32px), 860px\" alt=\"AI-generated editorial image of Southeast Asian fashion concepts: navy modest wear with a pleated skirt, a red mandarin-collar dress, and cream linen tailoring with a woven sash\" width=\"1672\" height=\"941\" decoding=\"async\" fetchpriority=\"high\" style=\"height:auto;object-fit:contain;border-radius:10px\"><figcaption style=\"font:13px/1.6 'DM Sans',sans-serif;color:var(--muted);margin-top:8px\">AI-generated editorial image · Original SS27 fashion concepts for Southeast Asia, not a photograph of Jakarta Fashion Week or a designer collection.</figcaption></figure>"
CARD = "<div class=\"ph\"><img src=\"img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide-640.webp\" srcset=\"img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide-640.webp 640w, img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide-960.webp 960w, img/art-southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide.webp 1672w\" sizes=\"(max-width: 600px) calc(100vw - 32px), (max-width: 892px) 50vw, 280px\" alt=\"AI-generated editorial image of Southeast Asian fashion concepts: navy modest wear with a pleated skirt, a red mandarin-collar dress, and cream linen tailoring with a woven sash\" loading=\"lazy\" decoding=\"async\" width=\"1672\" height=\"941\"></div><small style=\"color:var(--muted);font-weight:500;letter-spacing:0;text-transform:none\">AI-generated editorial image</small>"

def card():
    return CARD

def decorate(slug, page):
    if slug != SLUG:
        return page
    return re.sub(r'<div class="jhero">.*?</div>', lambda match: HERO, page, count=1, flags=re.S)
