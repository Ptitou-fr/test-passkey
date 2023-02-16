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
  signUpWith(
    domain: string,
    displayName: string,
    userId: string,
    challenge: string,
    securityKey?: boolean
  ): Promise<PasskeySignUpResponse>;

  signInWith(
    domain: string,
    challenge: string,
    allowSavedPassword?: boolean,
    preferLocallyAvailableCredentials?: boolean,
    securityKey?: boolean
  ): Promise<PasskeySignInResponse>;
}

export default passkey as PasskeyInterface;

export interface PasskeySignUpResponse {
  credentialID: string;
  attestation: string;
  clientData: string;
}

export interface SignInWithPasskeyResponse {
  signedInWith: SignInType.withPasskey;
  credentialID: string;
  authenticator: string;
  clientData: string;
  signature: string;
  userId: string;
}

export interface SignInWithPasswordResponse {
  signedInWith: SignInType.withPassword;
  user: string;
  password: string;
}

export enum SignInType {
  withPasskey = 'passkey',
  withPassword = 'password',
}

// create an new interface PasskeySignInResponse that allow two type: SignInWithPasskeyResponse or SignInWithPasskeyResponse
export type PasskeySignInResponse =
  | SignInWithPasskeyResponse
  | SignInWithPasswordResponse;
