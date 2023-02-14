import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'rn-passkey' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Passkey = NativeModules.Passkey
  ? NativeModules.Passkey
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export const signUp = (
    {
        domain,
        displayName,
        userId,
        challenge,
        securityKey = false,
    }: PasskeySignUp
): Promise<PasskeySignUpResponse > => {
    return Passkey.signUpWith(
        domain,
        displayName,
        userId,
        challenge,
        securityKey
    );
}

export const signIn = (
    {
        domain,
        challenge,
        allowSavedPassword = false,
        preferLocallyAvailableCredentials = true,
        securityKey = false,
    }: PasskeySignIn
): Promise<PasskeySignInResponse> =>  {
    return Passkey.signInWith(
        domain,
        challenge,
        allowSavedPassword,
        preferLocallyAvailableCredentials,
        securityKey
    );
}

export const logIn = signIn;


export interface PasskeySignUp {
  domain: string,
  displayName: string,
  userId: string,
  challenge: string,
  securityKey?: boolean,
}
export interface PasskeySignIn {
  domain: string,
  challenge: string,
  allowSavedPassword?: boolean,
  preferLocallyAvailableCredentials?: boolean,
  securityKey?: boolean,
}

export interface PasskeySignUpResponse {
  credentialID: string,
  attestation: string,
  clientData: string,
}

export interface SignInWithPasskeyResponse {
  signedInWith: signInType.passkey,
  credentialID: string,
  authenticator: string,
  clientData: string,
  signature: string,
  userId: string,
}

export interface SignInWithPasswordResponse {
  signedInWith: signInType.password,
  user: string,
  password: string,
}

export enum signInType {
  passkey = 'passkey',
  password = 'password',
}

// create an new interface PasskeySignInResponse that allow two type: SignInWithPasskeyResponse or SignInWithPasskeyResponse
export type PasskeySignInResponse = SignInWithPasskeyResponse | SignInWithPasswordResponse;

