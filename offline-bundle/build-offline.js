#!/usr/bin/env node
/**
 * Build script for creating offline HTML bundles
 * Usage: node build-offline.js
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_DIR = __dirname;
const PROJECT_DIR = path.dirname(BUNDLE_DIR);

// Read and convert fonts to base64
function getFontBase64(fontFile) {
    const fontPath = path.join(BUNDLE_DIR, fontFile);
    const fontBuffer = fs.readFileSync(fontPath);
    return fontBuffer.toString('base64');
}

// Read file contents
function readFile(relativePath) {
    const filePath = path.join(PROJECT_DIR, relativePath);
    return fs.readFileSync(filePath, 'utf8');
}

// Generate embedded font CSS
function generateFontCSS() {
    const regularBase64 = getFontBase64('economica-regular.ttf');
    const boldBase64 = getFontBase64('economica-bold.ttf');

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

        /* We'll use inline SVG or Unicode symbols instead */
        .fa-moon::before { content: "🌙"; }
        .fa-sun::before { content: "☀️"; }
        .fa-calendar-day::before { content: "📅"; }
        .fa-clock::before { content: "⏰"; }
        .fa-gavel::before { content: "⚖️"; }
        .fa-exclamation-triangle::before { content: "⚠️"; }
        .fa-file-pdf::before { content: "📄"; }
        .fa-calculator::before { content: "🧮"; }
        .fa-calendar-alt::before { content: "📆"; }
        .fa-flag::before { content: "🚩"; }
        .fa-external-link-alt::before { content: "↗"; font-size: 0.8em; }
        .fa-check::before { content: "✓"; }
        .fa-times::before { content: "✕"; }
        .fa-copy::before { content: "📋"; }
        .fa-link::before { content: "🔗"; }
        .fa-chevron-right::before { content: "›"; }
    `;
}

// Real Flatpickr CSS
function generateFlatpickrCSS() {
    const flatpickrCSS = fs.readFileSync(path.join(BUNDLE_DIR, 'flatpickr.min.css'), 'utf8');
    return flatpickrCSS;
}

// Real Flatpickr JS
function generateFlatpickrJS() {
    const flatpickrJS = fs.readFileSync(path.join(BUNDLE_DIR, 'flatpickr.min.js'), 'utf8');
    return flatpickrJS;
}

// Build the offline HTML
function buildOfflineHTML() {
    console.log('Building offline HTML bundle...');

    // Read source files
    const stylesCSS = readFile('css/styles.css');
    const calculationsJS = readFile('scripts/calculations.js');
    const appJS = readFile('scripts/app.js');
    const utilsJS = readFile('scripts/utils.js');
    const pdfExportJS = readFile('scripts/pdf-export.js');
    const jspdfJS = fs.readFileSync(path.join(BUNDLE_DIR, 'jspdf.min.js'), 'utf8');
    const htmlTemplate = readFile('de/index.html');

    // Generate embedded assets
    const fontCSS = generateFontCSS();
    const fontAwesomeCSS = generateFontAwesomeCSS();
    const flatpickrCSS = generateFlatpickrCSS();
    const flatpickrJS = generateFlatpickrJS();

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

    // Build combined JS
    const combinedJS = `
        ${jspdfJS}
        ${flatpickrJS}
        ${utilsJS}
        ${calculationsJS}
        ${appJS}
        ${pdfExportJS}
    `;

    // Create offline HTML
    let offlineHTML = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fristenrechner (Offline-Version) - Schweizer Rechtsmittelfristen</title>
    <style>
${combinedCSS}
    </style>
</head>
<body>
    <div class="container">
        <div class="offline-banner">
            <span>⚡ Offline-Version – Keine Internetverbindung erforderlich</span>
            <span class="version">Stand: ${new Date().toLocaleDateString('de-CH')}</span>
        </div>
`;

    // Extract body content from template (between <body> and </body>)
    const bodyMatch = htmlTemplate.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
        let bodyContent = bodyMatch[1];

        // Remove external script/link tags
        bodyContent = bodyContent.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*fonts[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*flatpickr[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*href="[^"]*font-awesome[^"]*"[^>]*>/gi, '');
        bodyContent = bodyContent.replace(/<link[^>]*rel="preconnect"[^>]*>/gi, '');

        // Remove language switcher (but keep dark mode toggle)
        bodyContent = bodyContent.replace(/<div class="language-switcher">[\s\S]*?<\/div>\s*<\/div>/gi, '</div>');

        // Remove navigation tabs (Fristenrechner/Verjährung/Kündigung)
        bodyContent = bodyContent.replace(/<nav class="tool-nav">[\s\S]*?<\/nav>/gi, '');

        // Fix relative paths
        bodyContent = bodyContent.replace(/href="\.\.\/de\//g, 'href="#');
        bodyContent = bodyContent.replace(/href="\.\.\/fr\//g, 'href="#');
        bodyContent = bodyContent.replace(/src="\.\.\/favicon\.svg"/g, 'src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ctext y=\'.9em\' font-size=\'90\'%3E📅%3C/text%3E%3C/svg%3E"');

        // Remove the container div that we already added
        bodyContent = bodyContent.replace(/<div class="container">/i, '');
        // Find and remove closing </div> for container (this is tricky, so we'll just append)

        offlineHTML += bodyContent;
    }

    offlineHTML += `
    <script>
${combinedJS}
    </script>
</body>
</html>`;

    // Write output file
    const outputPath = path.join(BUNDLE_DIR, 'fristenrechner-offline.html');
    fs.writeFileSync(outputPath, offlineHTML, 'utf8');

    const stats = fs.statSync(outputPath);
    console.log(`✅ Created: ${outputPath}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(0)} KB`);
}

// Run build
try {
    buildOfflineHTML();
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
