import withAsyncStorageNextStorage from '../withAsyncStorageNextStorage';

jest.mock('expo/config-plugins', () => ({
  withGradleProperties: jest.fn((config, callback) => {
    // Simulate Expo's mod system: call the callback with the config
    return callback(config);
  }),
}));

describe('withAsyncStorageNextStorage', () => {
  it('adds AsyncStorage_useNextStorage=true to modResults', () => {
    const config = {
      name: 'TestApp',
      slug: 'test-app',
      modResults: [] as { type: string; key: string; value: string }[],
    };

    const result = withAsyncStorageNextStorage(config) as typeof config;

    expect(result.modResults).toEqual([
      {
        type: 'property',
        key: 'AsyncStorage_useNextStorage',
        value: 'true',
      },
    ]);
  });

  it('deduplicates existing AsyncStorage_useNextStorage entries', () => {
    const config = {
      name: 'TestApp',
      slug: 'test-app',
      modResults: [
        { type: 'property', key: 'AsyncStorage_useNextStorage', value: 'false' },
        { type: 'property', key: 'android.minSdkVersion', value: '21' },
      ],
    };

    const result = withAsyncStorageNextStorage(config) as typeof config;

    // The old entry should be removed and replaced with the new one
    expect(result.modResults).toEqual([
      { type: 'property', key: 'android.minSdkVersion', value: '21' },
      { type: 'property', key: 'AsyncStorage_useNextStorage', value: 'true' },
    ]);
  });

  it('preserves other gradle properties', () => {
    const config = {
      name: 'TestApp',
      slug: 'test-app',
      modResults: [
        { type: 'property', key: 'org.gradle.jvmargs', value: '-Xmx2048m' },
        { type: 'property', key: 'android.useAndroidX', value: 'true' },
      ],
    };

    const result = withAsyncStorageNextStorage(config) as typeof config;

    expect(result.modResults).toHaveLength(3);
    expect(result.modResults).toContainEqual({
      type: 'property',
      key: 'org.gradle.jvmargs',
      value: '-Xmx2048m',
    });
    expect(result.modResults).toContainEqual({
      type: 'property',
      key: 'android.useAndroidX',
      value: 'true',
    });
    expect(result.modResults).toContainEqual({
      type: 'property',
      key: 'AsyncStorage_useNextStorage',
      value: 'true',
    });
  });
});
