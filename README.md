# @passkey/native

The @passkey/native module enables users to sign in to your app without typing a password, providing an alternative user authentication method that is easier to use and more secure than traditional passwords. Passkeys can be used on devices running iOS 15 and above, as well as Android API level 34 and above. For older versions of Android and iOS, this library provides a fallback option.

Learn more about passkeys: [Google](https://developers.google.com/identity/passkeys), [Apple](https://developer.apple.com/passkeys/).

## Installation
###### To install the library, use either npm or yarn:
```sh
npm install @passkey/native
```
###### or yarn:
```sh
yarn add @passkey/native
```
###### Then install the native dependencies:
``` sh
cd ios && pod install
```
### Android

### iOS
To use passkeys on iOS, you must associate a domain with your app by following these steps:

1) On your domain website server, create a JSON file named apple-app-site-association (without an extension) with the following structure ([apple doc](https://developer.apple.com/documentation/xcode/supporting-associated-domains)):
    ```json
    {
      "webcredentials": {
        "apps": [ "ABCDE12345.com.example.app" ]
      }
    }
    ```
   Replace ABCDE12345 with your own teamID ([locate your Team ID](https://developer.apple.com/help/account/manage-your-team/locate-your-team-id)) and `com.example.app with` your app's bundle identifier.


2) Place this JSON file in your site's .well-known directory at the root of your domain. The file should be served at:
    ```
     GET https://example.com/.well-known/apple-app-site-association
    ```
   Replace `example.com` with your own domain ([apple doc](https://developer.apple.com/documentation/xcode/supporting-associated-domains)).


3) In your app, add the `Associated Domains` capability ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)):
  - Open your app with Xcode,
  - Select your app target ([steps 1, 2 , and 3](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)),
  - Go to the Signing & Capabilities tab ([step 4](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)),
  - Click '+ Capability' ([step 5](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)), then add the 'Associated Domains' capability,
  - Inside 'Associated Domains' capability box, click the (+) button to add a placeholder domain ([example](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotAssociatedDomains.png)).<br>
    Replace `example.com` with your onw domain.

    For debugging purposes or if your server is unreachable from the public internet, you can use the alternate mode feature ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)). For example:
    ````makefile
    webcredentials:example.com?mode=developer
    ````

## Terminology
@passkey/native uses the following terms:
- `Passkey:` A cryptographically secure identifier that allows users to sign in to an app without typing a password.
- `Attestation:` The process of generating a cryptographic signature that links a passkey to a user's device.
- `Assertion:` The process of generating a cryptographic signature that proves a user's ownership of a passkey.

## Usage
@passkey/native exposes the following methods:
- `signIn`: Authenticate an user with an exiting passkey or a saved password.
- `signUp`: Create a passkey to register a new user.

```ts
  import passkey from '@passkey/native';
  // then use passkey.signIn() or passkey.signUp()

  // or ES6+ destructuring syntax
  import { signIn, signUp } from '@passkey/native';
```

### signIn
#### parameters:
  - `domain`: string - Your domain (the one associate with your app).
  - `challenge`: string - Obtain a challenge from your server. The challenge needs to be unique for each request and has to be a Base64 string.
  - `options?`: Object - An object with the following properties:
    - `allowSavedPassword?`: boolean (default value: False) - if true, the user can use an existing passkey or an already saved password, if they have one. If false: the user can only use an existing passkey.
    - `preferLocallyAvailableCredentials?`: boolean (default value: False) -  If true and credentials are available locally, the system prompts a signIn UI modal. If no credentials are available locally, the request ends silently, and no UI appears. If false, the system prompts a signIn UI modal anyway.
    - `securityKey?`: boolean (default value: False) - if True, the system signIn UI modal shows an option to use of a passkey saved in an external securityKey. If False, the system signIn UI modal doesn't show an option to use of a passkey saved in an external securityKey.

#### return value:
The signIn returns a Promise that resolves to an object with the following properties:<br>
- If a passkey was used to signIn:
  - `signedInWith`: string - In this case, assertion = 'passkey'.
  - `id`: string - The assertion credentialID.
  - `response`: Object - The assertion response object with the following properties:
    - `authenticatorData`: string - A byte sequence that contains additional information about the credential. To learn more, see the [W3C WebAuthn specification](https://www.w3.org/TR/webauthn-2/#authenticator-data).
    - `clientDataJSON`: string - A byte sequence that contains information about the client and the authentication ceremony. To learn more, see the [W3C WebAuthn specification](https://www.w3.org/TR/webauthn-2/#client-data).
    - `signature`: string - The signature for this assertion.
    - `userId`: string - The user identifier for this assertion.

- If a saved password was used to signIn:<br>
  - `signedInWith`: string - In this case, assertion = 'password'.
  - `user`: string - The user identifier for this assertion.
  - `password`: string - The password for this assertion.

### signUp:
#### signUp parameters:
- `domain`: string - Your domain (the one associate with your app).
- `challenge`: string - Obtain a challenge from your server. The challenge needs to be unique for each request and has to be a Base64 string.
- `userName`: string - The user-visible name that identifies a passkey on the user device.
- `userID`: string - The identifier that your server associates with this user or this passkey.
- `options?`: Object -  Options is an object with the following properties:
  - `securityKey?`: boolean (default value: False) - If true, the new passkey will be stored in an external securityKey device.

#### signUp return value:
The signUp returns a Promise that resolves to an object with the following properties:
- `id`: string - The assertion credentialID.
- `response`: Object - The assertion response object with the following properties:
  - `attestationObject`: string - The attestation contains the user's public key that you have to store on your server. You will need it to verify the signature of the assertions.
  - `clientDataJSON`: string - A byte sequence that contains information about the client and the authentication ceremony.

## examples:
#### Signing in with a passkey or saved password on app launch
We recommend to use this 'silent' signIn option on your app launch if the user is not already logged in.
- If there is a passkey in the device, the system shows a signIn UI modal.
=> The user can log in safely with only one click.
- If there is no passkey in the device, the request ends silently.
=> Time to show a login or signUp screen to the user.
```ts
import { signIn, AssertionType } from '@passkey/native';

const domain = 'example.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge need to be a Base64 string.
const challenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
const options = {
  preferLocallyAvailableCredentials: true,
  allowSavedPassword: true,
};

try {
  const assertion = await signIn(
    domain,
    challenge,
    options
  );
  if ( assertion.signedInWith === AssertionType.PASSKEY ) {
    // Verify the signature and clientDataJson with your server forthe given userId.
    // ...
    // then, if the signature is valid, you can sign in the user.
  } else {
    // assertion.signedInWith === AssertionType.PASSWORD
    // verify the credentials (userName and password) with your server.
    // ...
    // then, if the credentials are valid, you can sign in the user.
    // This is a good time to offer the user to create a passkey.
  }
} catch (error) {
  // it can be:
  // - an error => Handle the error.
  // or
  // - either no credentials are available locally and the request abords silently,
  // or the user cancelled the request => Time to show your login or signUp screen to the user.

  // Note: the error.message cointains useful information about the error.
}
```
#### Signing in with a passkey in response to a user's action
As this signIn is not silent (an UI modal is always shown to the user).
For user experience reasons, we recommend using it in response to a user's action, like a 'Login with a passkey' button press.
```ts
import { signIn, AssertionType } from '@passkey/native';

const domain = 'example.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge has to be a Base64 string.
const challenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';

try {
  const assertion = await signIn(
    domain,
    challenge
  );
  if ( assertion.signedInWith === AssertionType.PASSKEY ) {
    // Verify the signature and clientDataJson with your server forthe given userId.
    // ...
    // then, if the signature is valid, you can sign in the user.
  }
} catch (error) {
  // Handle error or user cancellation.
  // Note: the error.message cointains useful information about the error.
}
```

#### SignUp - Create a new passkey
```ts
import { signUp } from '@passkey/native';

const domain = 'example.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge has to be a Base64 string.
const challenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
// The user-visible name to identifies the passkey.
// the only data you have to ask the user for.
const userName = 'John Doe';
// An identifier from your server that you want to associate with the user.
const userID = '123456789';

try {
  const attestation = await signUp(
    domain,
    challenge,
    userName,
    userID
  );
  // Attestation containts the user's public key that you have to store on your server.
  // You will need it to verify the signature of the assertions.
  // userName and userID are the same as the ones you passed to the signUp function.

  // after your server has verified the attestation, it can create a new user account.
  // then you can sign in the user.
} catch (error) {
  // Handle error or user cancellation.
  // Note: the error.message cointains useful information about the error.
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

