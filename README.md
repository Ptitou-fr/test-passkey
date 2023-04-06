# rn-passkey

Passkeys allow users to sign in to your app without typing a password.

It's an alternative method of user authentication that eliminates the need for a password while being easier to use and far more secure. Learn more about passkeys: [Google](https://developers.google.com/identity/passkeys), [Apple](https://developer.apple.com/passkeys/).

It helps improving the user experience.

> Passkeys are available on devices running:
> - iOS 15 and above.
> - Android API level 34 and above.
>
>This library provides a fail-over for older versions of android and iOS.

## Installation
###### Install the library using either npm:
```sh
npm install rn-passkey
```
###### or yarn:
```sh
yarn add rn-passkey
```
###### Then install the native dependencies:
``` sh
cd ios && pod install
```
### Android

### iOS
To use passkeys on iOS you have to associate a domain with your app.<br>
To do so:

- On your domain website server ([apple doc](https://developer.apple.com/documentation/xcode/supporting-associated-domains)):

  - Construct a JSON file named apple-app-site-association (without an extension) with the following structure:
    ```json
    {
      "webcredentials": {
        "apps": [ "ABCDE12345.com.example.app" ]
      }
    }
    ```
    in which you replace:<br>
    `'ABCDE12345'` with your own teamID ([locate your Team ID](https://developer.apple.com/help/account/manage-your-team/locate-your-team-id))<br>
    and<br>
    `'com.example.app'` with your own app's bundle identifier.
  - Place this JSON file in your site's '.well-known' directory at the root of your domain. So it's served at
    ```
     GET https://example.com/.well-known/apple-app-site-association
    ```
    in which you replace:<br>
    `'example.com'` with your own domain ([apple doc](https://developer.apple.com/documentation/xcode/supporting-associated-domains)).

- In your app, add the `Associated Domains` capability ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)):
  - Open your app with Xcode,
  - Select your app target ([steps 1, 2 , and 3](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)),
  - Go to the Signing & Capabilities tab ([step 4](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)),
  - Click '+ Capability' ([step 5](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotSigningCapability.png)), then add the 'Associated Domains' capability,
  - Inside 'Associated Domains' capability box, click the (+) button to add a placeholder domain.<br>
    This should add a service `'webcredentials:example.com'` ([example](https://github.com/Ptitou-fr/test-passkey/blob/main/gitAssets/screenshotAssociatedDomains.png)).<br>
    Replace 'example.com' with your onw domain.
    > While you're developing your app, for debugging purposes or if your server is unreachable from the public internet, you can use the alternate mode feature ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)).<br>
    > For example: webcredentials:example.com?mode=developer

## Usage

rn-passkey exposes the following methods:
- `signIn`: Authenticate an user with an exiting passkey or a saved password.
- `signUp`: Create a passkey to register a new user.

```ts
  import passkey from 'rn-passkey';
  // then use passkey.signIn() or passkey.signUp()

  // or ES6+ destructuring syntax
  import { signIn, signUp } from 'rn-passkey';
```

### signIn:
#### signIn parameters:
  - `domain`: string<br>
Your domain (the one associate with your app).
  - `challenge`: string<br>
Obtain a challenge from your server.<br>
Important: The challenge needs to be unique for each request.
The challenge has to be a Base64 string.
  - `options?`: Object<br>
Options is an optional object with the following properties:<br>
    - `allowSavedPassword?`: boolean (default value: False)<br>
      - if true: the user can use an existing passkey or an already saved password, if they have one.
      - if false: the user can only use an existing passkey, if they have one.
    - `preferLocallyAvailableCredentials?`: boolean (default value: False)<br>
      - if True:<br>
        - if credentials are available locally<br>
        => the system prompts a signIn UI modal.<br>
        - if no credentials are available locally =><br>
        => the request ends silently,<br>
        => no UI appears and the system return a cancellation.<br>
      - if False:<br>
      the system prompts a signIn UI modal anyway,<br>
        ( if no credentials are available locally, the user can signIn with a passkey from a nearby device or cancels the request ).
    - `securityKey?`: boolean (default value: False)<br>
      - if True:<br>
      the system signIn UI modal shows an option to use of a passkey saved in an external securityKey.
      - if False:<br>
      the system signIn UI modal doesn't show an option to use of a passkey saved in an external securityKey.

#### signIn return value:
The signIn returns a Promise that resolves to an object with the following properties:<br>
- If a passkey was used to signIn:<br>
  - `signedInWith`: string<br>
    In this case, assertion = 'passkey'.
  - `id`: string<br>
    The assertion credentialID.
  - `response`: Object<br>
    The assertion response object with the following properties:
    - `authenticatorData`: string<br>
      A byte sequence that contains additional information about the credential.<br>
      To learn more, see the [W3C WebAuthn specification](https://www.w3.org/TR/webauthn-2/#authenticator-data).
    - `clientDataJSON`: string<br>
      A byte sequence that contains information about the client and the authentication ceremony.<br>
      To learn more, see the [W3C WebAuthn specification](https://www.w3.org/TR/webauthn-2/#client-data).
    - `signature`: string<br>
      The signature for this assertion.
    - `userId`: string<br>
      The user identifier for this assertion.

- If a saved password was used to signIn:<br>
  - `signedInWith`: string<br>
    In this case, assertion = 'password'.
  - `user`: string<br>
    The user identifier for this assertion.
  - `password`: string<br>
    The password for this assertion.

### signUp:
#### signUp parameters:
- `domain`: string<br>
  Your domain (the one associate with your app).
- `challenge`: string<br>
  Obtain a challenge from your server.<br>
  Important: The challenge needs to be unique for each request.
  The challenge has to be a Base64 string.
- `userName`: string<br>
  The user-visible name that identifies a passkey on the user device.
- `userID`: string<br>
  The identifier that your server associates with this user or this passkey.
- `options?`: Object<br>
  Options is an object with the following properties:<br>
  - `securityKey?`: boolean (default value: False)<br>
    If true, the new passkey will be stored in an external securityKey device.<br>

#### signUp return value:
The signUp returns a Promise that resolves to an object with the following properties:<br>
- `id`: string<br>
  The assertion credentialID.
- `response`: Object<br>
  The assertion response object with the following properties:
  - `attestationObject`: string<br>
  The attestation contains the user's public key that you have to store on your server.
  You will need it to verify the signature of the assertions.
  - `clientDataJSON`: string<br>
  A byte sequence that contains information about the client and the authentication ceremony.<br>

## examples:
#### Signing in with a passkey or saved password on app launch
We recommend to use this 'silent' signIn option on your app launch if the user is not already logged in.<br>
- If there is a passkey in the device, the system shows a signIn UI modal.<br>
=> The user can log in safely with only one click.<br>
- If there is no passkey in the device, the request ends silently.<br>
=> Time to show a login or signUp screen to the user.<br>
```ts
import { signIn, AssertionType } from 'rn-passkey';

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
As this signIn is not silent (an UI modal is always shown to the user),<br>
For user experience reasons, we recommend using it in response to a user's action, like a 'Login with a passkey' button press.<br>
```ts
import { signIn, AssertionType } from 'rn-passkey';

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
import { signUp } from 'rn-passkey';

const domain = 'example.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge has to be a Base64 string.
const challenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
// The user-visible name to identifies a passkey.
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

