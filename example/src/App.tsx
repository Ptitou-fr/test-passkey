import * as React from 'react';

import { StyleSheet, Text, View } from 'react-native';
import passkey, { AssertionType } from 'rn-passkey';
const { signIn } = passkey;

export default function App() {
  const [result] = React.useState<number | undefined>();

  React.useEffect(() => {
    // Fetch a challenge from your service
    // The challenge needs to be unique for each request.
    // The challenge have to be a base64 encoded string.
    const challenge =
      'IjMzRUhhdi1qWjF2OXF3SDc4M2FVLWowQVJ4NnI1by1ZSGgtd2Q3QzZqUGJkN1doNnl0Yklab3NJSUFDZWh3ZjktczZoWGh5U0hPLUhIVWpFd1pTMjl3Ig==';
    signIn('example.com', challenge, {
      preferLocallyAvailableCredentials: false,
    })
      .then((auth) => {
        if (auth.assertionType === AssertionType.PASSKEY) {
          // passkey used to signIn
          // Verify the attestation and clientData with your server.
          // After the server verifies the assertion, sign in the user.
        }
        if (auth.assertionType === AssertionType.PASSWORD) {
          // password used to signIn
          // Verify the userName and password with your server.
          // After the server verifies the userName and password, sign in the user.
        }
      })
      .catch((error) => {
        // Handle error as needed (e.g. user canceled)
        console.log(`error '${error.code}' signing in: '${error.message}'`);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
