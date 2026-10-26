"""Responsive, explicitly labelled original art for the Lagos article."""
import re
SLUG = "lagos-fashion-week-2026-crafted-west-africa"
ART = {
 "lagos-crafted-studio-editorial": "AI-generated editorial illustration of an indigo jacket and woven cloth in a conceptual studio",
 "lagos-crafted-textiles-editorial": "AI-generated illustration of indigo resist-pattern inspired cloth, ochre strip-woven fabric and cotton yarn",
 "lagos-crafted-wardrobe-editorial": "AI-generated wardrobe illustration with a printed resort shirt, ivory tailoring and an ochre dress",
}
CSS = """<style id="lagos-editorial-layout">
article .jhero{aspect-ratio:auto;background:none;overflow:visible;margin:28px 0}
article .jhero img,article .jfig img{height:auto;aspect-ratio:3/2;object-fit:contain;border-radius:8px}
article .jfig{margin:34px 0}
article .jfig .ph{max-width:none;aspect-ratio:3/2}
article figcaption{font:13px/1.6 "DM Sans",system-ui,sans-serif;color:var(--muted);margin-top:10px;max-width:70ch}
article>p:not(.lead):not(.jmeta):not(.byline),article>ul{max-width:70ch}
@media(max-width:600px){nav{gap:14px;padding-block:16px}nav .links{gap:10px 16px}article h1{font-size:clamp(30px,8.5vw,40px);line-height:1.12}article .lead{font-size:18px;line-height:1.65}.eb{margin-top:24px}article h2{font-size:24px}article .jhero,article .jfig{margin:24px 0}.jgrid{grid-template-columns:minmax(0,1fr)}}
</style>"""
def decorate(slug, page):
 if slug != SLUG: return page
 if 'id="lagos-editorial-layout"' not in page: page=page.replace('</head>',CSS+'</head>')
 page=re.sub(r'<div class="jhero">(.*?)</div>', r'<figure class="jhero">\1<figcaption>AI-generated editorial illustration · Original craft and tailoring concepts. Not a photograph of Lagos Fashion Week or a designer collection.</figcaption></figure>', page,count=1,flags=re.S)
 for name,alt in ART.items():
  def responsive(m):
   tag=m.group(0)
   tag=re.sub(r' alt="[^"]*"', ' alt="'+alt+'"', tag)
   tag=re.sub(r' width="[^"]*"| height="[^"]*"| srcset="[^"]*"| sizes="[^"]*"| decoding="[^"]*"| fetchpriority="[^"]*"','',tag)
   return tag[:-1]+f' width="1536" height="1024" srcset="img/{name}-640.webp 640w, img/{name}-960.webp 960w, img/{name}.webp 1536w" sizes="(max-width: 892px) calc(100vw - 32px), 860px" decoding="async"'+(' fetchpriority="high"' if name.endswith('studio-editorial') else '')+'>'
  page=re.sub(r'<img[^>]*src="img/'+name+r'\.webp"[^>]*>',responsive,page)
 return page
