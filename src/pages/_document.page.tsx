import { Html, Head, Main, NextScript } from 'next/document';
import { mediaStyle } from '../components/Media';

const Document = () => {
  return (
    <Html lang="en">
      <Head>

       {/* Added meta description for SEO improvement as part of issue #1736 */} 

      
        <meta
          name="description"
          content="Explore the Great British Public Toilet Map. 
          Find and contribute to the locations of public toilets across the UK, 
          helping improve accessibility for everyone."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          id="media-bps"
          type="text/css"
          dangerouslySetInnerHTML={{ __html: mediaStyle }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
