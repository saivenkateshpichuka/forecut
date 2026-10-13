"""Write ../about.html, ../contact.html, ../terms.html, ../privacy.html (shared Forecut style)."""
import html
EFF = '11 October 2026'
HEAD = '''<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>

<link rel="preload" href="fonts/dm-sans.woff" as="font" type="font/woff" crossorigin><link rel="stylesheet" href="fonts/fonts.css">
<style>
:root{{--paper:#f5f0e8;--paper-2:#fffcf7;--grid:#e3d9cc;--ink:#1c1714;--muted:#6e6259;--mat:#1f3d33;--mat-ink:#f5f0e8;--chalk:#b4532a;--chalk-soft:#f3e1d6}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#14110f;--paper-2:#1e1a17;--grid:#352d27;--ink:#f2ebe2;--muted:#b3a698;--mat:#e8dccb;--mat-ink:#1c1714;--chalk:#e08a5e;--chalk-soft:#3a2418;color-scheme:dark}}}}
:root[data-theme="dark"]{{--paper:#14110f;--paper-2:#1e1a17;--grid:#352d27;--ink:#f2ebe2;--muted:#b3a698;--mat:#e8dccb;--mat-ink:#1c1714;--chalk:#e08a5e;--chalk-soft:#3a2418;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--paper);color:var(--ink);font:16.5px/1.7 "DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;padding:0 16px 56px;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:780px;margin:0 auto}}
nav{{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-block:20px;flex-wrap:wrap}}
.logo{{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:inherit;font:600 22px "DM Sans",system-ui,sans-serif}}
.logo svg{{width:28px;height:28px}}
nav .links{{display:flex;gap:18px;flex-wrap:wrap;font-size:14.5px}}
nav .links a{{color:var(--muted);text-decoration:none}} nav .links a:hover{{color:var(--ink)}}
.eb{{font:600 12px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk);margin:40px 0 8px}}
h1{{letter-spacing:-.03em!important;font:700 clamp(34px,6vw,52px)/1.08 "DM Sans",system-ui,sans-serif;letter-spacing:-.015em;margin:0 0 14px}}
h2{{font:700 20px/1.3 "DM Sans",sans-serif;margin:34px 0 8px}}
p,li{{color:var(--ink);font-family:"Source Serif 4",Georgia,serif;font-size:17.5px}} nav,footer,.eb,.meta{{font-family:"DM Sans",sans-serif}} .lead{{font-size:18.5px;color:var(--muted)}}
ul{{padding-left:20px}} li{{margin:5px 0}}
a{{color:var(--ink)}}
.meta{{font-size:14px;color:var(--muted)}}
.box{{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:22px 24px;margin:22px 0}}
.mail{{display:inline-block;font:600 clamp(22px,4.5vw,30px) "DM Sans",sans-serif;color:var(--mat);text-decoration:none;border-bottom:2px solid var(--chalk);word-break:break-all}}
footer{{margin-top:56px;padding-top:22px;border-top:1px solid var(--grid);display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;font-size:14px;color:var(--muted)}}
footer a{{color:var(--muted)}} footer .fl{{display:flex;gap:16px;flex-wrap:wrap}}
:focus-visible{{outline:2px solid var(--chalk);outline-offset:3px}}
</style></head><body><div class="wrap">
<nav><a class="logo" href="/"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#b4532a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Forecut</a>
<div class="links"><a href="/">Home</a><a href="india.html">India forecast</a><a href="aw26.html">Seasons</a><a href="reports.html">Reports</a><a href="journal.html">Journal</a></div></nav>
'''
FOOT = '''<footer><span>© 2026 Forecut · <a href="mailto:hello@forecut.in">hello@forecut.in</a></span>
<span class="fl"><a href="reports.html">Reports</a><a href="journal.html">Journal</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="terms.html">Terms &amp; Conditions</a><a href="privacy.html">Privacy Policy</a></span></footer>
</div></body></html>
'''
P = {}
P['about.html'] = ('About Forecut · Fashion Trend Forecasting for India', '''
<div class="eb">About</div><h1>Forecasting fashion, one detail at a time.</h1>
<p class="lead">Forecut is a detail-level fashion trend forecasting platform built for the Indian market. We help designers, brands and manufacturers decide which details to develop next, and when.</p>
<h2>Why Forecut exists</h2>
<p>Most trend reports describe a mood. The people who make clothes need specifics: which collar, which trim, which fabric, and when it will peak. Indian businesses also plan around their own calendar of festivals, weddings and summer, which global reports rarely reflect.</p>
<p>Forecut brings both together. We track garments, footwear, fabrics, embroidery, trims and colours down to individual construction details, and mark each one as emerging, rising, peaking or fading across India's festive windows and the global seasons through 2028.</p>
<h2>What we offer</h2>
<ul><li><b>India forecast:</b> ethnic and western wear, footwear, handloom weaves, embroidery and trims, planned around the Indian calendar.</li>
<li><b>Global seasons:</b> detail-level reports from AW26 to AW28, with themes, colours of the year and price guides in rupees.</li>
<li><b>Practical detail cards:</b> design notes, fabric and trim guidance, and downloadable cards for teams.</li>
<li><b>Monthly updates:</b> forecasts are reviewed and refreshed every month.</li></ul>
<h2>How we work</h2>
<p>We review public runway coverage, trade and retail reporting, street style and search interest, then use AI-assisted analysis to identify and track specific details. Every forecast is curated and written in our own words. Brands and designers are named only where public sources report them.</p>
<h2>Where we are</h2>
<p>Forecut is an independent platform made in India. It is currently in an early-access testing phase, with full access available at no cost. Your feedback directly shapes the launch.</p>
<div class="box"><b>Get in touch</b><br>Questions, feedback or partnership ideas: <a href="mailto:hello@forecut.in">hello@forecut.in</a></div>''')
P['contact.html'] = ('Contact Forecut', '''
<div class="eb">Contact</div><h1>Get in touch.</h1>
<p class="lead">For questions, feedback, partnerships or enterprise enquiries, write to us at:</p>
<div class="box"><a class="mail" href="mailto:hello@forecut.in">hello@forecut.in</a><p class="meta" style="margin:14px 0 0">We aim to reply within two working days.</p></div>
<h2>Helpful to include</h2>
<ul><li>Your name and organisation, if relevant</li><li>The page or forecast your message is about</li><li>For enterprise enquiries, your team size and the categories you work in</li></ul>''')
P['terms.html'] = ('Terms & Conditions · Forecut', f'''
<div class="eb">Legal</div><h1>Terms &amp; Conditions</h1>
<p class="meta">Effective {EFF}</p>
<p>These Terms &amp; Conditions ("Terms") govern your use of the Forecut website at forecut.in and its content (the "Service"). By using the Service, you agree to these Terms. If you do not agree, please do not use the Service.</p>
<h2>1. About the Service</h2>
<p>Forecut provides fashion trend forecasts, analysis, sketches, images, descriptions and downloadable detail cards. The Service is currently in an early-access testing phase and is provided free of charge. Features and content may change, be added or be removed at any time.</p>
<h2>2. Plans and pricing</h2>
<p>Prices shown on the website are for subscription plans that will begin at launch. You will not be charged during the testing phase. Before any paid plan begins, we will publish its terms clearly, and nothing will be charged without your explicit agreement. Launch prices may change for new subscribers after launch.</p>
<h2>3. Nature of forecasts</h2>
<p>Forecasts are informed opinions based on public information and analysis. They are provided for general information and planning purposes only and are not guarantees of future trends, sales or commercial outcomes. You are responsible for your own design, sourcing, purchasing and business decisions. Price guides are indicative estimates, not quotations.</p>
<h2>4. Acceptable use</h2>
<p>You may use the Service for your own professional, educational or personal purposes. You agree not to:</p>
<ul><li>copy, resell, republish or redistribute substantial parts of the Service, or present it as your own;</li>
<li>scrape, crawl or extract content by automated means, except by search engines for indexing;</li>
<li>interfere with the security or operation of the Service; or</li>
<li>use the Service for any unlawful purpose.</li></ul>
<h2>5. Downloads and sharing</h2>
<p>You may download detail cards and use them within your team, in internal presentations and in educational work. When sharing them publicly, including on social media, please keep the Forecut name and website shown on the card. Commercial redistribution requires our written permission.</p>
<h2>6. Intellectual property</h2>
<p>The Service, including its text, forecasts, sketches, images, design and code, is owned by Forecut or its licensors and is protected by applicable intellectual property laws. Some images are created with the help of AI tools. Brand, designer and product names mentioned belong to their respective owners and are used only for reference and commentary; their mention does not imply endorsement or affiliation.</p>
<h2>7. Third-party links and services</h2>
<p>The Service may link to or rely on third-party websites and services. We are not responsible for their content, availability or practices.</p>
<h2>8. Disclaimer</h2>
<p>The Service is provided "as is" and "as available", without warranties of any kind, express or implied, including accuracy, completeness, fitness for a particular purpose and uninterrupted availability.</p>
<h2>9. Limitation of liability</h2>
<p>To the fullest extent permitted by law, Forecut will not be liable for any indirect, incidental, special or consequential losses, or for any loss of profit, revenue, data or business opportunity, arising from your use of, or inability to use, the Service. Because the Service is currently free, our total liability for any claim will not exceed INR 1,000.</p>
<h2>10. Changes to these Terms</h2>
<p>We may update these Terms from time to time. The updated version will be posted on this page with a new effective date. Continued use of the Service after changes means you accept the updated Terms.</p>
<h2>11. Governing law</h2>
<p>These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of the competent courts in India.</p>
<h2>12. Contact</h2>
<p>Questions about these Terms: <a href="mailto:hello@forecut.in">hello@forecut.in</a></p>''')
P['privacy.html'] = ('Privacy Policy · Forecut', f'''
<div class="eb">Legal</div><h1>Privacy Policy</h1>
<p class="meta">Effective {EFF}</p>
<p>This Privacy Policy explains what information Forecut collects when you use forecut.in, how it is used, and the choices you have. We aim to collect as little personal data as possible and to handle it in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.</p>
<h2>1. Information we collect</h2>
<ul><li><b>Information you send us.</b> When you email us, including through the early-access or feedback form (which opens your own email app), we receive your email address and whatever you choose to include, such as your name, role and feedback.</li>
<li><b>Technical information.</b> Our hosting provider and font service automatically receive standard technical data when you load the website, such as your IP address, browser type and the pages requested. We do not use this data to identify you.</li></ul>
<p>We do not ask for passwords or payment details, and we do not knowingly collect information from children.</p>
<h2>2. Cookies, analytics and advertising</h2>
<p>Forecut uses Google Analytics to understand how visitors use the site, such as which pages are viewed, the approximate country or city, device type and how visitors arrived. Google Analytics sets cookies and processes this information on our behalf under <a href="https://policies.google.com/privacy">Google's Privacy Policy</a>; we do not receive your name or email from it. You can opt out with the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out add-on</a> or by blocking cookies in your browser. </p>
<h2>Accounts</h2>
<p>If you create a Forecut account, we store your name, email address and, if you sign in with Google, your Google profile picture, using Google Firebase Authentication. Passwords are handled by Firebase and are never visible to us. We use this information only to provide your account and to contact you about Forecut. You can ask us to delete your account at any time by writing to <a href="mailto:hello@forecut.in">hello@forecut.in</a>.</p>
<h2>Advertising</h2>
<p>Forecut may show ads served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to Forecut and/or other sites on the internet. You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>. See <a href="https://policies.google.com/technologies/partner-sites">how Google uses information from sites that use its services</a>.</p>
<h2>3. How we use information</h2>
<ul><li>to reply to your messages and enquiries;</li><li>to inform you about the launch, if you asked us to;</li><li>to improve Forecut using your feedback; and</li><li>to keep the website secure and working.</li></ul>
<p>We do not sell or rent your personal information.</p>
<h2>4. Service providers</h2>
<p>We rely on trusted providers to run the website and email:</p>
<ul><li><b>GitHub Pages</b> (GitHub, Inc.), website hosting</li><li><b>Google Fonts</b> (Google LLC), web fonts</li><li><b>Zoho Mail</b> (Zoho Corporation), email</li><li><b>GoDaddy</b>, domain registration</li></ul>
<p>These providers process data under their own privacy policies, and some may process it outside India.</p>
<h2>5. Retention</h2>
<p>We keep emails and feedback only as long as needed to respond and to improve the Service, and delete them on request.</p>
<h2>6. Your rights</h2>
<p>You may ask to access, correct or delete personal information you have shared with us, or withdraw consent to receive launch updates. Email <a href="mailto:hello@forecut.in">hello@forecut.in</a> and we will respond within a reasonable time.</p>
<h2>7. Security</h2>
<p>The website is served over HTTPS. We take reasonable steps to protect information, but no method of transmission or storage is completely secure.</p>
<h2>8. Changes to this policy</h2>
<p>We may update this Privacy Policy from time to time. The updated version will be posted here with a new effective date.</p>
<h2>9. Contact</h2>
<p>For privacy questions or requests, including grievances: <a href="mailto:hello@forecut.in">hello@forecut.in</a></p>''')
for fn, (title, body) in P.items():
    open('../' + fn, 'w').write(HEAD.format(title=html.escape(title)) + body + FOOT)
print('legal pages', len(P))
