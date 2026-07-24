const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const manifest = require('./pages-manifest.json');
const CONTENT_DIR = path.join(__dirname, 'pages', 'content');

if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getWaybackSnapshot(url) {
    try {
        const cdxUrl = 'https://web.archive.org/cdx/search/cdx?url=' + encodeURIComponent(url) + '&output=json&limit=1&fl=timestamp,original&filter=statuscode:200';
        const resp = await axios.get(cdxUrl, { timeout: 20000 });
        if (resp.data && resp.data.length > 1) {
            return resp.data[1][0];
        }
    } catch (e) {
        return null;
    }
    return null;
}

async function fetchArchivedPage(url, timestamp) {
    const archiveUrl = 'https://web.archive.org/web/' + timestamp + 'id_/' + url;
    const resp = await axios.get(archiveUrl, {
        timeout: 60000,
        headers: { 'User-Agent': userAgent },
        maxRedirects: 5
    });
    return resp.data;
}

function extractMainContent(html) {
    const dom = new JSDOM(html, { url: 'https://www.fedex.com' });
    const doc = dom.window.document;

    const selectors = [
        'main', '[role="main"]', '.fxg-main',
        '.content', '#content', '.page-content',
        '.main-content', 'article', '.section'
    ];

    for (const sel of selectors) {
        const el = doc.querySelector(sel);
        if (el) {
            const clone = el.cloneNode(true);
            clone.querySelectorAll('script, style, noscript, iframe, .fxg-header, .fxg-footer, nav, header, footer').forEach(function(n) {
                n.remove();
            });
            return clone.innerHTML;
        }
    }

    const body = doc.querySelector('body');
    if (body) {
        const clone = body.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, iframe, .fxg-header, .fxg-footer, nav, header, footer, .fxg-nav, .fxg-global-nav, .fxg-dropdown').forEach(function(n) {
            n.remove();
        });
        return clone.innerHTML;
    }

    return null;
}

function cleanContent(html) {
    html = html.replace(/\bhref="(https?:\/\/[^"]*)"/g, 'href="#"');
    html = html.replace(/\bhref="(\/\/[^"]*)"/g, 'href="#"');
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
    html = html.replace(/ on\w+="[^"]*"/g, '');
    html = html.replace(/ on\w+='[^']*'/g, '');
    return html.trim();
}

function createPlaceholder(entry) {
    const html = '<div class="fxg-page-inner">\n<div class="fxg-page-placeholder">\n<h1>' + entry.title + '</h1>\n<p>This is a static replica of the FedEx page for demonstration purposes.</p>\n<p class="fxg-page-original">Original: ' + entry.url + '</p>\n</div>\n</div>';
    fs.writeFileSync(path.join(CONTENT_DIR, entry.id + '.html'), html, 'utf-8');
    console.log('  [PLACEHOLDER] ' + entry.id);
}

function wrapContent(content) {
    return '<div class="fxg-page-inner">\n' + content + '\n</div>';
}

async function clonePage(entry) {
    process.stdout.write('  ' + entry.id + '... ');
    const timestamp = await getWaybackSnapshot(entry.url);
    if (!timestamp) {
        console.log('NO SNAPSHOT');
        createPlaceholder(entry);
        return;
    }
    try {
        const html = await fetchArchivedPage(entry.url, timestamp);
        let content = extractMainContent(html);
        if (!content || content.length < 50) {
            console.log('LOW CONTENT');
            createPlaceholder(entry);
            return;
        }
        content = cleanContent(content);
        const wrapped = wrapContent(content);
        fs.writeFileSync(path.join(CONTENT_DIR, entry.id + '.html'), wrapped, 'utf-8');
        console.log('OK (' + (wrapped.length / 1024).toFixed(1) + ' KB)');
    } catch (e) {
        console.log('ERROR: ' + e.message);
        createPlaceholder(entry);
    }
}

async function main() {
    console.log('=== Cloning ' + manifest.length + ' pages from Wayback Machine ===\n');
    for (let i = 0; i < manifest.length; i++) {
        console.log('[' + (i + 1) + '/' + manifest.length + '] ' + manifest[i].url);
        await clonePage(manifest[i]);
        await new Promise(function(r) { setTimeout(r, 1500); });
    }
    console.log('\n=== Done ===');
}

main().catch(function(e) { console.error(e); process.exit(1); });