const { override } = require('customize-cra');

module.exports = override((config) => {
  // Fix for the webpack-dev-server deprecation warnings
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      setupMiddlewares: (middlewares, devServer) => {
        if (config.devServer.onBeforeSetupMiddleware) {
          config.devServer.onBeforeSetupMiddleware(devServer);
        }
        if (config.devServer.onAfterSetupMiddleware) {
          config.devServer.onAfterSetupMiddleware(devServer);
        }
        return middlewares;
      },
    };
    delete config.devServer.onBeforeSetupMiddleware;
    delete config.devServer.onAfterSetupMiddleware;
  }
  return config;
});
