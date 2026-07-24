// Dynamic Expo config. Static fields live in app.json; this file only
// adjusts Android permissions based on the EAS build profile.
const appJson = require('./app.json');

const profile = process.env.EAS_BUILD_PROFILE;
// Standalone installables never talk to the network. Keep INTERNET only
// for the development client so Metro can serve the JS bundle.
const isStandaloneBuild =
  profile === 'production' || profile === 'preview';

const blockedPermissions = [
  ...(appJson.expo.android?.blockedPermissions ?? []),
];

if (isStandaloneBuild) {
  blockedPermissions.push('android.permission.INTERNET');
}

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      blockedPermissions,
    },
  },
};
