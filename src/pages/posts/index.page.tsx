import React from 'react';

import { allPosts, Post } from 'content-collections';

import { format, parseISO } from 'date-fns';

import Head from 'next/head';
import Box from '../../components/Box';
import Container from '../../components/Container';
import Spacer from '../../components/Spacer';
import Text from '../../components/Text';

import styled from '@emotion/styled';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import config from '../../config';

type Props = {
  posts: Post[];
};

export const getStaticProps = (async () => {
  return { props: { posts: allPosts } };
}) satisfies GetStaticProps<Props>;

const PostWrapper = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
`;

export default function PostPage({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const postsAvailable = posts && posts.length > 0;
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('Blog')}</title>
      </Head>
      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>Toilet Map Blog</h1>
        </Text>
        <Spacer mb={5} />
        <PostWrapper>
          {!postsAvailable && (
            <Text fontSize={4} fontWeight="bold">
              <p>Our blog is currently out of paper—check back soon!</p>
            </Text>
          )}
          {postsAvailable &&
            posts.map((postData) => (
              <Box
                key={postData._meta.fileName}
                display="flex"
                flexDirection="column"
                flex="50%"
              >
                <Link
                  href={postData.url}
                  style={{ display: 'flex', gap: '.2rem' }}
                >
                  <Text fontSize={4} fontWeight="bold">
                    <h2>{postData.title}</h2>
                  </Text>
                </Link>
                <Box style={{ display: 'inline-flex', gap: '.2rem' }}>
                  {postData.profileSocialUrl ? (
                    <Link
                      href={postData.profileSocialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Text>{postData.author}</Text>
                    </Link>
                  ) : (
                    <Text>{postData.author}</Text>
                  )}
                  <Text>—</Text>
                  <Text>
                    <time dateTime={postData.date}>
                      {format(parseISO(postData.date), 'LLLL d, yyyy')}
                    </time>
                  </Text>
                </Box>
              </Box>
            ))}
        </PostWrapper>
      </Container>
    </Box>
  );
}
