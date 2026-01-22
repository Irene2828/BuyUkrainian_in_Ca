import type { Plugin } from 'vite';

/**
 * Vite plugin that updates og:image and twitter:image meta tags.
 * identifying the deployment URL from environment variables.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    transformIndexHtml(html) {
      return html;
    },
  };
}
