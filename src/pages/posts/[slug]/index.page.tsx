import { format, parseISO } from 'date-fns';
import { allPosts } from 'contentlayer/generated';

import React from 'react';
import Head from 'next/head';
import Container from '../../../components/Container';
import Text from '../../../components/Text';
import Spacer from '../../../components/Spacer';
import Box from '../../../components/Box';

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
  console.log(context);
  return { props: { slug: context.params?.slug as string | undefined } };
}) satisfies GetStaticProps<{
  slug: string;
}>;

export default function Post({
  slug,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const post = allPosts.find(
    (post) => post._raw.flattenedPath.split('posts/')[1] === slug,
  );

  return (
    <Box my={5}>
      <Head>
        <title>{post.title}</title>
      </Head>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>{post.title}</h1>
        </Text>{' '}
        <Spacer mb={4} />
        <Text fontSize={3} fontWeight="bold" textAlign={'center'}>
          <h2>{post.author}</h2>
        </Text>
        <Text textAlign={'center'}>
          <time dateTime={post.date}>
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
        </Text>
        <Spacer mb={5} />
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} />
      </Container>
    </Box>
  );
}
