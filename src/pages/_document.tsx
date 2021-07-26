import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    if(typeof window !== 'undefined') {
      window.plausible = window.plausible || function() {(window.plausible.q = window.plausible.q || []).push(arguments)}
    }

    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <title>The Great British Public Toilet Map</title>
          <meta
            name="Description"
            content="The Great British Public Toilet Map is the UK's largest database of publicly-accessible toilets, with over 11000 facilities."
          />
          <script async defer data-domain="toiletmap.org.uk" src="https://stats.toiletmap.org.uk/js/index.js"></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument