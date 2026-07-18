import type { Persistence } from 'firebase/auth';

// The Firebase JS SDK's package.json "exports" map puts the platform-agnostic
// "types" condition before "react-native", so TypeScript never resolves the
// React Native entrypoint's types even though the runtime code resolves fine
// via Metro. This augmentation restores the missing type.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
