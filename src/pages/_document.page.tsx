import { Html, Head, Main, NextScript } from 'next/document';
import { mediaStyle } from '../components/Media';

const Document = () => {
  return (
    <Html>
      <Head>
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
