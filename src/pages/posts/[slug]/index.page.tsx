import { allPosts, Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';

import Head from 'next/head';
import React from 'react';
import Box from '../../../components/Box';
import Container from '../../../components/Container';
import Spacer from '../../../components/Spacer';
import Text from '../../../components/Text';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';

// export const generateMetadata = ({ params }: { params: { slug: string } }) => {
//   const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);
//   if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
//   return { title: post.title };
// };

export const getStaticPaths = (async () => {
  return {
    paths: allPosts.map((post) => ({
      params: { slug: post._raw.flattenedPath.split('posts/')[1] },
    })),
    fallback: true, // false or "blocking"
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async (context) => {
  const postData = allPosts.find(
    (post) =>
      post._raw.flattenedPath.split('posts/')[1] === context?.params?.slug,
  );

  // Return notFound if the post does not exist.
  if (!postData) return { props: { postData: null, notFound: true } };

  return { props: { postData } };
}) satisfies GetStaticProps<{
  postData: Post;
  notFound?: boolean;
}>;

export default function PostPage({
  postData,
  notFound,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!notFound) return null;
  return (
    <Box my={5}>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>{postData.title}</h1>
        </Text>{' '}
        <Spacer mb={4} />
        <Text fontSize={3} fontWeight="bold" textAlign={'center'}>
          <h2>{postData.author}</h2>
        </Text>
        <Text textAlign={'center'}>
          <time dateTime={postData.date}>
            {format(parseISO(postData.date), 'LLLL d, yyyy')}
          </time>
        </Text>
        <Spacer mb={5} />
        <div dangerouslySetInnerHTML={{ __html: postData.body.html }} />
      </Container>
    </Box>
  );
}