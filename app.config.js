// Dynamic Expo config. Static fields live in app.json and arrive here as
// `config` (Expo reads app.json first, then hands it to this function); this
// file only adjusts Android permissions based on the EAS build profile.
module.exports = ({ config }) => {
  const profile = process.env.EAS_BUILD_PROFILE;
  // Standalone installables never talk to the network. Keep INTERNET only
  // for the development client so Metro can serve the JS bundle.
  const isStandaloneBuild = profile === 'production' || profile === 'preview';

  const blockedPermissions = [...(config.android?.blockedPermissions ?? [])];

  if (isStandaloneBuild) {
    blockedPermissions.push('android.permission.INTERNET');
  }

  return {
    ...config,
    android: {
      ...config.android,
      blockedPermissions,
    },
  };
};
