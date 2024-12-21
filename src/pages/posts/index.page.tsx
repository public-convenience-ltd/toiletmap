import React from 'react';

import { allPosts, Post } from 'content-collections';

import { format, parseISO } from 'date-fns';

import Head from 'next/head';

import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import config from '../../config';
import Center from '../../design-system/layout/Center';
import Stack from '../../design-system/layout/Stack';

type Props = {
  posts: Post[];
};

export const getStaticProps = (async () => {
  return { props: { posts: allPosts } };
}) satisfies GetStaticProps<Props>;

export default function PostPage({
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const postsAvailable = posts && posts.length > 0;
  return (
    <div>
      <Head>
        <title>{config.getTitle('Blog')}</title>
      </Head>
      <Center text={false} gutter={true}>
        <Stack space="xl">
          <h1 style={{ textAlign: 'center' }}>Toilet Map Blog</h1>

          {!postsAvailable && (
            <h2>Our blog is currently out of paper—check back soon!</h2>
          )}
          {postsAvailable &&
            posts.map((postData) => (
              <div
                key={postData._meta.fileName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '50%',
                }}
              >
                <Link
                  href={postData.url}
                  style={{ display: 'flex', gap: '.2rem' }}
                >
                  <h2>{postData.title}</h2>
                </Link>
                <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                  {postData.authors.map((author, i) => (
                    <>
                      {author.social_url ? (
                        <Link
                          href={author.social_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={author.name}
                        >
                          {author.name}
                        </Link>
                      ) : (
                        <span>{author.name}</span>
                      )}
                      {i < postData.authors.length - 1 ? <span>,</span> : null}
                    </>
                  ))}
                  <span>—</span>
                  <span>
                    <time dateTime={postData.date}>
                      {format(parseISO(postData.date), 'LLLL d, yyyy')}
                    </time>
                  </span>
                </div>
              </div>
            ))}
        </Stack>
      </Center>
    </div>
  );
}
