# rn-passkey

Passkeys allow users to sign in to your app without typing a password.<br>
It's an alternative method of user authentication that eliminates the need for a password while being easier to use and far more secure. Learn more about passkeys: [Google](https://developers.google.com/identity/passkeys), [Apple](https://developer.apple.com/passkeys/).<br>
<br>
It helps improving the user experience.

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
To use passkeys on iOS the system should be able to verify the domain associated with your app.<br>
To do this, you need to:
#### 1) Add an associated domains file to your website ([apple doc](https://developer.apple.com/documentation/xcode/supporting-associated-domains)):
Construct a JSON file named apple-app-site-association (without an extension) and place it in your site's '.well-known directory' at the root of your domain.
For example, if your domain is 'example.com:<br>
the file should be located at https://example.com/.well-known/apple-app-site-association. <br>
and it should contain a JSON object with the following structure:<br>
```json
{
  "webcredentials": {
    "apps": [ "ABCDE12345.com.example.app" ]
  }
}
```
in which:<br>
`'ABCDE12345'` is your Team ID ([locate your Team ID](https://developer.apple.com/help/account/manage-your-team/locate-your-team-id))<br>
and<br>
`'com.example.app'` is your app's bundle identifier.

#### 2) Add the domain to the `Associated Domains` capability in your app's entitlements file ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)):
To add your domain to the entitlement, you need to
- open your app with Xcode,<br>
- select your app target (_step 1, 2 , and 3 on the screenshot below_),<br>
- go to the Signing & Capabilities tab (_step 4_),<br>
- click '+ Capability' (_step 5_), then add the 'Associated Domains' capability,<br>
![Signing Capability Screenshot](gitAssets/screenshotSigningCapability.png)<br>
- Inside 'Associated Domains' capability box, click the (+) button to add a placeholder domain.<br>
Replace it with webcredentials:<yourdomain.com>,<br>
It should look like this:<br>
![Associated Domains Screenshot](gitAssets/screenshotAssociatedDomains.png)<br>
While you're developing your app, for debugging purposes or if your server is unreachable from the public internet, you can use the alternate mode feature ([apple doc](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)).<br>
For example like: webcredentials:example.com?mode=developer,<br>

## Usage

rn-passkey exposes the following methods:
- `signIn`: - Use an exiting passkey or a saved password to authenticate an user.
- `signUp`: - Create a passkey to register a new user.

```ts
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
  - `assertion`: string<br>
    In this case, assertion = 'passkey'.
  - `userId`: string<br>
    The user identifier for this assertion.
  - `signature`: string<br>
    The signature for this assertion.
  - `authenticator`: string<br>
    A byte sequence that contains additional information about the credential.<br>
    To learn more, see the [W3C WebAuthn specification](https://www.w3.org/TR/webauthn-2/#authenticator-data).

- If a saved password was used to signIn:<br>
  - `assertion`: string<br>
    In this case, assertion = 'password'.
  - `user`: string<br>
    The user identifier for this assertion.
  - `password`: string<br>
    The password for this assertion.

- If the request was canceled:<br>
  - `assertion`: string<br>
    In this case, assertion = 'canceled'.

### signUp:
#### signUp parameters:
- `domain`: string<br>
  Your domain (the one associate with your app).
- `challenge`: string<br>
  Obtain a challenge from your server.<br>
  Important: The challenge needs to be unique for each request.
  The challenge has to be a Base64 string.
- `userName`: string<br>
  The user-visible name that identifies a passkey.
- `userID`: string<br>
  The identifier that your server associates with the user.
- `options?`: Object<br>
  Options is an object with the following properties:<br>
  - `securityKey?`: boolean (default value: False)<br>
    If true, the new passkey will be stored in an external securityKey device.<br>

#### signUp return value:
The signUp returns a Promise that resolves to an object with the following properties:<br>
- `attestation`: string<br>
  The attestation contains the user's public key that you have to store on your server.
  You will need it to verify the signature of the assertions.
- `userName`: string<br>
  The user-visible name to identifies a passkey.
- `userID`: string<br>
  The identifier that your server associates with the user.

## examples:
#### Signing in with a passkey or saved password on app launch
We recommend to use this 'silent' signIn option on your app launch if the user is not already logged in.<br>
- If there is a passkey in the device, the system shows a signIn UI modal.<br>
=> The user can log in safely with only one click.<br>
- If there is no passkey in the device, the request ends silently.<br>
=> Time to show a login or signUp screen to the user.<br>
```ts
import { signIn, AssertionType } from 'rn-passkey';

const domain = 'exemple.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge need to be a Base64 string.
const chalenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
const options = {
  preferLocallyAvailableCredentials: true,
  allowSavedPassword: true,
};

try {
  const crential = await signIn(
    domain,
    chalenge,
    options
  );
  if ( crential.assertionType === AssertionType.PASSKEY ) {
    const { userId, signature, authenticator } = assertion;
    // Verify the signature and clientDataJson with your server forthe given userId.
    // ...
    // then, if the signature is valid, you can sign in the user.
  } else if ( crential.assertionType === AssertionType.PASSWORD ) {
    // verify the credeintials (userName and password) with your server.
    // ...
    // then, if the credentials are valid, you can sign in the user.
    // This is a good time to offer the user to create a passkey.
  } else {
    // crential.assertionType === AssertionType.CANCELLED
    // either no credentials are available locally and the request abords silently,
    // or the user cancelled the request.

    // => you probably now want to show a login or signUp screen to the user.
  }
} catch (error) {
  // Handle error
  // Note: the error.message cointains useful information about the error.
}
```
#### Signing in with a passkey in response to a user's action
As this signIn is not silent (an UI modal is always shown to the user),<br>
For user experience reasons, we recommend using it in response to a user's action, like a 'Login with a passkey' button press.<br>
```ts
import { signIn, AssertionType } from 'rn-passkey';

const domain = 'exemple.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge has to be a Base64 string.
const chalenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';

try {
  const crential = await signIn(
    domain,
    chalenge
  );
  if ( crential.assertionType === AssertionType.PASSKEY ) {
    const { userId, signature, authenticator } = assertion;
    // Verify the signature and clientDataJson with your server forthe given userId.
    // ...
    // then, if the signature is valid, you can sign in the user.
  } else {
    // crential.assertionType === AssertionType.CANCELLED
    // => the user cancelled the request.

    // => you probably want go back to tour login screen.
  }
} catch (error) {
  // Handle error
  // Note: the error.message cointains useful information about the error.
}
```

#### SignUp - Create a new passkey
```ts
import { signUp } from 'rn-passkey';

const domain = 'exemple.com';
// Obtain a challenge from your server.
// Important: The challenge needs to be unique for each request.
// The challenge has to be a Base64 string.
const chalenge = 'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
// The user-visible name to identifies a passkey.
// the only data you have to ask the user for.
const userName = 'John Doe';
// An identifier from your server that you want to associate with the user.
const userID = '123456789';

try {
  const crential = await signUp(
    domain,
    chalenge,
    userName,
    userID
  );
  const { attestation, userName, userID } = crential;
  // Attestation containts the user's public key that you have to store on your server.
  // You will need it to verify the signature of the assertions.
  // userName and userID are the same as the ones you passed to the signUp function.

  // after your server has verified the attestation, it can create a new user account.
  // then you can sign in the user.
} catch (error) {
  // Handle error
  // Note: the error.message cointains useful information about the error.
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
