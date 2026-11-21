"""Extra depth for the free tools pages (added 7 Nov 2026, Content depth rule). Inserted by tools.py. Add only; never remove text."""

HUB = (
    '<h2>How to use the tools in a real range plan</h2>'
    '<p>Most teams use the two tools at different points in the same job. Early in a season, when a Forecut detail such as a drawcord hem or a balloon trouser is chosen for a range, the pattern maker gives a quick first block so the design team can see proportions on paper before a sampling room is booked. Once the fabric is shortlisted, the textile calculator turns the supplier\'s quote into numbers the team can compare: price per metre to price per garment, GSM to weight per metre, and yarn count to the count system your mill uses. The final step is costing, where fabric, trims, making and margin are added up to check that the style can sell at its target price.</p>'
    '<h2>Reading the numbers by region</h2>'
    '<ul><li><b>India and South Asia:</b> mills usually quote cotton in Ne counts, GSM and price per metre or per kilo; the calculator converts between these directly, and the rupee costing view includes a GST line to fill in.</li>'
    '<li><b>Europe:</b> wool and worsted qualities are often given in Nm and grams per running metre; switch the weight box to g/m to compare like for like.</li>'
    '<li><b>North America:</b> denim and knits are often quoted in ounces per square yard and yards; set the units to imperial and the results stay in step.</li>'
    '<li><b>East Asia:</b> filament yarns are usually in denier or dtex; the yarn converter handles both alongside spun counts.</li></ul>'
    '<h2>Common questions</h2>'
    '<p><b>Do I need an account?</b> No for the textile calculator. The pattern maker needs a free Forecut sign-in so we can keep the tool free while it is being fit-tested.</p>'
    '<p><b>Can I use the results with a factory?</b> Yes, as planning figures. Exact formulas (GSM, counts, conversions) can be shared as they are; consumption and marker figures should be checked against your factory\'s own marker before bulk fabric is ordered.</p>'
    '<p><b>Do the tools work offline or on a phone?</b> They run in the browser, so once a page has loaded the calculations work without a connection, and the layout adapts to phone screens.</p>'
    '<p><b>Are my measurements stored?</b> Measurements and quotes stay in your browser; nothing you type is sent to Forecut.</p>'
)

CALC = (
    '<h2>Three worked examples</h2>'
    '<ul><li><b>From a quote to a garment cost.</b> A mill offers a 150 cm wide cotton poplin at a price per metre. Enter the width, the garment type and the size range in the consumption calculator to get metres per piece, then multiply by the price in the costing calculator. Repeat with a 112 cm wide alternative: the narrower fabric is often cheaper per metre but needs more metres per shirt, so compare the cost per piece, not the cost per metre.</li>'
    '<li><b>Checking a knit\'s weight.</b> A supplier says a single jersey is 180 GSM. With the width entered, the GSM calculator gives grams per running metre, which is how many knit mills sell by the kilo. If a lab test later shows 165 GSM, the same box tells you how many extra metres a kilo will give and how the garment will feel lighter.</li>'
    '<li><b>Matching yarn systems.</b> A European spinner quotes Nm 50 and an Indian mill quotes Ne 30. Convert both to tex to see that they are close but not identical, then check twist and strength before treating them as substitutes.</li></ul>'
    '<h2>Regional habits worth knowing</h2>'
    '<p>India, Bangladesh and Pakistan mostly trade cotton yarn in Ne and fabric by the metre or kilo; Europe uses Nm for wool and linen and g/m for woven cloth; the United States still quotes denim in ounces per square yard; and East Asian filament suppliers work in denier and dtex. Because each box has its own unit menu, you can type a quote exactly as it arrives and let the calculator do the conversion.</p>'
    '<h2>Common questions</h2>'
    '<p><b>Why does my consumption figure differ from the factory\'s?</b> The calculator gives a typical size M figure. One-way prints, nap, stripes that must match and the factory\'s marker efficiency all change the real number, usually upward.</p>'
    '<p><b>Is regain included?</b> Yes, there is a separate regain calculator for converting between oven-dry and commercial weight, useful for wool, cotton and viscose deliveries.</p>'
    '<p><b>Can I save results?</b> Use Copy results or Print to keep a record with your tech pack.</p>'
)

# Planning-tool guides (added 21 Nov 2026, Content depth rule). Inserted by collection_tools.py under each tool. Add only; never remove text.
COLLECTION = {
'cutclock': (
    '<h2>How to plan a season with the Production Calendar</h2>'
    '<p>Start from the date that cannot move: the day styles must be listed online or on the shop floor. Enter it as the target launch, choose which days your team and suppliers work, and the calendar counts backward through each stage: design freeze, first sample, fit review and approval, lab dip and colour approval, fabric sourcing and order, bulk fabric receipt, stitching, finishing and quality check, then dispatch and transit. Each step has its own lead time, so a late lab dip shows up as a later start for everything that follows. Add a minimum buffer in calendar days; most small brands find that one or two weeks of slack is the difference between a calm launch and air freight.</p>'
    '<h2>Holidays and working days by region</h2>'
    '<ul><li><b>India:</b> Diwali, Dussehra, Eid, Holi and regional festivals such as Onam and Pongal close mills and tailoring units for several days; the calendar lists national holidays and major festivals so a schedule does not quietly assume work during Diwali week.</li>'
    '<li><b>China and East Asia:</b> Lunar New Year stops most factories for two to four weeks, and workers often return late, so plan bulk fabric and cutting to finish well before it.</li>'
    '<li><b>Europe and North America:</b> August holidays in Italy and France and the Christmas to New Year shutdown affect mills and logistics; Black Friday and Christmas are the retail deadlines most collections work back from.</li>'
    '<li><b>Southern hemisphere:</b> Australian, South African and South American brands launch summer ranges from September to November, so their production peaks while northern suppliers are busy with spring orders.</li></ul>'
    '<h2>Common questions</h2>'
    '<p><b>What does an overdue step mean?</b> The step should already have started or finished to meet the launch date. Shorten a later stage, move the launch, or add capacity.</p>'
    '<p><b>Can I record what really happened?</b> Yes. Enter actual finish dates and the calendar shows the slip in days, which is useful evidence when you negotiate lead times next season.</p>'
    '<p><b>Can I share it?</b> Export the schedule as a calendar file or CSV and send it to your factory or team; nothing is published automatically.</p>'
),
'rangeboard': (
    '<h2>How to build a balanced collection</h2>'
    '<p>A collection plan is a list of style slots before it is a list of designs. Decide how many styles each category needs (for example dresses, tops, trousers and outerwear), give every slot a target price, the colourways and size set, the units per SKU and a drop date, and the planner totals units and production cost for the whole range. When planned production cost goes over your budget, the planner says by how much, so you can cut a colourway or reduce depth before samples are ordered rather than after.</p>'
    '<p>Each style can carry a trend stage from a Forecut forecast. A healthy range usually keeps most depth in rising and peaking details that customers already recognise, a small share in emerging details to test, and very little in anything marked fading. The planner groups styles by category and by trend stage, so it is easy to see if one category holds too much of the money or if the whole range leans on one idea.</p>'
    '<h2>Reading the plan by market</h2>'
    '<ul><li><b>India:</b> plan festive and wedding drops around Dussehra, Diwali and the winter wedding months, with deeper size runs in kurta sets and co-ords than in occasion lehengas.</li>'
    '<li><b>Europe and North America:</b> split autumn into two or three drops so outerwear and knitwear arrive as the weather turns, with a party drop before Black Friday and Christmas.</li>'
    '<li><b>Gulf and Southeast Asia:</b> Ramadan and Eid capsules need modest silhouettes and earlier delivery than western spring ranges.</li>'
    '<li><b>Southern hemisphere:</b> summer ranges land from September, so the same trend reaches stores about six months ahead of the north.</li></ul>'
    '<h2>Common questions</h2>'
    '<p><b>Do the other tools see this plan?</b> Yes. The Price &amp; Profit Calculator, Colour Palette Builder, Break-even Calculator and Production Calendar all read the same saved collection.</p>'
    '<p><b>How do I keep a copy?</b> Download a backup or export a CSV; printing gives a one-page range overview for buying meetings.</p>'
),
'evenpoint': (
    '<h2>How to decide an order quantity</h2>'
    '<p>A factory minimum order is a commitment, not a sales forecast. Enter the minimum order or the number of pieces you plan to make, the variable production cost per piece, the fixed costs that come with the collection (samples, photography, patterns, launch marketing) and your expected sell-through at full price and on sale. The calculator shows the upfront investment, the profit at your planned sell-through and the sell-through you need just to break even. If break-even sits above about 70% for a new style, the order is risky: most small labels sell a meaningful share on discount or not at all.</p>'
    '<p>You can also add a recovery value for unsold stock, such as outlet or bulk sale, as a percentage of net revenue per piece. Keep it modest; leftover seasonal stock rarely recovers more than its cost.</p>'
    '<h2>How the maths changes by market</h2>'
    '<ul><li><b>India:</b> marketplace commission, cash-on-delivery and high return rates on fashion mean net proceeds per piece can be far below the ticket price, so take figures from the Price &amp; Profit Calculator first.</li>'
    '<li><b>Europe:</b> strict returns rules and free-returns expectations raise the return burden; test a lower first order and reorder winners.</li>'
    '<li><b>North America:</b> heavy promotional periods such as Black Friday push more units into discount, so model a planned discount as well as full price.</li>'
    '<li><b>Asia sourcing hubs:</b> Chinese, Bangladeshi and Vietnamese factories often offer lower unit costs at higher minimums; compare two quantities side by side rather than taking the cheapest unit price.</li></ul>'
    '<h2>Common questions</h2>'
    '<p><b>Why does a bigger order look less profitable?</b> More pieces lower the unit cost but raise the investment and the share that has to sell. If sell-through falls, profit can drop even though each piece is cheaper.</p>'
    '<p><b>Does it include tax?</b> Revenue is shown excluding product tax so margins are comparable across markets; enter prices accordingly.</p>'
),
}
