const { withGradleProperties } = require('expo/config-plugins');

/**
 * Custom Expo config plugin that sets AsyncStorage_useNextStorage=true in
 * Android's gradle.properties. This tells @react-native-async-storage v2's
 * native layer to use the "next" storage backend (StorageSupplier.kt /
 * Room DB named "AsyncStorage") instead of the legacy SQLite "RKStorage".
 *
 * We need this because expo-build-properties does NOT support arbitrary
 * gradleProperties -- it silently ignores them. This plugin uses the
 * withGradleProperties mod from expo/config-plugins directly to ensure the
 * property actually reaches the generated gradle.properties file.
 *
 * NOTE: iOS is unaffected by this issue. On iOS, both async-storage v2 and v3
 * use the same SQLite-backed store accessed through the file system (no Room DB
 * vs SQLite split like on Android), so data is preserved across version changes.
 */
module.exports = function withAsyncStorageNextStorage(config) {
  return withGradleProperties(config, (modConfig) => {
    // Remove any existing entry to avoid duplicates
    modConfig.modResults = modConfig.modResults.filter(
      (item) =>
        !(item.type === 'property' && item.key === 'AsyncStorage_useNextStorage')
    );

    // Add the property
    modConfig.modResults.push({
      type: 'property',
      key: 'AsyncStorage_useNextStorage',
      value: 'true',
    });

    return modConfig;
  });
};
