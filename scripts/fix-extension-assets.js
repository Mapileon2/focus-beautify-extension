import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the dist directory path
const distDir = path.resolve(__dirname, '../dist');

// Read the main index.html to extract asset references
const indexHtmlPath = path.join(distDir, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

// Extract script and link tags from index.html
const scriptMatches = indexHtml.match(/<script[^>]*src="[^"]*"[^>]*><\/script>/g) || [];
const linkMatches = indexHtml.match(/<link[^>]*href="[^"]*"[^>]*>/g) || [];

// Create the asset references HTML
const assetReferences = [...scriptMatches, ...linkMatches].join('\n    ');

// Template for the HTML files
const createHtmlTemplate = (title, route) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${assetReferences}
</head>
<body>
    <div id="root" data-route="${route}"></div>
</body>
</html>`;

// Update dashboard.html
const dashboardHtmlPath = path.join(distDir, 'dashboard.html');
const dashboardHtml = createHtmlTemplate('Focus Timer - Dashboard', 'dashboard');
fs.writeFileSync(dashboardHtmlPath, dashboardHtml);

// Update fullapp.html
const fullappHtmlPath = path.join(distDir, 'fullapp.html');
const fullappHtml = createHtmlTemplate('Focus Timer - Full App', 'fullapp');
fs.writeFileSync(fullappHtmlPath, fullappHtml);

console.log('✅ Extension HTML files updated with correct asset references');
console.log('📁 Updated files:');
console.log('  - dashboard.html');
console.log('  - fullapp.html');