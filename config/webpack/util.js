const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const postcssPresetEnv = require('postcss-preset-env');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const isServerless = !!!process.env.APP_PATH;

const PATHS = {
  src: process.env.APP_PATH
    ? path.resolve(process.env.APP_PATH, 'src')
    : process.cwd(),
  build: process.env.APP_PATH
    ? path.resolve(process.env.APP_PATH, 'build')
    : null,
  components: process.env.APP_PATH
    ? path.resolve('components')
    : path.resolve(__dirname, '../components'),
  assets: process.env.APP_PATH
    ? path.resolve('assets')
    : path.resolve(__dirname, '../assets'),
  shared: process.env.APP_PATH
    ? path.resolve('shared')
    : path.resolve(__dirname, '../shared'),
  /** Client side apps only */
  appConfig: process.env.APP_PATH
    ? path.resolve(process.env.APP_PATH, 'config.js')
    : '',
};

function getClientAppConfig() {
  if (fs.existsSync(PATHS.appConfig)) {
    const { appIconPath, ...rest } = require(PATHS.appConfig);
    return {
      appIconPath: path.resolve(process.env.APP_PATH, appIconPath),
      ...rest,
    };
  }
  return {
    appName: 'Default App',
    appIconPath: '',
    appPrimaryColor: '#fff',
    gcm_sender_id: '',
  };
}

function loadCSS({ use = [] }) {
  return {
    test: /\.css$/,
    include: [PATHS.src, PATHS.components, PATHS.shared],
    use: [
      ...use,
      {
        loader: 'css-loader',
        options: {
          modules: true,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: () => [postcssPresetEnv()],
        },
      },
    ],
  };
}

function createAnalyzer(dev = true) {
  return new BundleAnalyzerPlugin({
    analyzerMode: dev ? 'server' : 'static',
    openAnalyzer: !dev,
    reportFilename: path.join(PATHS.build, '/reports/bundle-analysis.html'),
  });
}

function getAliases() {
  // Read aliases from TS config, replicate here
  const {
    compilerOptions: { paths: aliases },
  } = require('../../tsconfig.json');
  const aliasesForWebpack = Object.keys(aliases)
    .map(aliasValue => {
      const [aliasPath] = aliases[aliasValue];
      const aliasForWebpack = aliasValue.replace('/*', '');
      const aliasPathForWebpack = path.resolve(aliasPath.replace('/*', ''));
      return {
        [aliasForWebpack]: aliasPathForWebpack,
      };
    })
    .reduce((acc, currObj) => {
      const [key] = Object.keys(currObj);
      return {
        ...acc,
        [key]: currObj[key],
      };
    });
  return aliasesForWebpack;
}

/** Loads all env vars from local .env file and returns an object which states where to set which env vars */
function getEnvVars(dotEnvPath = '.env') {
  let { parsed: envVars } = dotenv.config({ path: dotEnvPath });
  if (!envVars) {
    const { parsed } = dotenv.config({ path: '.env' });
    envVars = parsed;
    if (!envVars) throw new Error('Could not parse .env!');
  }
  const mapped = Object.keys(envVars).reduce((currObj, currVar) => {
    const [prefix, ...rest] = currVar.split('_');
    return {
      ...currObj,
      [prefix]: {
        ...currObj[prefix],
        [rest.join('_')]: envVars[currVar],
      },
    };
  }, {});
  return mapped;
}

module.exports = {
  PATHS,
  loadCSS,
  createAnalyzer,
  getAliases,
  getEnvVars,
  getClientAppConfig,
};
