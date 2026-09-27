import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { createServer } from 'vite';

const appShellFiles = [
  '404.html',
  'photos/index.html',
  'settings/index.html',
  'sign-in/index.html',
  'create/index.html',
  'verify-email/index.html',
];

let didStart = false;

function stubFirebaseClientPlugin(root) {
  const stubPath = path.join(
    root,
    'src/prerender/firebase-client-stub.ts',
  );

  return {
    name: 'stub-firebase-client',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) {
        return null;
      }

      const specifier = source.split('?')[0];

      if (specifier !== './client' && specifier !== './client.ts') {
        return null;
      }

      const importerPath = importer.split('?')[0];
      const resolved = path.resolve(path.dirname(importerPath), specifier);

      if (
        resolved.replace(/\.ts$/, '')
        !== path.join(root, 'src/infrastructure/firebase/client')
      ) {
        return null;
      }

      return stubPath;
    },
  };
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function splitHoistedLinks(html) {
  const links = [];
  let rest = html;

  while (rest.startsWith('<link ')) {
    const end = rest.indexOf('>');

    if (end === -1) {
      break;
    }

    links.push(rest.slice(0, end + 1));
    rest = rest.slice(end + 1);
  }

  return { links, html: rest };
}

function fillDocument(shell, { title, description, html }) {
  const hoisted = splitHoistedLinks(html);
  const titleTag = `<title>${escapeHtml(title)}</title>`;
  const descriptionTag = `<meta name="description" content="${escapeHtml(description)}" />`;
  const appMarkup = `<div id="app">${hoisted.html}</div>`;

  const withTitle = shell.replace(
    /<title>[^<]*<\/title>/,
    () => titleTag,
  );
  const withDescription = withTitle.replace(
    /<meta\b[^>]*\bname="description"[^>]*>/,
    () => descriptionTag,
  );

  if (!withDescription.includes('<div id="app"></div>')) {
    throw new Error(
      'Built index.html is missing an empty <div id="app"></div>.',
    );
  }

  const withApp = withDescription.replace(
    '<div id="app"></div>',
    () => appMarkup,
  );

  if (hoisted.links.length === 0) {
    return withApp;
  }

  return withApp.replace(
    '</head>',
    () => `${hoisted.links.join('')}</head>`,
  );
}

function assertDocument(contents, page) {
  if (!contents.includes(`<title>${escapeHtml(page.title)}</title>`)) {
    throw new Error(`${page.outFile} is missing its title.`);
  }

  if (!contents.includes(page.heading)) {
    throw new Error(
      `${page.outFile} is missing heading "${page.heading}".`,
    );
  }

  if (!contents.includes('Sign in')) {
    throw new Error(`${page.outFile} is missing the logged-out header.`);
  }

  if (!contents.includes('/assets/') || !contents.includes('.js')) {
    throw new Error(`${page.outFile} is missing the root asset script.`);
  }

  if (
    contents.includes('src="./assets/')
    || contents.includes('href="./assets/')
  ) {
    throw new Error(`${page.outFile} uses a relative asset URL.`);
  }
}

function writeFile(rootFile, contents) {
  mkdirSync(path.dirname(rootFile), { recursive: true });
  writeFileSync(rootFile, contents);
}

export async function prerenderMarketingSite(root = process.cwd()) {
  if (didStart) {
    return;
  }

  didStart = true;

  const distDirectory = path.join(root, 'dist');
  const shell = readFileSync(
    path.join(distDirectory, 'index.html'),
    'utf8',
  );

  for (const relativePath of appShellFiles) {
    const target = path.join(distDirectory, relativePath);
    writeFile(target, shell);

    const written = readFileSync(target, 'utf8');

    if (!written.includes('<div id="app"></div>')) {
      throw new Error(`${relativePath} is not an empty app shell.`);
    }
  }

  const vite = await createServer({
    configFile: path.join(root, 'vite.config.ts'),
    root,
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'custom',
    plugins: [stubFirebaseClientPlugin(root)],
  });

  try {
    const renderer = await vite.ssrLoadModule(
      '/src/prerender/render-marketing-pages.tsx',
    );
    const pages = renderer.renderMarketingPages();

    for (const page of pages) {
      const contents = fillDocument(shell, page);
      const target = path.join(distDirectory, page.outFile);
      writeFile(target, contents);
      assertDocument(contents, page);
    }
  } finally {
    await vite.close();
  }
}
