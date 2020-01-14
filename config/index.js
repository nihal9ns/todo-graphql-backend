const fs = require("fs");

const LOCAL = "local";
const STAGE = "stage";
const DEVELOP = "develop";
const PROD = "prod";

const listOfEnvironments = [LOCAL, STAGE, DEVELOP, PROD];

const envMapper = env => {
  const environments = {
    [LOCAL]: () => getConfigFile(env),
    [STAGE]: () => getConfigFile(env),
    [DEVELOP]: () => getConfigFile(env),
    [PROD]: () => getConfigFile(env)
  };

  const mappedEnv = environments[env];
  return mappedEnv ? mappedEnv() : null;
};

const getConfigFile = env => {
  const config = fs.readFileSync(`config/${env}.json`, "utf8");
  return config ? config : null;
};

const getConfig = () => {
  const env = process.env.NODE_ENV;
  console.log("env : ", env);

  if (!listOfEnvironments.includes(env)) {
    console.log(`No such env config available for ${env}.`);
    return;
  }

  const config = envMapper(env);

  if (!config) {
    console.log(`Failed to fetch config for env ${env}`);
  }

  return config;
};

module.exports = { getConfig };
