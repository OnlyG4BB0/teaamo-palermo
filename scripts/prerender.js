import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, 'dist');
const indexPath = path.resolve(distPath, 'index.html');
const notFoundPath = path.resolve(distPath, '404.html');

async function prerender() {
  const startTime = Date.now();
  console.log('⚡ Starting static pre-rendering (SSG) for TEAAMO® Palermo...');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`dist/index.html not found! Run "vite build" first before pre-rendering.`);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');

  const base = process.env.BASE_URL || '/teaamo-palermo/';

  // Launch Vite in SSR mode to render App component
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: projectRoot,
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });

  try {
    const { renderToString } = await import('react-dom/server');
    const React = await import('react');
    const { App } = await vite.ssrLoadModule('/src/App.tsx');

    console.log('📦 Rendering React component tree to static HTML markup...');
    const appHtml = renderToString(React.createElement(App));

    console.log(`✓ Rendered static HTML: ${appHtml.length.toLocaleString()} characters`);

    // Inject into root element (supports both clean build and re-running prerender)
    const rootStart = template.indexOf('<div id="root">');
    if (rootStart === -1) {
      throw new Error(`Target '<div id="root">' not found in dist/index.html`);
    }
    const bodyClose = template.indexOf('</body>', rootStart);
    if (bodyClose === -1) {
      throw new Error(`Target '</body>' not found after root element in dist/index.html`);
    }

    const beforeRoot = template.slice(0, rootStart);
    const afterRoot = template.slice(bodyClose);
    const preRenderedHtml = `${beforeRoot}<div id="root">${appHtml}</div>\n  ${afterRoot}`;

    // Write back to dist/index.html
    fs.writeFileSync(indexPath, preRenderedHtml, 'utf-8');
    console.log(`✓ Updated ${path.relative(projectRoot, indexPath)} with pre-rendered markup`);

    // Duplicate index.html to 404.html with GitHub Pages SPA redirect helper
    const spaRedirectScript = `
    <!-- GitHub Pages SPA Route Redirect Helper -->
    <script>
      (function() {
        var pathname = window.location.pathname;
        var base = '${base.replace(/\/$/, '')}';
        if (pathname.startsWith(base)) {
          var sub = pathname.slice(base.length).replace(/^\\/+/, '');
          if (sub && !sub.includes('.')) {
            window.history.replaceState(null, null, base + '/#' + sub);
          }
        }
      })();
    </script>
  </head>`;

    const notFoundHtml = preRenderedHtml.replace('</head>', spaRedirectScript);
    fs.writeFileSync(notFoundPath, notFoundHtml, 'utf-8');
    console.log(`✓ Created ${path.relative(projectRoot, notFoundPath)} with SPA route redirect for GitHub Pages`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Static pre-rendering completed successfully in ${elapsed}s!`);
  } catch (error) {
    console.error('❌ Pre-rendering failed:', error);
    process.exit(1);
  } finally {
    await vite.close();
  }
}

prerender();
