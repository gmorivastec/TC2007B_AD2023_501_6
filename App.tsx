/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * 
 * librería que estamos usando: https://rnfirebase.io/
 * 
 * npx react-native@latest init React2 --template react-native-template-typescript
 * npm install --save @react-native-firebase/app
 * npm install --save @react-native-firebase/auth
 * npm install --save @react-native-firebase/firestore
 * 
 * npx react-native start
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const[login, setLogin] = useState("");
  const[password, setPassword] = useState("");

  useEffect(() => {
    firestore()
    .collection('Animalitos')
    .onSnapshot(querySnapshot => {
      console.log("***************** REALTIME!");
      querySnapshot.forEach(currentDoc => {
        console.log(currentDoc.id, currentDoc.data());
      });
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TextInput 
        placeholder='login'
        onChangeText={text => {
          setLogin(text);
        }}
      />
      <TextInput
        placeholder='password'
        secureTextEntry={true}
        onChangeText={text => {
          setPassword(text);
        }}
      />
      <Button 
        title='Sign up'
        onPress={() => {

          // podemos suscribir lógica a un promise para que sea ejecutada
          // cuando este sea resuelto 
          // vamos a utilizar el método "then"
          auth()
          .createUserWithEmailAndPassword(login, password)
          .then(() => {
            // esta lógica se ejecuta de manera asíncrona 
            console.log("USUARIO CREADO EXITOSAMENTE");
          })
          .catch(
            error => {
              // si hubo un problema en la resolución del promise caemos en el catch
              if(error.code === 'auth/email-already-in-use') {
                console.log("email ya utilizado");
              }
              if(error.code === 'auth/invalid-email'){
                console.log("email no valido");
              }
              console.log(error.code);
            }
          );
        }}
      />
      <Button 
        title='Log in'
        onPress={() => {
          auth()
          .signInWithEmailAndPassword(login,password)
          .then(() => {
            console.log("USUARIO AUTENTICADO: " + auth().currentUser?.uid);
          })
          .catch(error => {
            console.log("ERROR: " + error);
          });
        }}
      />
      <Button 
        title='Log out'
        onPress={() => {
          auth()
          .signOut()
          .then(() => {
            console.log("USUARIO SIGNED OUT-EADO");
          });
        }}
      />
      <Button 
        title='new record'
        onPress={() => {
          firestore()
          .collection('Animalitos')
          .add({
            nombre: 'Fifi',
            edad: 5,
            peso: 30
          })
          .then(() => {
            console.log("animalito agregado!");
          })
          .catch(error => {
            console.log(error);
          });
        }}
      />
      <Button 
        title='query'
        onPress={() => {
          firestore()
          .collection('Animalitos')
          .get()
          .then( querySnapshot => {
            console.log("************************");
            querySnapshot.forEach(currentDoc => {
              console.log(currentDoc.id, currentDoc.data());
            });
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;