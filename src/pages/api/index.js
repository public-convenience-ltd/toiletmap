import api from '../../api';
const { createProxyMiddleware } = require('http-proxy-middleware');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default process.env.PROXY
  ? createProxyMiddleware({
      target: process.env.PROXY,
      changeOrigin: true,
    })
  : api.createHandler({
      path: '/api',
    });
