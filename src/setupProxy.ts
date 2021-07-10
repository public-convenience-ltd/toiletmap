/**
 * Proxy to the API for local UI-only dev
 *
 * see (https://create-react-app.dev/docs/proxying-api-requests-in-development#configuring-the-proxy-manually)
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app: { use: (arg0: string,arg1: any) => void; }) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.PROXY || `http://localhost:3000`,
      //secure: false,
      changeOrigin: true,
    })
  );
};
