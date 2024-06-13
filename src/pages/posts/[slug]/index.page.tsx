import React from 'react';

import { allPosts, Post } from 'contentlayer/generated';
import { format, parseISO } from 'date-fns';

import Head from 'next/head';
import Image from 'next/image';
import Box from '../../../components/Box';
import Container from '../../../components/Container';
import Spacer from '../../../components/Spacer';
import Text from '../../../components/Text';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import NotFound from 'src/pages/404.page';
import config from 'src/config';

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find(
    (post) => post._raw.flattenedPath.split('posts/')[1] === params?.slug,
  );
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return { title: config.getTitle(post.title) };
};

export const getStaticPaths = (async () => {
  return {
    paths: allPosts.map((post) => ({
      params: { slug: post._raw.flattenedPath.split('posts/')[1] },
    })),
    fallback: true,
  };
}) satisfies GetStaticPaths;

type Props = {
  postData: Post;
  notFound?: boolean;
};

export const getStaticProps: GetStaticProps<Props> = (async (context) => {
  const postData = allPosts.find(
    (post) =>
      post._raw.flattenedPath.split('posts/')[1] === context?.params?.slug,
  );

  // Return notFound if the post does not exist.
  if (!postData) return { props: { postData: null, notFound: true } };

  return { props: { postData } };
}) satisfies GetStaticProps<Props>;

export default function PostPage({
  postData,
  notFound,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (notFound || !postData) return <NotFound />;
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle(postData.title)}</title>
      </Head>
      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>{postData.title}</h1>
        </Text>{' '}
        {postData?.profilePictureUrl && (
          <>
            <Spacer mb={4} />
            <section
              id="profile-picture"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Image
                style={{ borderRadius: '100%' }}
                width={100}
                height={100}
                src={postData?.profilePictureUrl}
                alt={`A picture of the author: ${postData.author}`}
              ></Image>
            </section>
            <Spacer mb={4} />
          </>
        )}
        <Link href={postData.profileSocialUrl}>
          <Text fontSize={3} fontWeight="bold" textAlign={'center'}>
            <h2>{postData.author}</h2>
          </Text>
        </Link>
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
