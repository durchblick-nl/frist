#!/usr/bin/env node
/**
 * Build script for creating offline HTML bundles for all frist.ch tools
 * Usage: node build-all-offline.js
 *
 * Creates ZIP files for each tool in each language
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_DIR = __dirname;
const PROJECT_DIR = path.dirname(BUNDLE_DIR);
const OUTPUT_DIR = path.join(PROJECT_DIR, 'downloads');

// Tool configurations
const TOOLS = [
    {
        id: 'fristenrechner',
        name: { de: 'Fristenrechner', fr: 'Calculateur de délais' },
        htmlFile: { de: 'de/index.html', fr: 'fr/index.html' },
        scripts: ['scripts/utils.js', 'scripts/calculations.js', 'scripts/app.js', 'scripts/pdf-export.js'],
        title: { de: 'Schweizer Fristenrechner (Offline-Version)', fr: 'Calculateur de délais suisse (Version hors ligne)' }
    },
    {
        id: 'verjaehrungsrechner',
        name: { de: 'Verjährungsrechner', fr: 'Calculateur de prescription' },
        htmlFile: { de: 'de/verjaehrung.html', fr: 'fr/verjaehrung.html' },
        scripts: ['scripts/utils.js', 'scripts/pdf-export.js', 'scripts/verjaehrung.js'],
        title: { de: 'Schweizer Verjährungsrechner (Offline-Version)', fr: 'Calculateur de prescription suisse (Version hors ligne)' }
    },
    {
        id: 'kuendigungsrechner',
        name: { de: 'Kündigungsfristenrechner', fr: 'Calculateur de délais de résiliation' },
        htmlFile: { de: 'de/kuendigung.html', fr: 'fr/kuendigung.html' },
        scripts: ['scripts/utils.js', 'scripts/pdf-export.js', 'scripts/kuendigung.js'],
        title: { de: 'Schweizer Kündigungsfristenrechner (Offline-Version)', fr: 'Calculateur de délais de résiliation suisse (Version hors ligne)' }
    }
];

const LANGUAGES = ['de', 'fr'];

// Read and convert fonts to base64
function getFontBase64(fontFile) {
    const fontPath = path.join(BUNDLE_DIR, fontFile);
    if (!fs.existsSync(fontPath)) {
        console.warn(`  Warning: Font file not found: ${fontFile}`);
        return null;
    }
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString('base64');
}

// Read file contents
function readFile(relativePath) {
    const filePath = path.join(PROJECT_DIR, relativePath);
    if (!fs.existsSync(filePath)) {
        console.warn(`  Warning: File not found: ${relativePath}`);
        return '';
    }
    return fs.readFileSync(filePath, 'utf8');
}

function readBundleFile(filename) {
    const filePath = path.join(BUNDLE_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`  Warning: Bundle file not found: ${filename}`);
        return '';
    }
    return fs.readFileSync(filePath, 'utf8');
}

// Generate embedded font CSS
function generateFontCSS() {
    const regularBase64 = getFontBase64('economica-regular.ttf');
    const boldBase64 = getFontBase64('economica-bold.ttf');

    if (!regularBase64 || !boldBase64) {
        return '/* Fonts not available - using system fonts */';
    }

    return `
        @font-face {
            font-family: 'Economica';
            font-style: normal;
            font-weight: 400;
            font-display: swap;
            src: url('data:font/truetype;base64,${regularBase64}') format('truetype');
        }
        @font-face {
            font-family: 'Economica';
            font-style: normal;
            font-weight: 700;
            font-display: swap;
            src: url('data:font/truetype;base64,${boldBase64}') format('truetype');
        }
    `;
}

// Font Awesome subset - only the icons we need
function generateFontAwesomeCSS() {
    return `
        /* Font Awesome subset - inline SVG icons */
        .fa, .fas, .fab { display: inline-block; font-style: normal; }
        .fa-moon::before { content: "\\1F319"; }
        .fa-sun::before { content: "\\2600\\FE0F"; }
        .fa-calendar-day::before { content: "\\1F4C5"; }
        .fa-clock::before { content: "\\23F0"; }
        .fa-gavel::before { content: "\\2696\\FE0F"; }
        .fa-exclamation-triangle::before { content: "\\26A0\\FE0F"; }
        .fa-file-pdf::before { content: "\\1F4C4"; }
        .fa-calculator::before { content: "\\1F9EE"; }
        .fa-calendar-alt::before { content: "\\1F4C6"; }
        .fa-flag::before { content: "\\1F6A9"; }
        .fa-external-link-alt::before { content: "\\2197"; font-size: 0.8em; }
        .fa-check::before { content: "\\2713"; }
        .fa-times::before { content: "\\2715"; }
        .fa-copy::before { content: "\\1F4CB"; }
        .fa-link::before { content: "\\1F517"; }
        .fa-chevron-right::before { content: "\\203A"; }
        .fa-file-contract::before { content: "\\1F4C3"; }
        .fa-file-signature::before { content: "\\1F4DD"; }
        .fa-hourglass-half::before { content: "\\23F3"; }
        .fa-hourglass-end::before { content: "\\231B"; }
        .fa-redo::before { content: "\\1F504"; }
        .fa-pause-circle::before { content: "\\23F8"; }
        .fa-exclamation-circle::before { content: "\\2757"; }
        .fa-info-circle::before { content: "\\2139\\FE0F"; }
        .fa-briefcase::before { content: "\\1F4BC"; }
        .fa-home::before { content: "\\1F3E0"; }
        .fa-store::before { content: "\\1F3EA"; }
        .fa-shield-alt::before { content: "\\1F6E1"; }
        .fa-mobile-alt::before { content: "\\1F4F1"; }
        .fa-door-open::before { content: "\\1F6AA"; }
    `;
}

// Offline banner text
const BANNER_TEXT = {
    de: {
        title: 'Offline-Version',
        subtitle: 'Keine Internetverbindung erforderlich',
        date: 'Stand'
    },
    fr: {
        title: 'Version hors ligne',
        subtitle: 'Aucune connexion Internet requise',
        date: 'État'
    }
};

// Build offline HTML for a specific tool and language
function buildOfflineHTML(tool, lang) {
    console.log(`  Building ${tool.id} (${lang})...`);

    // Read source files
    const htmlTemplate = readFile(tool.htmlFile[lang]);
    if (!htmlTemplate) {
        console.error(`  ERROR: Could not read HTML template for ${tool.id} (${lang})`);
        return null;
    }

    const stylesCSS = readFile('css/styles.css');
    const flatpickrCSS = readBundleFile('flatpickr.min.css');
    const flatpickrJS = readBundleFile('flatpickr.min.js');
    const jspdfJS = readBundleFile('jspdf.min.js');

    // Read tool-specific scripts
    let scriptsJS = '';
    for (const script of tool.scripts) {
        scriptsJS += readFile(script) + '\n';
    }

    // Generate embedded assets
    const fontCSS = generateFontCSS();
    const fontAwesomeCSS = generateFontAwesomeCSS();

    // Build combined CSS
    const combinedCSS = `
        ${fontCSS}
        ${fontAwesomeCSS}
        ${flatpickrCSS}
        ${stylesCSS}

        /* Offline banner */
        .offline-banner {
            background: linear-gradient(135deg, #2d5a3d 0%, #4a7c59 100%);
            color: white;
            padding: 10px 20px;
            font-size: 0.9rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            border-radius: 8px;
        }
        .offline-banner .version {
            opacity: 0.8;
            font-size: 0.8rem;
        }
    `;

    // Build combined JS (jsPDF + flatpickr + tool scripts)
    const combinedJS = `
        ${jspdfJS}
        ${flatpickrJS}
        ${scriptsJS}
    `;

    const banner = BANNER_TEXT[lang];
    const dateStr = new Date().toLocaleDateString(lang === 'de' ? 'de-CH' : 'fr-CH');

    // Create offline HTML
    let offlineHTML = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tool.title[lang]}</title>
    <style>
${combinedCSS}
    </style>
</head>
<body>
    <div class="container">
        <div class="offline-banner">
            <span>${banner.title} – ${banner.subtitle}</span>
            <span class="version">${banner.date}: ${dateStr}</span>
        </div>
`;

    // Extract body content from template
    const bodyMatch = htmlTemplate.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
        let bodyContent = bodyMatch[1];

        // Remove external script/link tags
        bodyContent = bodyContent.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*fonts[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*flatpickr[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*font-awesome[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*rel="preconnect"[^>]*>/gi, '');

        // Remove language switcher
        bodyContent = bodyContent.replace(/<div class="language-switcher">[\s\S]*?<\/div>\s*<\/div>/gi, '</div>');

        // Remove navigation tabs
        bodyContent = bodyContent.replace(/<nav class="tool-nav">[\s\S]*?<\/nav>/gi, '');

        // Fix relative paths
        bodyContent = bodyContent.replace(/href="\.\.\/de\//g, 'href="#');
        bodyContent = bodyContent.replace(/href="\.\.\/fr\//g, 'href="#');
        bodyContent = bodyContent.replace(/src="\.\.\/favicon\.svg"/g, 'src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'90\'%3E%F0%9F%93%85%3C/text%3E%3C/svg%3E"');

        // Remove the container div that we already added
        bodyContent = bodyContent.replace(/<div class="container">/i, '');

        offlineHTML += bodyContent;
    }

    offlineHTML += `
    <script>
${combinedJS}
    </script>
</body>
</html>`;

    return offlineHTML;
}

// Create ZIP file
function createZip(htmlPath, zipPath, htmlFilename) {
    try {
        // Use built-in zip command (available on macOS/Linux)
        execSync(`cd "${path.dirname(htmlPath)}" && zip -j "${zipPath}" "${path.basename(htmlPath)}"`, { stdio: 'pipe' });
        return true;
    } catch (error) {
        console.error(`  ERROR creating ZIP: ${error.message}`);
        return false;
    }
}

// Main build function
function buildAll() {
    console.log('Building offline bundles for frist.ch tools...\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const results = [];

    for (const tool of TOOLS) {
        for (const lang of LANGUAGES) {
            const htmlFilename = `${tool.id}-offline-${lang}.html`;
            const zipFilename = `${tool.id}-offline-${lang}.zip`;
            const htmlPath = path.join(OUTPUT_DIR, htmlFilename);
            const zipPath = path.join(OUTPUT_DIR, zipFilename);

            // Build HTML
            const html = buildOfflineHTML(tool, lang);
            if (!html) {
                results.push({ tool: tool.id, lang, success: false });
                continue;
            }

            // Write HTML
            fs.writeFileSync(htmlPath, html, 'utf8');

            // Create ZIP
            const zipSuccess = createZip(htmlPath, zipPath, htmlFilename);

            if (zipSuccess) {
                const zipStats = fs.statSync(zipPath);
                const htmlStats = fs.statSync(htmlPath);
                console.log(`  ✅ ${zipFilename} (${(zipStats.size / 1024).toFixed(0)} KB)`);
                results.push({
                    tool: tool.id,
                    lang,
                    success: true,
                    zipSize: zipStats.size,
                    htmlSize: htmlStats.size,
                    zipPath,
                    htmlPath
                });

                // Remove HTML file (keep only ZIP)
                fs.unlinkSync(htmlPath);
            } else {
                results.push({ tool: tool.id, lang, success: false });
            }
        }
        console.log('');
    }

    // Summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('═'.repeat(50));
    console.log(`Build complete: ${successful.length}/${results.length} bundles created`);

    if (failed.length > 0) {
        console.log('\nFailed:');
        failed.forEach(r => console.log(`  ❌ ${r.tool} (${r.lang})`));
    }

    console.log(`\nOutput directory: ${OUTPUT_DIR}`);

    // Return results for potential further processing
    return results;
}

// Run build
try {
    buildAll();
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
