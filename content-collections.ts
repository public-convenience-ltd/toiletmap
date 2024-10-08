import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMDX } from '@content-collections/mdx';
import { compileMarkdown } from '@content-collections/markdown';

const pages = defineCollection({
  name: 'pages',
  directory: 'content/pages',
  include: '**/*.mdx',
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    author: z.string(),
  }),
  transform: async (document, context) => {
    // @ts-expect-error -- TODO: fix this
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
    };
  },
});

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    profileSocialUrl: z.string().optional(),
    profilePictureUrl: z.string().optional(),
  }),
  transform: async (document, context) => {
    // @ts-expect-error -- TODO: fix this
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      slug: document._meta.fileName.split('.')[0],
      url: `/posts/${document._meta.fileName.split('.')[0]}`,
      html,
    };
  },
});

export default defineConfig({
  collections: [pages, posts],
});

// export const Post = defineDocumentType(() => ({
//   name: 'Post',
//   filePathPattern: `posts/**/*.md`,
//   fields: {
//     title: { type: 'string', required: true },
//     date: { type: 'date', required: true },
//     author: { type: 'string', required: true },
//     profileSocialUrl: { type: 'string', required: false },
//     profilePictureUrl: { type: 'string', required: false },
//   },
//   computedFields: {
//     url: {
//       type: 'string',
//       resolve: (post) => `/posts/${post._raw.flattenedPath}`,
//     },
//   },
// }));
