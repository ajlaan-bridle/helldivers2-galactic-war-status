const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.helldivers2.dev',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep the /api path
      },
      onProxyReq: function(proxyReq, req, res) {
        // Always add required headers for Helldivers 2 API
        proxyReq.setHeader('X-Super-Client', 'aj');
        proxyReq.setHeader('X-Super-Contact', 'aj');
        
        // Also preserve any headers sent from the client
        if (req.headers['x-super-client']) {
          proxyReq.setHeader('X-Super-Client', req.headers['x-super-client']);
        }
        if (req.headers['x-super-contact']) {
          proxyReq.setHeader('X-Super-Contact', req.headers['x-super-contact']);
        }
      },
      logLevel: 'info',
    })
  );
};
