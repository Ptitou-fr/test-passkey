import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'rn-passkey' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const passkey = NativeModules.Passkey
  ? NativeModules.Passkey
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
    options?: signUpOptions,
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
export default passkey as PasskeyInterface;

export interface PasskeySignUpResponse {
  credentialID: string;
  attestation: string;
  clientData: string;
}

export interface SignInWithPasskeyResponse {
  assertionType: AssertionType.PASSKEY;
  credentialID: string;
  authenticator: string;
  clientData: string;
  signature: string;
  userId: string;
}

export interface SignInWithPasswordResponse {
  assertionType: AssertionType.PASSWORD;
  user: string;
  password: string;
}

export interface SignInCancelledResponse {
  assertionType: AssertionType.CANCELED;
}

export enum AssertionType {
  PASSKEY = 'passkey',
  PASSWORD = 'password',
  CANCELED = 'canceled',
}

// create a new interface PasskeySignInResponse that allow two type: SignInWithPasskeyResponse or SignInWithPasskeyResponse
export type PasskeySignInResponse =
  | SignInWithPasskeyResponse
  | SignInWithPasswordResponse
  | SignInCancelledResponse;
