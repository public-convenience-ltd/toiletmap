import React from 'react';

import { allPosts, Post } from 'content-collections';
import { format, parseISO } from 'date-fns';

import Head from 'next/head';
import Image from 'next/image';

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import config from '../../../config';
import NotFound from '../../../pages/404.page';
import Center from '../../../design-system/layout/Center';
import Stack from '../../../design-system/layout/Stack';
import Icon from '../../../design-system/components/Icon';

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

  const articleUrl = new URL(postData.url, 'https://toiletmap.org.uk');

  const socialShareText = encodeURIComponent(
    `Check out this post on the Toilet Map blog: ${postData.title} ${articleUrl}`,
  );

  const nativeShareObject = {
    title: config.getTitle(postData.title),
    text: `Check out this post on the Toilet Map blog`,
    url: articleUrl.toString(),
  };

  return (
    <div>
      <Head>
        <title>{config.getTitle(postData.title)}</title>
      </Head>
      <Center text={false} gutter={true} article={true}>
        <Stack space="xl">
          <section
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-m)',
            }}
          >
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: '1',
                minWidth: '300px',
              }}
            >
              <Stack space="xs">
                <section>
                  <h1>{postData.title}</h1>
                  <section
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <p>
                      By{' '}
                      {postData.authors.map((author, i) =>
                        author.social_url ? (
                          <span key={author.name}>
                            <Link href={author.social_url}>{author.name}</Link>
                            {i < postData.authors.length - 1 ? ',' : null}{' '}
                          </span>
                        ) : (
                          <>
                            <span key={author.name}>Author: {author.name}</span>
                            {i < postData.authors.length - 1 ? ',' : null}{' '}
                          </>
                        ),
                      )}
                      <span>
                        —{' '}
                        <time dateTime={postData.date}>
                          {format(parseISO(postData.date), 'LLLL d, yyyy')}
                        </time>
                      </span>
                    </p>
                  </section>
                </section>

                <section>
                  <Stack space="xs" direction="row">
                    <span>
                      <a
                        target="_blank"
                        title="Share on Bluesky"
                        href={`https://bsky.app/intent/compose?text=${socialShareText}`}
                      >
                        <Icon
                          icon="bluesky"
                          size="x-large"
                          width={'1rem'}
                          height={'1rem'}
                        />
                      </a>
                    </span>

                    <span>
                      <button
                        aria-live="polite"
                        title="Share"
                        onClick={() => {
                          navigator
                            .share(nativeShareObject)
                            .catch(console.error);
                        }}
                      >
                        <Icon
                          icon="share"
                          size="x-large"
                          width={'1rem'}
                          height={'1rem'}
                        />
                      </button>
                    </span>
                  </Stack>
                </section>
              </Stack>
            </section>

            <section
              style={{
                display: 'flex',
              }}
            >
              {postData.authors.map((author, i) => (
                <section
                  key={author.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: '125px',
                    marginLeft: `${i > 0 ? '-25px' : 0}`,
                  }}
                >
                  {author.profile_image_url && (
                    <section
                      id="profile-picture"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Image
                        style={{
                          borderRadius: '100%',
                          border: '4px solid var(--color-blue)',
                        }}
                        width={125}
                        height={125}
                        src={author.profile_image_url}
                        alt={`A picture of the author: ${author.name}`}
                      ></Image>
                    </section>
                  )}
                </section>
              ))}
            </section>
          </section>
          <article dangerouslySetInnerHTML={{ __html: postData.html }} />
        </Stack>
      </Center>
    </div>
  );
}
