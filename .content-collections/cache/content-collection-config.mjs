// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { compileMarkdown } from "@content-collections/markdown";
var pages = defineCollection({
  name: "pages",
  directory: "content/pages",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    author: z.string()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx
    };
  }
});
var posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.md",
  schema: (z) => ({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    profileSocialUrl: z.string().optional(),
    profilePictureUrl: z.string().optional()
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      slug: document._meta.fileName.split(".")[0],
      url: `/posts/${document._meta.fileName.split(".")[0]}`,
      html
    };
  }
});
var content_collections_default = defineConfig({
  collections: [pages, posts]
});
export {
  content_collections_default as default
};
