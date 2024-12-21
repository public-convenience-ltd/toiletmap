import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import remarkGfm from 'remark-gfm';

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
      html,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
