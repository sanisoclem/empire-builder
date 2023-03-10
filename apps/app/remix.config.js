/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    unstable_postcss: true,
  },
  serverDependenciesToBundle: [
    'react-dnd',
    'react-dnd-html5-backend',
    'dnd-core',
    '@react-dnd/invariant',
    '@react-dnd/shallowequal',
    '@react-dnd/asap'
  ]
};
