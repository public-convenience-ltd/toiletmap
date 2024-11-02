import React from 'react';

import { allPosts, Post } from 'content-collections';
import { format, parseISO } from 'date-fns';

import Head from 'next/head';
import Image from 'next/image';

import Container from '../../../components/Container';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import config from '../../../config';
import NotFound from '../../../pages/404.page';

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post.slug === params?.slug);
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`);
  return { title: config.getTitle(post.title) };
};

export const getStaticPaths = (async () => {
  return {
    paths: allPosts.map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: true,
  };
}) satisfies GetStaticPaths;

type Props = {
  postData: Post;
  notFound?: boolean;
};

export const getStaticProps: GetStaticProps<Props> = (async (context) => {
  const postData = allPosts.find((post) => post.slug === context?.params?.slug);

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
    <div
      style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}
    >
      <Head>
        <title>{config.getTitle(postData.title)}</title>
      </Head>
      <Container maxWidth={845}>
        <section
          style={{
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <section>
            <h1 style={{ fontWeight: 600 }}>{postData.title}</h1>
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {postData.profileSocialUrl ? (
                <span>
                  Author:{' '}
                  <Link href={postData.profileSocialUrl}>
                    {postData.author}{' '}
                  </Link>
                </span>
              ) : (
                <span>Author: {postData.author}</span>
              )}
              <span>
                Published:{' '}
                <time dateTime={postData.date}>
                  {format(parseISO(postData.date), 'LLLL d, yyyy')}
                </time>
              </span>
            </section>
          </section>

          <section
            style={{
              display: 'flex',
            }}
          >
            {postData?.profilePictureUrl && (
              <section
                id="profile-picture"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Image
                  style={{
                    borderRadius: '100%',
                    border: '4px solid var(--color-blue)',
                  }}
                  width={150}
                  height={150}
                  src={postData?.profilePictureUrl}
                  alt={`A picture of the author: ${postData.author}`}
                ></Image>
              </section>
            )}
          </section>
        </section>
        <article dangerouslySetInnerHTML={{ __html: postData.html }} />
      </Container>
    </div>
  );
}
