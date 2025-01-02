import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import remarkGfm from 'remark-gfm';
import { JSDOM } from 'jsdom';

function wrapTables(html: string) {
  const dom = new JSDOM(`<!DOCTYPE html>${html}`, {
    contentType: 'text/html',
  });

  // Select all table elements
  const tables = Array.from(dom.window.document.getElementsByTagName('table'));

  // Wrap each table with a div
  tables.forEach((table) => {
    const wrapper = dom.window.document.createElement('div');
    wrapper.setAttribute('class', 'table-wrapper');
    const parent = table.parentNode;
    if (parent) {
      parent.replaceChild(wrapper, table);
      wrapper.appendChild(table);
    }
  });

  return dom.serialize();
}

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    authors: z.array(
      z.object({
        name: z.string(),
        social_url: z.string().optional(),
        profile_image_url: z.string().optional(),
      }),
    ),
  }),
  transform: async (document, context) => {
    // @ts-expect-error -- TODO: fix this
    const html = await compileMarkdown(context, document, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [],
    });
    return {
      ...document,
      slug: document._meta.fileName.split('.')[0],
      url: `/posts/${document._meta.fileName.split('.')[0]}`,
      html: wrapTables(html),
    };
  },
});

export default defineConfig({
  collections: [posts],
});
