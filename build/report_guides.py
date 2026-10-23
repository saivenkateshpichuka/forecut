"""Buying and design guides added to Core Item Update and Design Capsule reports (Oct 2026). Add only."""
from html import escape as E


def section(title, items=None, paras=None, faq=None):
    h = f'<section class="sec howto"><h2>{E(title)}</h2>'
    for p in paras or []: h += f'<p>{p}</p>'
    if items: h += '<ul>' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>'
    if faq: h += ''.join(f'<p><b>{E(q)}</b> {E(a)}</p>' for q, a in faq)
    return h + '</section>'


CORE = {
'sarees': (['<b>Length and width:</b> most sarees are about 5.5 to 6.3 metres long; pre-draped versions need a waist size chart instead.', '<b>Blouse piece:</b> state whether a blouse piece is attached and its length.', '<b>Pallu and border:</b> plan the motif scale so the pallu reads clearly when draped.', '<b>Fall and pico:</b> offer finishing as standard for easy wear.'],
    ['Handloom silks and cottons for premium and festive', 'Georgette and chiffon for easy drape and travel', 'Tissue and organza for light festive shine', 'Linen and cotton blends for summer and office wear'],
    [('Are pre-draped sarees replacing traditional sarees?', 'No. They widen the market, especially for younger customers and busy occasions, while traditional drapes remain central for weddings and festivals.'), ('What sells best online?', 'Sarees with clear drape photos, fabric close-ups and a stated weight sell better than flat product shots.')]),
'lehengas': (['<b>Skirt panels and flare:</b> kalis (panels) and can-can control volume; specify flare in metres.', '<b>Waist and length:</b> leave seam allowance for alterations.', '<b>Blouse:</b> offer padded, corset or simple blouse options.', '<b>Weight:</b> state the approximate finished weight for comfort.'],
    ['Organza and tulle for light volume', 'Raw silk and velvet for winter weddings', 'Georgette for fluid, lighter lehengas', 'Brocade for traditional bridal'],
    [('How heavy should a bridal lehenga be?', 'Lighter is in demand. Many brides now prefer weights that are comfortable for long ceremonies, achieved with lighter bases and structured volume.'), ('Which lehengas suit guests?', 'Light georgette, organza and printed lehengas in pastels or jewel tones that can be re-worn.')]),
'suits-kurtas': (['<b>Length:</b> short, hip, knee and ankle lengths serve different customers.', '<b>Neck and sleeve:</b> keep a few signature necklines and update with details such as yokes and placket trims.', '<b>Sets:</b> define what is included: kurta, bottom and dupatta.', '<b>Sizing:</b> include bust, waist and hip measurements and the length for each size.'],
    ['Cotton, mulmul and cambric for summer', 'Chanderi and cotton-silk for festive', 'Rayon and viscose for value ranges', 'Linen blends for premium casual'],
    [('Which kurta lengths sell best?', 'It varies by region and age; many brands carry knee to calf lengths as core and test short kurtas for younger customers.'), ('Are co-ord sets replacing suits?', 'They sit alongside suits, especially for daily and work wear.')]),
'blouses-dupattas': (['<b>Blouse fit:</b> offer padded and non-padded options and clear bust and shoulder measurements.', '<b>Closures:</b> back hooks, side zips or front openings for different needs.', '<b>Dupatta size:</b> typically around 2.25 to 2.5 metres; state width and edge finish.', '<b>Mix and match:</b> design blouses to work with several sarees.'],
    ['Raw silk and brocade for festive blouses', 'Organza and net for sheer dupattas', 'Cotton and chanderi for everyday', 'Velvet for winter weddings'],
    [('Are readymade blouses replacing tailored blouses?', 'Readymade blouses in good fits are growing fast, especially online, while tailoring remains important for bridal.'), ('What dupatta trends are rising?', 'Light organza, borders with hand work and dupattas styled as capes or drapes.')]),
'mens-kurtas': (['<b>Length:</b> short and mid-thigh for casual, knee length for occasions.', '<b>Collar:</b> mandarin, band and Nehru collars lead.', '<b>Fit:</b> straight cuts with comfortable ease; avoid tight sleeves.', '<b>Sets:</b> state whether the pyjama or trouser and jacket are included.'],
    ['Cotton and linen for summer and daily wear', 'Silk blends for festive', 'Chikankari and tonal embroidery on cotton', 'Jacquards for occasion sets'],
    [('Which colours are strongest for men\'s festive wear?', 'Ivory, pastels and deeper jewel tones, depending on the event and time of day.'), ('Do men buy kurta sets online?', 'Yes, especially with clear size charts and photos on models of different builds.')]),
'jackets-bandhgalas': (['<b>Shoulder fit:</b> the most important fit point; it is hard to alter later.', '<b>Collar:</b> stand height and closure should sit comfortably.', '<b>Construction:</b> canvas or interlining keeps the front smooth.', '<b>Buttons:</b> a signature detail; offer brass, horn, enamel or fabric-covered.'],
    ['Suiting wool and wool blends for formal wear', 'Velvet for winter events', 'Linen and cotton for summer', 'Jacquard and brocade for weddings'],
    [('Is the Nehru jacket still in demand?', 'Yes. It is one of the most versatile Indian menswear pieces, worn over kurtas and shirts.'), ('Can a bandhgala be worn outside India?', 'Yes. It works as eveningwear and formalwear, and suits diaspora weddings and events.')]),
'ethnic-footwear': (['<b>Comfort:</b> cushioned insoles and soft linings matter for long events.', '<b>Sizing:</b> traditional styles often run differently; give foot-length guidance.', '<b>Soles:</b> leather soles look traditional, rubber soles add grip.', '<b>Embellishment:</b> secure beads and threads on high-wear areas.'],
    ['Leather juttis and Kolhapuris', 'Velvet and silk uppers for festive', 'Embroidered and mirror-work details', 'Vegan leather alternatives for some customers'],
    [('Are juttis comfortable?', 'Modern versions with padded insoles and softer leathers are much more comfortable than traditional ones.'), ('What is GI-tagged footwear?', 'Kolhapuri chappals from parts of Maharashtra and Karnataka have Geographical Indication protection, linking the name to the region.')]),
'sneakers': (['<b>Last and fit:</b> specify toe shape and width; many customers need wider fits.', '<b>Sole:</b> slimmer, low-profile soles are rising; chunky soles are easing.', '<b>Materials:</b> suede, leather and mesh for different climates.', '<b>Comfort tech:</b> cushioning and breathable linings for hot weather.'],
    ['Suede and leather for retro styles', 'Mesh and knit uppers for heat', 'Recycled materials for sustainable lines', 'Canvas for value ranges'],
    [('Are sneakers fading?', 'The everyday chunky sneaker is easing, while slim retro and running styles keep rising. Sneakers worn with ethnic wear remain strong with younger customers.'), ('Which sneakers suit hot climates?', 'Mesh and knit uppers with breathable linings and light soles.')]),
}


def core(slug, title):
    if slug not in CORE: return ''
    build, fabrics, faq = CORE[slug]
    return (section(f'What to check in {title.lower()} development', build)
            + section('Fabric guide', fabrics, paras=['Choose fabric by occasion, climate and price point. The same design often needs two fabric options: a premium version and a value or summer version.'])
            + section('The global view', paras=[f'Indian {E(title.lower())} sell well beyond India, to South Asian communities in the UK, North America, the Gulf, Southeast Asia and Australia, and increasingly to customers discovering Indian craft. For international customers, provide clear size conversions, care guidance and styling ideas for local events.'])
            + section('Common questions', faq=faq))


CAPS = {
'handloom-quiet-luxury': ('Lead with three or four hero handloom fabrics and a simple, modern silhouette. Price the capsule in the mid to premium band and tell the weaver and region story on every product page.', [('Why is handloom seen as luxury?', 'It is slower to make, carries regional craft and has a natural texture that machine-made cloth cannot copy.'), ('Which customers buy it?', 'Customers who value craft, natural fibres and long-lasting pieces, in India and internationally.')]),
'indigo-blue-white': ('Build around indigo in several depths with white and ecru. Mix prints and solids: block prints, stripes and plain cotton, so customers can combine pieces.', [('Does indigo bleed?', 'Natural and synthetic indigo can transfer colour; wash before first wear and test rub fastness before bulk.'), ('Is blue and white a summer-only story?', 'It leads in summer, but deep indigo works across seasons.')]),
'festive-made-easy': ('Focus on outfits that are quick to wear: pre-draped sarees, ready blouses and co-ord sets. Offer complete looks and add-ons such as belts and jackets.', [('Who is this capsule for?', 'Customers who want festive style without long preparation, including working professionals and younger shoppers.'), ('Can it work for gifting?', 'Yes. Easy-fit pieces and accessories are popular festive gifts.')]),
'indian-craft-global': ('Use Indian embroidery and textiles on silhouettes that travel: shirts, jackets, dresses and trousers. Explain the craft clearly for customers who may not know it.', [('Why is Indian craft going global?', 'Luxury brands and Indian couturiers on international calendars have raised awareness of techniques such as zardozi and chikankari.'), ('How do I price craft for export?', 'Include hand-work time, quality control and documentation costs, and position the product as premium.')]),
'gen-z-fusion': ('Mix ethnic and streetwear: short kurtas with jeans, sarees with sneakers, jackets over lehengas. Keep prices accessible and use social content to show styling.', [('What does Gen Z want from ethnic wear?', 'Comfort, versatility and pieces that can be styled in many ways, at accessible prices.'), ('Which channels work best?', 'Social media, creators and quick-commerce and D2C sites with fast delivery.')]),
}


def capsule(slug):
    if slug not in CAPS: return ''
    plan, faq = CAPS[slug]
    return (section('Range plan', paras=[E(plan)], items=['<b>Hero pieces (about 20%):</b> the strongest expression of the story, at higher prices.', '<b>Core pieces (about 60%):</b> easy-to-wear styles in the capsule colours.', '<b>Add-ons (about 20%):</b> accessories and layers that increase basket size.'])
            + section('Selling it in different regions', paras=['In India, time the capsule to the festive or summer window it suits. For South Asian communities abroad, link it to local festival dates and weddings. For international customers new to Indian fashion, lead with easy pieces such as shirts, jackets and scarves, and explain the craft.'])
            + section('Common questions', faq=faq))
