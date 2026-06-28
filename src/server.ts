import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import fs from 'node:fs';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// API endpoint to create and save a new blog post locally
app.post('/api/blogs', express.json(), (req, res) => {
  try {
    const newPost = req.body;
    if (!newPost.title || !newPost.slug || !newPost.content) {
      return res.status(400).json({ error: 'Title, slug, and content are required' });
    }

    const possiblePaths = [
      join(process.cwd(), 'public', 'blogs.json'),
      join(process.cwd(), 'dist', 'betterthanthebasic', 'browser', 'blogs.json'),
      join(process.cwd(), 'browser', 'blogs.json'),
    ];

    let foundPath = null;
    let blogs = [];

    // Find the primary source file first, or whichever exists
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const fileContent = fs.readFileSync(p, 'utf8');
          blogs = JSON.parse(fileContent);
          foundPath = p;
          break;
        } catch (e) {
          console.error(`Error reading ${p}:`, e);
        }
      }
    }

    if (!foundPath) {
      return res.status(500).json({ error: 'blogs.json not found on disk' });
    }

    // Check if slug already exists to prevent duplicates
    if (blogs.some((b: any) => b.slug === newPost.slug)) {
      return res.status(400).json({ error: `A blog post with slug "${newPost.slug}" already exists.` });
    }

    // Prepend the new post
    blogs.unshift(newPost);
    const updatedContent = JSON.stringify(blogs, null, 2);

    // Write to all paths that exist to keep dev server and source in sync
    let writeCount = 0;
    for (const p of possiblePaths) {
      if (fs.existsSync(p) || p.endsWith(join('public', 'blogs.json'))) {
        fs.writeFileSync(p, updatedContent, 'utf8');
        writeCount++;
      }
    }

    return res.json({ success: true, message: `Blog post added successfully. Updated ${writeCount} file locations.` });
  } catch (error: any) {
    console.error('Error adding blog post:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
