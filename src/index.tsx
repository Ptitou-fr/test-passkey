import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'rn-passkey' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// The iOS version need to be 15.0+
// The Android API level need to be 34+
const isPasskeyNotSupported =
  (Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) < 15) ||
  (Platform.OS === 'android' &&
    parseInt(Platform.Version as unknown as string, 10) < 34);
const VERSION_NOT_SUPPORTED =
  `Passkeys are only supported in ` +
  Platform.select({ ios: 'iOS version 15.0 or higher\n' }) +
  Platform.select({ android: 'Android API level 34 or higher\n' });

const passkeyNotSupported = {
  signUp: () => {
    throw new Error(VERSION_NOT_SUPPORTED);
  },
  signIn: () => {
    throw new Error(VERSION_NOT_SUPPORTED);
  },
};

const passkey = NativeModules.Passkey
  ? isPasskeyNotSupported
    ? passkeyNotSupported
    : NativeModules.Passkey
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

interface PasskeyInterface {
  signUp(
    domain: string,
    challenge: string,
    displayName: string,
    userId: string,
    options?: signUpOptions
  ): Promise<PasskeySignUpResponse>;

  signIn(
    domain: string,
    challenge: string,
    options?: signInOptions
  ): Promise<PasskeySignInResponse>;
}

interface signInOptions {
  allowSavedPassword?: boolean;
  preferLocallyAvailableCredentials?: boolean;
  securityKey?: boolean;
}

interface signUpOptions {
  securityKey?: boolean;
}
interface PasskeySignUpResponse {
  credentialID: string;
  attestation: string;
  clientData: string;
}

interface SignInWithPasskeyResponse {
  assertionType: AssertionType.PASSKEY;
  credentialID: string;
  authenticator: string;
  clientData: string;
  signature: string;
  userId: string;
}

interface SignInWithPasswordResponse {
  assertionType: AssertionType.PASSWORD;
  user: string;
  password: string;
}

interface SignInCancelledResponse {
  assertionType: AssertionType.CANCELED;
}

enum AssertionType {
  PASSKEY = 'passkey',
  PASSWORD = 'password',
  CANCELED = 'canceled',
}

type PasskeySignInResponse =
  | SignInWithPasskeyResponse
  | SignInWithPasswordResponse
  | SignInCancelledResponse;

const signIn = (
  domain: string,
  challenge: string,
  options?: signInOptions
): Promise<PasskeySignInResponse> => {
  return passkey.signIn(domain, challenge, options || {});
};
const signUp = (
  domain: string,
  challenge: string,
  displayName: string,
  userId: string,
  options?: signUpOptions
): Promise<PasskeySignUpResponse> => {
  return passkey.signUp(domain, challenge, displayName, userId, options || {});
};

export default passkey as PasskeyInterface;
export { signIn, signUp, AssertionType };
