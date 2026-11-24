"""Forecut kidswear forecast data (added 24 Nov 2026 for the final pipeline).

Each piece: (name, audiences, category, kind, area, note, life)
  audiences: tg toddler girls (1-4), tb toddler boys (1-4), g girls (5-14), b boys (5-14), k kids (unisex)
  kind: w woven, k knit, f footwear
  life: one letter per season AW26 SS27 AW27 SS28 AW28 (e emerging, r rising, p peaking, f fading, - not in the forecast / off-season)
Forecut's own reading: kidswear follows adult direction a season or two later, adapted for comfort, safety and growth.
"""

K = [
 # ---------------- dresses and girls' woven
 ('Smocked-yoke sundress', 'tg g', 'Dresses', 'w', 'Bodice', 'Hand-look smocking across the yoke in cotton poplin; easy over-the-head fit with growing room.', '-r-p-'),
 ('Tiered cotton maxi dress', 'g', 'Dresses', 'w', 'Silhouette', 'Three gathered tiers in crinkle cotton; ankle length for summer holidays and festivals.', '-r-p-'),
 ('Dropped-waist pleated dress', 'g', 'Dresses', 'w', 'Waist', 'The adult waist story for girls: a dropped seam with a knife-pleated skirt.', '-erp-'),
 ('Pinafore dress', 'tg g', 'Dresses', 'w', 'Silhouette', 'Corduroy or denim pinafore layered over knits; adjustable straps with two button positions.', 'p-f-e'),
 ('Velvet party dress', 'tg g', 'Occasion', 'w', 'Fabric', 'Stretch velvet bodice with a soft tulle skirt; in plum, bordeaux and midnight.', 'r-p-f'),
 ('Puff-sleeve blouse', 'tg g', 'Tops', 'w', 'Sleeve', 'Short puff sleeves with elastic cuffs in broderie or seersucker.', 'rpf--'),
 ('Peter Pan collar dress', 'tg', 'Dresses', 'w', 'Collar', 'Rounded collar with contrast piping; a classic that keeps selling in toddler ranges.', 'pp-f-'),
 ('Broderie anglaise trims', 'tg g', 'Tops', 'w', 'Trim', 'Eyelet edging on collars, hems and pockets; cotton only, no loose threads.', '-p-f-'),
 ('Ruffle-hem skirt', 'g', 'Bottoms', 'w', 'Hem', 'A-line skirt with a single deep ruffle; pairs with tees and cardigans.', 'r-p-f'),
 ('Wide-leg linen trousers', 'g k', 'Bottoms', 'w', 'Shape', 'Relaxed wide legs with an elastic back waist in linen-cotton.', '-e-r-'),
 # ---------------- boys' woven
 ('Camp-collar printed shirt', 'tb b', 'Tops', 'w', 'Collar', 'Open camp collar in printed viscose or cotton; the adult resort shirt scaled down.', '-p-f-'),
 ('Pull-on chino', 'tb b', 'Bottoms', 'w', 'Waist', 'Chino look with a full elastic waist and a flat front tab; no fiddly fly for small hands.', 'pppff'),
 ('Utility cargo trousers', 'b k', 'Bottoms', 'w', 'Pocket', 'Bellows pockets with snap flaps; reinforced knees for play.', 'rpppf'),
 ('Quilted barn jacket', 'b tb g', 'Outerwear', 'w', 'Fabric', 'Diamond-quilted body with a cord collar; the adult heritage jacket for school runs.', 'r-p-f'),
 ('Twill overshirt', 'b k', 'Tops', 'w', 'Garment', 'Brushed twill shirt-jacket with patch pockets; worn open over tees.', 'e-r-p'),
 ('Linen-blend shorts', 'tb b', 'Bottoms', 'w', 'Length', 'Knee-length shorts in linen-cotton with an elastic waist.', '-r-p-'),
 ('Mini tailored waistcoat', 'tb b', 'Occasion', 'w', 'Garment', 'Fully lined waistcoat for weddings and ceremonies; adjustable back strap.', 'r-p-p'),
 ('Mandarin-collar kurta set', 'tb b', 'Occasion', 'w', 'Collar', 'Short kurta with mandarin collar and pyjama for festive and wedding seasons.', 'rpppp'),
 # ---------------- unisex woven and outerwear
 ('Bubble puffer jacket', 'k tb tg b g', 'Outerwear', 'w', 'Silhouette', 'Rounded, short puffer with a high collar; recycled fill and fixed hood without cords.', 'p-p-f'),
 ('Fleece-lined rain parka', 'k', 'Outerwear', 'w', 'Fabric', 'Waterproof shell with warm fleece lining and reflective tabs.', 'r-p-p'),
 ('Corduroy dungarees', 'k tb tg', 'Bottoms', 'w', 'Garment', 'Wide-wale corduroy with adjustable straps and snap-crotch for nappies in toddler sizes.', 'p-f-e'),
 ('Barrel-leg jeans', 'g b', 'Bottoms', 'w', 'Shape', 'The adult curved leg in a softer, wider version with an adjustable inside waist.', 'erp--'),
 ('Wide-leg denim', 'g b k', 'Bottoms', 'w', 'Shape', 'Relaxed wide leg replaces skinny jeans for kids too.', 'ppff-'),
 ('Organic cotton poplin', 'k tg tb g b', 'Tops', 'w', 'Fabric', 'Certified organic poplin for shirts and dresses; soft after washing.', 'rrppp'),
 ('Crinkle cotton', 'g tg k', 'Dresses', 'w', 'Fabric', 'Crinkled cotton needs no ironing and keeps cool in heat.', '-r-p-'),
 ('Seersucker stripes', 'tb tg b g k', 'Tops', 'w', 'Fabric', 'Puckered stripe cotton for shirts, shorts and rompers.', '-p-f-'),
 ('Washed corduroy', 'k b g', 'Bottoms', 'w', 'Fabric', 'Garment-washed corduroy in mushroom, moss and plum.', 'p-r-f'),
 ('Recycled nylon shell', 'k', 'Outerwear', 'w', 'Fabric', 'Lightweight recycled nylon for puffers and rain jackets.', 'r-p-p'),
 ('Garment-dyed canvas', 'b k', 'Outerwear', 'w', 'Finish', 'Soft, faded canvas for jackets and trousers; colour softens with every wash.', 'e-r-p'),
 ('Linen-cotton blend', 'k g b', 'Bottoms', 'w', 'Fabric', 'Linen look with cotton softness; less creasing than pure linen.', '-r-p-'),
 ('Eco-dyed cottons', 'k tg tb', 'Tops', 'w', 'Finish', 'Low-impact plant or mineral dyes in soft, sun-faded tones.', '-e-r-'),
 ('Tencel twill', 'g b k', 'Bottoms', 'w', 'Fabric', 'Smooth, drapey lyocell twill for joggers-look trousers and dresses.', '--e-r'),
 # ---------------- knit
 ('Chunky cable cardigan', 'k g b tg', 'Knitwear', 'k', 'Pattern', 'Oversized cables in a soft wool blend; wooden-look buttons sewn on with shanks.', 'p-p-f'),
 ('Fair Isle yoke sweater', 'k tb tg', 'Knitwear', 'k', 'Pattern', 'Round-yoke colourwork for winter and festive gifting.', 'r-p-f'),
 ('Pointelle knit set', 'tg', 'Knitwear', 'k', 'Texture', 'Lacy pointelle top and leggings; a baby and toddler favourite.', 'pf-e-'),
 ('Polo-collar knit', 'tb b', 'Knitwear', 'k', 'Collar', 'Knitted polo with a Johnny collar; the adult knit polo for kids.', '-r-p-'),
 ('Colour-block knits', 'b g k', 'Knitwear', 'k', 'Pattern', 'Big blocks of colour in two or three yarns; easy to update each season.', 'erp--'),
 ('Crochet-look knit tops', 'g tg', 'Knitwear', 'k', 'Texture', 'Crochet effects machine-made for summer; lined where open.', '-e-r-'),
 ('Ribbed knit dress', 'g', 'Knitwear', 'k', 'Silhouette', 'Long-sleeved rib dress worn with tights and boots.', 'r-p-f'),
 ('Oversized sweatshirt', 'k b g', 'Tops', 'k', 'Silhouette', 'Dropped shoulder and roomy body in brushed-back fleece.', 'pppff'),
 ('Jersey jogger', 'k tb tg b g', 'Bottoms', 'k', 'Shape', 'Soft jogger with a cuffed ankle; the everyday bottom for every age.', 'ppppp'),
 ('Henley jersey top', 'tb b', 'Tops', 'k', 'Placket', 'Three-button placket on a slub jersey long sleeve.', 'e-r-p'),
 ('Ribbed jersey bodysuit', 'tg tb', 'Tops', 'k', 'Closure', 'Envelope neck and snap crotch for easy changes.', 'ppppp'),
 ('Track jacket', 'b g k', 'Outerwear', 'k', 'Garment', 'Retro zip track top with contrast piping; the sporty adult trend for kids.', 'rp-f-'),
 ('Terry towelling polo', 'tb b', 'Tops', 'k', 'Fabric', 'Loop-back terry polo for summer, worn with linen shorts.', '-e-r-'),
 ('Fleece half-zip', 'k b g', 'Knitwear', 'k', 'Closure', 'Recycled fleece pullover with a chin guard on the zip.', 'p-p-f'),
 ('Organic cotton jersey', 'k tg tb g b', 'Tops', 'k', 'Fabric', 'Certified organic jersey for tees, sets and sleepwear.', 'ppppp'),
 ('Brushed-back fleece', 'k b g', 'Tops', 'k', 'Fabric', 'Soft brushed inside for sweatshirts and joggers.', 'p-p-p'),
 ('Merino blend knit', 'k tg tb', 'Knitwear', 'k', 'Fabric', 'Fine merino blend that is warm without bulk and not itchy.', 'r-p-p'),
 ('Slub jersey', 'b k', 'Tops', 'k', 'Texture', 'Irregular slub texture gives basic tees a lived-in look.', 'rppf-'),
 ('Waffle knit', 'k tg tb', 'Tops', 'k', 'Texture', 'Waffle jersey for loungewear and layering tops.', 'erp--'),
 ('Ribbed modal jersey', 'g tg', 'Tops', 'k', 'Fabric', 'Soft stretchy rib for fitted tops, dresses and leggings.', '-r-p-'),
 ('Recycled polyester fleece', 'k', 'Outerwear', 'k', 'Fabric', 'Fleece from recycled bottles; wash in a microfibre bag.', 'p-p-f'),
 ('Pique cotton', 'b tb', 'Tops', 'k', 'Fabric', 'Breathable pique for polos and summer tops.', '-p-p-'),
 # ---------------- trims and details
 ('Contrast piping', 'tg tb g b', 'Tops', 'w', 'Trim', 'Piping on collars, pockets and pyjama edges in an accent colour.', 'rpp--'),
 ('Scalloped edges', 'tg g', 'Dresses', 'w', 'Edge', 'Scalloped collars and hems, embroidered or laser-cut.', '-r-p-'),
 ('Ric-rac braid', 'tg g', 'Dresses', 'w', 'Trim', 'Wavy braid on hems and pockets for a playful summer look.', '-e-r-'),
 ('Appliqué patches', 'tb tg k', 'Tops', 'k', 'Embellishment', 'Stitched-down appliqué animals and fruit; no glued parts.', 'pppff'),
 ('Chenille lettering', 'b g k', 'Tops', 'k', 'Embellishment', 'Varsity-style chenille names and numbers on sweats and jackets.', 'rp-f-'),
 ('Embroidered collars', 'tg g', 'Tops', 'w', 'Collar', 'Small floral embroidery on rounded collars.', 'r-p-f'),
 ('Covered snap fastenings', 'tg tb', 'Tops', 'k', 'Closure', 'Snaps instead of buttons for under-3s; tested for pull strength.', 'ppppp'),
 ('Magnetic fastenings', 'tb tg', 'Tops', 'k', 'Closure', 'Sewn-in magnetic closures on bodysuits and sleepsuits for quicker changes.', 'e-r-p'),
 ('Adjustable inside waist', 'b g k tb tg', 'Bottoms', 'w', 'Waist', 'Buttonhole elastic inside the waistband so trousers fit for longer.', 'ppppp'),
 ('Reflective tabs', 'k b g', 'Outerwear', 'w', 'Trim', 'Reflective tape on pockets and backs for dark school runs.', 'r-p-p'),
 ('Wooden toggles', 'k b tb', 'Outerwear', 'w', 'Closure', 'Toggles on duffle coats, fixed with loops rather than cords.', 'e-r-p'),
 ('Pom-pom trim', 'tg g', 'Knitwear', 'k', 'Trim', 'Pom-pom edges on knits and summer hats; securely sewn.', '-r-f-'),
 ('Ruffle collars', 'tg g', 'Tops', 'w', 'Collar', 'Soft ruffled collars on blouses and knits.', 'rp-f-'),
 ('Contrast topstitching', 'b tb', 'Bottoms', 'w', 'Stitch', 'Bold topstitching on denim and workwear pieces.', 'p-p-f'),
 ('Name-label panels', 'k', 'Tops', 'w', 'Detail', 'Printed panels inside the neck to write a child\'s name; useful for school.', 'rrppp'),
 ('Hand-smocking', 'tg g', 'Dresses', 'w', 'Embellishment', 'Real or hand-look smocking on yokes and cuffs for occasion wear.', '-r-p-'),
 ('Sequin flip patches', 'g', 'Tops', 'k', 'Embellishment', 'Two-way sequins on tees; for ages 5 and up only.', 'pf-e-'),
 ('Mirror and gota work', 'g tg', 'Occasion', 'w', 'Embellishment', 'Light mirror and gota borders on festive lehengas and kurtas.', 'rpppp'),
 ('Velcro-free easy closures', 'k tb tg', 'Footwear', 'f', 'Closure', 'Hook-and-loop alternatives: elastic laces and zip-sides for independent dressing.', 'e-r-p'),
 # ---------------- footwear
 ('Mary Jane shoes', 'tg g', 'Footwear', 'f', 'Strap', 'Strap shoes with a rounded toe; in patent or metallic leather for parties.', 'p-p-f'),
 ('Chunky-sole trainers', 'k b g', 'Footwear', 'f', 'Sole', 'Thick, light soles with easy straps or elastic laces.', 'ppff-'),
 ('Retro runners', 'b g k', 'Footwear', 'f', 'Style', 'Slim, suede-and-mesh runners from the adult retro trend.', 'rp-p-'),
 ('Fisherman sandals', 'tg tb g b', 'Footwear', 'f', 'Strap', 'Woven-strap closed-toe sandals with a buckle.', '-p-f-'),
 ('Lug-sole Chelsea boots', 'k b g', 'Footwear', 'f', 'Sole', 'Elastic-sided boots with a deep grip sole; pull-on loops front and back.', 'r-p-f'),
 ('First-walker soft shoes', 'tg tb', 'Footwear', 'f', 'Sole', 'Flexible, thin-soled shoes for early walkers.', 'ppppp'),
 ('Glitter jelly sandals', 'g tg', 'Footwear', 'f', 'Material', 'Clear or glitter jelly sandals for beach and summer.', '-r-f-'),
 ('Snow boots', 'k', 'Footwear', 'f', 'Material', 'Insulated, waterproof boots with toggle-free closures.', 'p-p-p'),
 ('Velvet loafers', 'tb b', 'Footwear', 'f', 'Material', 'Velvet slippers for weddings and festive dressing.', 'e-r-p'),
 ('Juttis', 'tg g tb b', 'Footwear', 'f', 'Embellishment', 'Embroidered juttis for festive and wedding outfits.', 'pppff'),
 # ---------------- swim and summer, sets
 ('UPF 50+ swim sets', 'k tg tb g b', 'Swim', 'k', 'Fabric', 'Rash vest and shorts with sun protection; label the UPF rating only when tested.', '-p-p-'),
 ('Co-ord printed sets', 'g tg b tb', 'Sets', 'w', 'Print', 'Matching shirt and shorts or top and skirt in one print.', '-r-p-'),
 ('Fruit and vegetable prints', 'tg tb k', 'Sets', 'w', 'Print', 'Cheerful fruit and veg prints for summer sets and dresses.', '-p-f-'),
 ('Ditsy florals', 'tg g', 'Dresses', 'w', 'Print', 'Small florals on cotton and crinkle cotton.', 'p-p-f'),
 ('Painterly animal prints', 'k tb tg', 'Tops', 'k', 'Print', 'Hand-painted looking animals rather than cartoon characters.', 'e-r-p'),
 ('Tartan checks', 'k b g', 'Bottoms', 'w', 'Print', 'Brushed tartans for pinafores, shirts and trousers.', 'p-r-f'),
 ('Space and science prints', 'b tb k', 'Tops', 'k', 'Print', 'Planets, maps and science motifs; educational prints keep growing.', 'r-p-p'),
 ('Heritage stripes', 'k tb b', 'Tops', 'k', 'Print', 'Breton and rugby stripes in season colours.', 'pp-p-'),
 ('Matching family pieces', 'k', 'Sets', 'k', 'Detail', 'Adult and kids versions of the same knit or pyjama; strong for gifting.', 'rppf-'),
 ('Grow-with-me sleeves', 'k tg tb', 'Tops', 'k', 'Sleeve', 'Fold-back cuffs that extend sleeve length as the child grows.', 'erppp'),
 ('Extendable hems', 'k tg tb', 'Bottoms', 'w', 'Hem', 'Deep hems with a let-down line so trousers last longer.', '--err'),
 ('Gender-neutral basics', 'k', 'Tops', 'k', 'Detail', 'Shared colours and fits for siblings and hand-me-downs.', 'rpppp'),

 # ---------------- added for balance: more knit shapes, AW fabrics, hardware and occasion
 ('Knitted romper', 'tb tg', 'Knitwear', 'k', 'Silhouette', 'One-piece knit romper with snap legs; warm under a coat.', 'p-r-f'),
 ('Zip-through knit hoodie', 'tb b k', 'Knitwear', 'k', 'Closure', 'Knitted hoodie with a fixed hood and a zip garage at the chin.', 'r-p-p'),
 ('Shawl-collar cardigan', 'tb b', 'Knitwear', 'k', 'Collar', 'Chunky shawl collar on a button cardigan; the grandad cardigan for small boys.', 'e-r-p'),
 ('Cropped boxy knit', 'g', 'Knitwear', 'k', 'Silhouette', 'Short, wide sweater over high-waisted trousers and skirts.', 'rpf--'),
 ('Knitted vest', 'b g k tb', 'Knitwear', 'k', 'Garment', 'Sleeveless V-neck knit over shirts and tees; the preppy layer.', 'pr-f-'),
 ('Lounge knit set', 'tg tb g', 'Knitwear', 'k', 'Silhouette', 'Soft knit top and wide trousers worn as a set for travel and home.', 'r-p-f'),
 ('Short-sleeve knit polo', 'b tb', 'Knitwear', 'k', 'Collar', 'Fine cotton knit polo with a Johnny or button collar for summer.', '-r-p-'),
 ('Tank and shorts knit set', 'tg tb k', 'Sets', 'k', 'Silhouette', 'Rib tank with matching shorts in cotton jersey.', '-p-p-'),
 ('Jersey tiered dress', 'tg g', 'Dresses', 'k', 'Silhouette', 'Easy jersey dress with a gathered tier; no zips, just pull on.', '-r-p-'),
 ('Ribbed leggings', 'tg g', 'Bottoms', 'k', 'Shape', 'Soft rib leggings under dresses and long knits.', 'pppff'),
 ('Wool-blend melton', 'k b g tb tg', 'Outerwear', 'w', 'Fabric', 'Dense, warm melton for duffle and pea coats, lined in cotton.', 'p-r-f'),
 ('Needlecord', 'tb tg k', 'Bottoms', 'w', 'Fabric', 'Fine-wale cord for shirts, dresses and trousers in small sizes.', 'r-p-p'),
 ('Brushed flannel check', 'tb b k', 'Tops', 'w', 'Fabric', 'Soft brushed flannel for shirts and pyjamas.', 'p-p-f'),
 ('Quilted cotton', 'tg tb k', 'Outerwear', 'w', 'Texture', 'Light quilted cotton jackets and gilets for mild days.', 'e-r-p'),
 ('Organic cotton twill', 'tb b k', 'Bottoms', 'w', 'Fabric', 'Organic twill for chinos and dungarees; softens with washing.', 'r-p-p'),
 ('Waxed cotton', 'b k', 'Outerwear', 'w', 'Finish', 'PFC-free waxed cotton for showerproof jackets.', '--e-r'),
 ('Chambray', 'tb b tg g k', 'Tops', 'w', 'Fabric', 'Light denim-look chambray for shirts and dresses.', '-p-f-'),
 ('Cotton voile', 'tg g', 'Dresses', 'w', 'Fabric', 'Fine voile for lined summer dresses and blouses.', '-r-p-'),
 ('Lambswool blend', 'k g b', 'Knitwear', 'k', 'Fabric', 'Soft lambswool blend for cardigans and crew necks.', 'p-p-f'),
 ('Sherpa fleece', 'k tb tg', 'Outerwear', 'k', 'Texture', 'Teddy-texture fleece for jackets, collars and linings.', 'p-f-e'),
 ('Velour', 'tg g', 'Tops', 'k', 'Fabric', 'Soft velour for festive tracksuits and sets.', 'r-p-f'),
 ('Loopback French terry', 'k tb tg b g', 'Tops', 'k', 'Fabric', 'Light loopback terry for sweats and shorts across the year.', 'pppff'),
 ('Bamboo-viscose jersey', 'tg tb', 'Tops', 'k', 'Fabric', 'Soft, cool jersey for sleepwear; check the processing claims.', '-e-r-'),
 ('Knitted mesh', 'g b', 'Tops', 'k', 'Texture', 'Sporty open mesh for summer tops, lined where needed.', '-e-r-'),
 ('Two-way zips', 'k b g', 'Outerwear', 'w', 'Hardware', 'Two-way zips on coats so children can sit and climb comfortably.', 'e-r-p'),
 ('Popper-front placket', 'tb tg', 'Tops', 'k', 'Placket', 'Snaps down the front for quick changes on tops and cardigans.', 'pppff'),
 ('Glove clips', 'k tb tg', 'Outerwear', 'w', 'Hardware', 'Short glove clips inside the cuff; no long cords.', 'p-p-f'),
 ('Easy-grip zip pullers', 'k b g', 'Outerwear', 'w', 'Hardware', 'Large, rounded pullers small hands can hold.', 'r-p-p'),
 ('Coloured buckles', 'b g k', 'Footwear', 'f', 'Hardware', 'Bright buckles on sandals and dungaree straps.', '-p-f-'),
 ('Contrast elbow patches', 'b tb k', 'Knitwear', 'k', 'Detail', 'Patches that add wear on knit elbows and trouser knees.', 'r-p-p'),
 ('Hand-blanket stitch', 'tg g k', 'Knitwear', 'k', 'Stitch', 'Visible blanket stitch around edges in a contrast yarn.', 'e-r-p'),
 ('Frayed hems', 'g b', 'Bottoms', 'w', 'Hem', 'Raw hems on denim; finished with a stay-stitch so they do not run.', 'pf-f-'),
 ('Tulle underlayers', 'tg g', 'Occasion', 'w', 'Fabric', 'Soft tulle under party skirts, bound so it does not scratch.', 'p-p-f'),
 ('Satin bows', 'tg g', 'Occasion', 'w', 'Trim', 'Stitched satin bows on party dresses and hair accessories; ages 3 and up.', 'rp-p-'),
 ('Lehenga choli set', 'tg g', 'Occasion', 'w', 'Garment', 'Light lehenga with a soft-lined choli and a short dupatta.', 'rpppp'),
 ('Bandhgala jacket', 'tb b', 'Occasion', 'w', 'Collar', 'Mini bandhgala in suiting or silk blend for weddings.', 'r-p-p'),
 ('Sherwani set', 'tb b', 'Occasion', 'w', 'Garment', 'Short sherwani with churidar; lined and light for long ceremonies.', 'p-p-r'),
 ('Linen kurta pyjama', 'tb b', 'Occasion', 'w', 'Fabric', 'Summer festive set in cool linen-cotton.', '-r-p-'),
 ('Embroidered anarkali', 'g tg', 'Occasion', 'w', 'Embellishment', 'Flared anarkali with neckline embroidery, cotton lined.', 'pr-p-'),
 ('Velvet blazer', 'b tb', 'Occasion', 'w', 'Fabric', 'Soft velvet blazer for parties and Christmas.', 'e-r-p'),
 ('Party sneakers', 'g b k', 'Footwear', 'f', 'Material', 'Metallic or glitter sneakers that work with party outfits.', 'rpp--'),
 ('Fleece-lined clogs', 'k', 'Footwear', 'f', 'Material', 'Clog shapes with soft lining for indoors and short trips.', 'e-r-p'),
 ('Water shoes', 'k tb tg', 'Footwear', 'f', 'Sole', 'Quick-dry shoes with grip soles for pools and beaches.', '-p-p-'),
 ('Skater trainers', 'b g', 'Footwear', 'f', 'Style', 'Flat, padded skate shoes in canvas and suede.', 'p-r-f'),

 # ---------------- boys' occasion and toddler trims (balance, 24 Nov 2026)
 ('Soft-collar dress shirt', 'b tb', 'Occasion', 'w', 'Collar', 'Cotton dress shirt with a soft collar and easy cuffs; tucks into pleated trousers.', 'rpppp'),
 ('Pleated dress trousers', 'b tb', 'Occasion', 'w', 'Waist', 'Single-pleat trousers with an adjustable inside waist for ceremonies.', 'prrpp'),
 ('Clip-on bow ties', 'b', 'Occasion', 'w', 'Detail', 'Pre-tied bow ties on a safety clip; ages 5 and up.', 'rpppr'),
 ('Nehru waistcoat', 'b tb', 'Occasion', 'w', 'Collar', 'Band-collar waistcoat over a kurta or shirt for festive dressing.', 'rrppp'),
 ('Linen blazer', 'b', 'Occasion', 'w', 'Fabric', 'Half-lined linen blazer for summer weddings.', '-r-p-'),
 ('Contrast binding', 'tb tg k', 'Tops', 'k', 'Edge', 'Soft bound edges in a contrast colour on necks and armholes.', 'rpppr'),
 ('Embroidered motifs', 'tb tg', 'Tops', 'k', 'Embellishment', 'Small flat embroidered animals and fruit instead of appliqué parts.', 'pprrp'),
 ('Rib-trim edges', 'tb tg k', 'Tops', 'k', 'Trim', 'Contrast rib at cuffs, hems and necks on sweats and tees.', 'ppppp'),
]

AUD_KEYS = {'tg': 'toddler-girls', 'tb': 'toddler-boys', 'g': 'girls', 'b': 'boys', 'k': 'kids'}

# kids versions of the season themes: (season, adult theme it follows, kids title, story, key pieces)
KTHEMES = {
 'aw26': [
  ('Dark matter', 'Cosy dark neutrals', 'Chocolate, charcoal and navy for winter coats and knits, softened with oatmeal. Texture carries it: cord, fleece and cable.', 'Quilted barn jacket, chunky cable cardigan, washed corduroy, lug-sole Chelsea boots'),
  ('Old masters', 'Rich and warm', 'Plum and moss with mustard for festive and party dressing.', 'Velvet party dress, Fair Isle yoke sweater, mini tailored waistcoat, velvet loafers'),
  ('Hot spots', 'Pops of colour', 'One bright piece over dark neutrals: a cherry puffer, cobalt boots, a pink cardigan.', 'Bubble puffer jacket, chunky-sole trainers, colour-block knits'),
  ('Heritage', 'School-run heritage', 'Tartans, cord and quilting borrowed from countryside dressing.', 'Tartan checks, corduroy dungarees, pinafore dress, contrast topstitching'),
 ],
 'ss27': [
  ('Sun-faded', 'Sun-bleached basics', 'Whites, sand and ice blue in linen-cotton, seersucker and crinkle cotton that need no ironing.', 'Wide-leg linen trousers, seersucker stripes, linen-blend shorts, fisherman sandals'),
  ('Purple reign', 'Lilac days', 'Lilac and lavender with butter yellow for dresses, knits and swim.', 'Smocked-yoke sundress, crochet-look knit tops, ruffle collars'),
  ('Full colour', 'Primary play', 'Red, Klein blue and lemon in big blocks for play and the pool.', 'Co-ord printed sets, UPF 50+ swim sets, retro runners, track jacket'),
  ('Living green', 'Garden and pool', 'Grass green, aqua and coral with fruit and garden prints.', 'Fruit and vegetable prints, terry towelling polo, glitter jelly sandals'),
 ],
 'aw27': [
  ('Painted by time', 'Storybook colour', 'Plum, bordeaux and ochre for festive dressing and winter knits.', 'Velvet party dress, Fair Isle yoke sweater, velvet loafers, mirror and gota work'),
  ('New neutrals', 'Soft neutrals', 'Mushroom, greyed blue and copper khaki for outerwear and school-run basics.', 'Quilted barn jacket, garment-dyed canvas, wooden toggles, lug-sole Chelsea boots'),
  ('Pink for all', 'Pink for everyone', 'Dusty pink and mauve move into boys\' knits and sweats as well as girls\'.', 'Colour-block knits, oversized sweatshirt, merino blend knit'),
  ('Living green', 'Outdoor explorers', 'Sage and moss for rainwear, fleece and adventure prints.', 'Fleece-lined rain parka, fleece half-zip, reflective tabs, space and science prints'),
 ],
 'ss28': [
  ('Blue hour', 'Sea and sky', 'Royal blue, turquoise and sky with linen bases for summer sets and swim.', 'Co-ord printed sets, UPF 50+ swim sets, linen-cotton blend, fisherman sandals'),
  ('Atmosphere', 'Daydream', 'Greyish mauve and violet with peach for soft dresses and knits.', 'Tiered cotton maxi dress, crochet-look knit tops, scalloped edges'),
  ('Vegetal', 'Natural crafts', 'Straw, khaki and warm beige in natural fibres and craft details.', 'Ric-rac braid, eco-dyed cottons, wide-leg linen trousers, hand-smocking'),
  ('After dusk', 'Glow after dark', 'Inky blue with acid lemon for party and evening events.', 'Sequin flip patches, painterly animal prints, terry towelling polo'),
 ],
 'aw28': [
  ('Night blues', 'Starry nights', 'Ink, slate and petrol teal for coats, knits and space prints.', 'Bubble puffer jacket, space and science prints, merino blend knit, snow boots'),
  ('Berry and gold', 'Festive berry', 'Mulberry and antique gold for party and festive dressing.', 'Velvet party dress, mirror and gota work, velvet loafers, mini tailored waistcoat'),
  ('Deep forest', 'Into the woods', 'Bottle green with cocoa and oat for outerwear, cord and heavy knits.', 'Washed corduroy, chunky cable cardigan, wooden toggles, lug-sole Chelsea boots'),
  ('Grow with me', 'Made to last', 'Pieces designed to grow: extendable hems, fold-back sleeves and adjustable waists.', 'Extendable hems, grow-with-me sleeves, adjustable inside waist, gender-neutral basics'),
 ],
}


def items_for(aud):
    """Pieces for one kids audience as (category key, item dict) like details.json."""
    code = {v: k for k, v in AUD_KEYS.items()}[aud]
    out = []
    for n, a, cat, kind, area, note, life in K:
        tags = a.split()
        if aud == 'kids' or code in tags or 'k' in tags:
            out.append((f'Kidswear|{cat}', {'name': n, 'area': area, 'note': note, 'life': life, 'kind': kind}))
    return out
