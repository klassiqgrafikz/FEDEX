const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'components');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const PAGE_TEMPLATE_FILE = path.join(__dirname, 'page-template.html');
const OUTPUT_FILE = path.join(__dirname, 'index.html');
const JS_OUTPUT = path.join(__dirname, 'script.js');
const PAGES_DIR = path.join(__dirname, 'pages');
const CONTENT_DIR = path.join(PAGES_DIR, 'content');
const MANIFEST_FILE = path.join(__dirname, 'pages-manifest.json');

const SCRIPT_VERSION = Date.now().toString(36);

const componentOrder = [
    'header', 'hero', 'floating-widget', 'quicklinks',
    'cta', 'whyship', 'cards', 'featured', 'legal', 'footer', 'admin',
    'tracking-result',
    'alert-banner'
];

function readComponent(name) {
    const f = path.join(COMPONENTS_DIR, name, name + '.html');
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf-8').trim() : '';
}

function buildHtml() {
    let template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
    for (const name of componentOrder) {
        const marker = '<!--#component:' + name + '-->';
        template = template.split(marker).join(readComponent(name));
    }
    template = template.replace(/<!--#home-link-->/g, 'index.html');
    template = replaceExternalLinks(template);
    template = template.replace(/<!--#script-version-->/g, SCRIPT_VERSION);
    fs.writeFileSync(OUTPUT_FILE, template, 'utf-8');
    console.log('[BUILD] index.html written (' + (template.length / 1024).toFixed(1) + ' KB)');
}

function buildJs() {
    const initJs = path.join(__dirname, 'script.js');
    let combined = '';
    for (const name of componentOrder) {
        const f = path.join(COMPONENTS_DIR, name, name + '.js');
        if (fs.existsSync(f)) {
            const c = fs.readFileSync(f, 'utf-8').trim();
            if (c) {
                combined += '\n/* --- ' + name + ' --- */\n' + c + '\n';
            }
        }
    }
    combined += '\n/* --- init --- */\n' + fs.readFileSync(path.join(__dirname, 'init.js'), 'utf-8').trim() + '\n';
    fs.writeFileSync(path.join(__dirname, 'script.built.js'), combined, 'utf-8');
    console.log('[BUILD] script.built.js written (' + (combined.length / 1024).toFixed(1) + ' KB)');
    console.log('[INFO]  Rename script.built.js to script.js to use the concatenated build.');
}

function buildAllPages() {
    if (!fs.existsSync(MANIFEST_FILE)) {
        console.log('[PAGES] No manifest found, skipping');
        return;
    }
    if (!fs.existsSync(PAGE_TEMPLATE_FILE)) {
        console.log('[PAGES] No page template found, skipping');
        return;
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    const pageTemplate = fs.readFileSync(PAGE_TEMPLATE_FILE, 'utf-8');

    if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
    if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });

    const headerHtml = readComponent('header');
    const footerHtml = readComponent('footer');

    for (const entry of manifest) {
        const contentFile = path.join(CONTENT_DIR, entry.id + '.html');
        let content = fs.existsSync(contentFile)
            ? fs.readFileSync(contentFile, 'utf-8').trim()
            : '<div class="fxg-page-inner"><div class="fxg-page-placeholder"><h1>' + entry.title + '</h1><p>Content not available.</p></div></div>';

        let page = pageTemplate
            .replace('<!--#page-title-->', entry.title)
            .replace('<!--#component:header-->', headerHtml.replace(/<!--#home-link-->/g, '../index.html'))
            .replace('<!--#component:floating-widget-->', readComponent('floating-widget'))
            .replace('<!--#component:content-->', content)
            .replace('<!--#component:footer-->', footerHtml);

        page = killAllLinks(page);
        page = page.replace(/<!--#script-version-->/g, SCRIPT_VERSION);

        const out = path.join(PAGES_DIR, entry.id + '.html');
        fs.writeFileSync(out, page, 'utf-8');
        console.log('  [PAGE] pages/' + entry.id + '.html (' + (page.length / 1024).toFixed(1) + ' KB)');
    }
    console.log('[PAGES] ' + manifest.length + ' pages built');
}

function replaceExternalLinks(html) {
    if (!fs.existsSync(MANIFEST_FILE)) return html;
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    const sorted = [...manifest].sort((a, b) => b.url.length - a.url.length);
    for (const entry of sorted) {
        const escaped = entry.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html = html.replace(new RegExp(escaped, 'g'), 'pages/' + entry.id + '.html');
    }
    html = html.replace(/https:\/\/www\.fedex\.com\/en-us\/home\.html/g, 'index.html');
    return html;
}

const SOCIAL_DOMAINS = [
    'facebook.com', 'x.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'youtube.com', 'pinterest.com',
    'fedex.com/en-us/email'
];

function isPreservedLink(href) {
    if (href === 'index.html' || href === '../index.html') return true;
    if (href.includes('login.html') || href.includes('dashboard.html') || href.includes('create.html') || href.includes('shipments.html') || href.includes('shipment.html')) return true;
    return SOCIAL_DOMAINS.some(d => href.includes(d));
}

function killAllLinks(html) {
    html = html.replace(/<a\b[^>]*>/gi, function(m) {
        var hrefMatch = m.match(/href="([^"]+)"/);
        if (hrefMatch && isPreservedLink(hrefMatch[1])) return m;
        return m.replace(/\bhref="(https?:\/\/[^"]*)"/g, 'href="#"')
                .replace(/\bhref="(\/\/[^"]*)"/g, 'href="#"')
                .replace(/\bhref="((?!javascript)[^#][^"]*)"/g, function(m2) {
                    if (/href="#/.test(m2)) return m2;
                    if (/href="javascript/.test(m2)) return m2;
                    return 'href="#"';
                });
    });
    return html;
}
function buildAdminPages() {
    const ADMIN_TEMPLATE = path.join(__dirname, 'admin-template.html');
    const ADMIN_CONTENT_DIR = path.join(PAGES_DIR, 'admin', 'content');
    const ADMIN_OUT_DIR = path.join(PAGES_DIR, 'admin');
    const ADMIN_NAV_ITEMS = [
        { id: 'dashboard', title: 'Dashboard', page: 'dashboard' },
        { id: 'create', title: 'Create Shipment', page: 'create' },
        { id: 'shipments', title: 'All Shipments', page: 'shipments' },
        { id: 'shipment', title: 'Shipment Detail', page: 'shipment' },
        { id: 'inbox', title: 'Inbox', page: 'inbox' }
    ];

    if (!fs.existsSync(ADMIN_TEMPLATE)) { console.log('  [ADMIN] No admin template found, skipping'); return; }
    if (!fs.existsSync(ADMIN_CONTENT_DIR)) { console.log('  [ADMIN] No admin content dir, skipping'); return; }

    const adminHtml = readComponent('admin');

    for (const item of ADMIN_NAV_ITEMS) {
        const contentFile = path.join(ADMIN_CONTENT_DIR, item.id + '.html');
        if (!fs.existsSync(contentFile)) {
            console.log('  [ADMIN] No content for ' + item.id + ', skipping');
            continue;
        }
        const content = fs.readFileSync(contentFile, 'utf-8').trim();

        let page = fs.readFileSync(ADMIN_TEMPLATE, 'utf-8')
            .replace('<!--#admin-title-->', item.title)
            .replace('<!--#admin-page-->', item.page || '')
            .replace('<!--#component:admin-->', adminHtml)
            .replace('<!--#component:admin-content-->', content)
            .replace('<!--#admin-scripts-->', '')
            .replace(/<!--#script-version-->/g, SCRIPT_VERSION);

        const out = path.join(ADMIN_OUT_DIR, item.id + '.html');
        fs.writeFileSync(out, page, 'utf-8');
        console.log('  [ADMIN] pages/admin/' + item.id + '.html (' + (page.length / 1024).toFixed(1) + ' KB)');
    }
    console.log('[ADMIN] Admin pages built');
}

console.log('=== FedEx Static Site Builder ===');
console.log('\n--- Homepage ---');
buildHtml();
buildJs();
console.log('\n--- Sub-pages ---');
buildAllPages();
console.log('\n--- Admin Pages ---');
buildAdminPages();
console.log('\n=== Build complete ===');