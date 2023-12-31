/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * 
 * librería que estamos usando: https://rnfirebase.io/
 * 
 * npx react-native@latest init React2 --template react-native-template-typescript
 * npm install --save @react-native-firebase/app@18.6.1
 * npm install --save @react-native-firebase/auth@18.6.1
 * npm install --save @react-native-firebase/firestore@18.6.1
 * 
 * npx react-native start
 * 
 * instalamos el google-signin:
 * npm i @react-native-google-signin/google-signin
 * 
 * obtención de SHA-1: 
 * https://developers.google.com/android/guides/client-auth
 * 
 * para hacerlo para nuestro proyecto, ubica una terminal en 
 * la raiz del proyecto y corre:
 * keytool -list -v -alias androiddebugkey -keystore ./android/app/debug.keystore
 * password: android
 * 
 * Notificaciones:
 * 
 * npm install --save @react-native-firebase/messaging@18.6.1 -> notificaciones detonadas por mensaje remoto
 * npm install --save @notifee/react-native -> notificaciones locales
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Alert,
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
import messaging from '@react-native-firebase/messaging';
import { 
  GoogleSignin, 
  GoogleSigninButton 
} from '@react-native-google-signin/google-signin';

import 
  notifee, 
  { 
    TimestampTrigger, 
    TriggerType,
    AndroidImportance,
    AndroidVisibility,
    Trigger,
    RepeatFrequency,
    IntervalTrigger,
    TimeUnit
  } from '@notifee/react-native';

import { Camara } from './Camara';


messaging().setBackgroundMessageHandler(async remoteMessage=> {
  console.log("mensajito remoto en background! ", JSON.stringify(remoteMessage));
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log("evento en background: ", detail);
});

// de tu google-services busca el client tipo 3
GoogleSignin.configure({
  webClientId: '247056306377-tgj4cihklvq3ac993pn7uned67c92mfm.apps.googleusercontent.com'
});

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

function AppFlatList() {

  // en typescript podemos definir un tipo sin la necesidad
  // de declarar una variable
  type JSONAnimalito = {edad: number, nombre: string, peso: number};

  // estados para llevar control del request
  const[animalitos, setAnimalitos] = useState<JSONAnimalito[]>([]);
  const[animalitosCargados, setAnimalitosCargados] = useState(false);

  // inscribirnos para recibir updates en tiempo real de actualizaciones de la BD
  useEffect(() => {
    firestore()
    .collection("Animalitos")
    .onSnapshot(querySnapshot => {

      const updateAnimalitos : any[] = [];
      querySnapshot.forEach(docActual => {

        // ... -> operador "spread"
        // abrir todos los datos de un iterable para generar una estructura
        // con todos ellos
        // sin spread - iterar a través de los elementos de la estructura y 
        // agregarlos uno por uno
        updateAnimalitos.push({...docActual.data()});
      });

      setAnimalitos(updateAnimalitos);
      setAnimalitosCargados(true);
    });
  }, []);

  if(!animalitosCargados){
    return <ActivityIndicator />;
  }

  return (
    <View>
      <FlatList 
      data = {animalitos}
      renderItem = {({item}) => (
        <View>
          <Text>edad: {item.edad}</Text>
          <Text>nombre: {item.nombre}</Text>
          <Text>peso: {item.peso}</Text>
        </View>
      )}
      />
      <GoogleSigninButton 
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => {
          LoginConGoogle()
          .then(() => {
            console.log("SIGNINEADO CON GOOGLE");
          });
        }}
      />
      <Button 
        title="usuario actual"
        onPress={() => {
          if(auth().currentUser != null)
            console.log("USUARIO ACTUAL: ", auth().currentUser?.email);
          else
            console.log("SIN USUARI0");
        }}
      />
      <Button
        title="log out"
        onPress={() => {
          auth()
          .signOut()
          .then(() => {
            console.log("USUARIO LOGOUTEADO");
          });
        }}
      />
    </View>
  );
}

async function LoginConGoogle() {
  
  // checar si user tiene soporte para google play services 
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true});

  // hacer sign in
  const { idToken } = await GoogleSignin.signIn();

  // obtener credencial de google
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  return auth().signInWithCredential(googleCredential);
}

function Notificaciones() 
{

  async function notificacionOnDemand() {

    // si están en iOS poner esto
    await notifee.requestPermission();

    // si están en android hay que poner un canal
    const channelId = await notifee.createChannel({
      id: "canalito",
      name: "El canalito de las notificaciones"
    });

    // aquí es donde detonamos la notificación
    await notifee.displayNotification({
      title: "Notificación local on demand",
      body: "una notificación local increible",
      android: {
        channelId,
        pressAction: {
          id: 'default' // si no tiene eso al tocarla no abre la app
        }
      }
    });
  }

  async function notificacionConTimestamp(){

    // obtener fecha de hoy 
    const date = new Date(Date.now());
    date.setHours(8);
    date.setMinutes(33);

    // vamos a crear una notificación que hace uso de un detonate
    // (trigger)

    // lo primero es crear un trigger
    const trigger : TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      repeatFrequency: RepeatFrequency.WEEKLY,
      timestamp: date.getTime() // timestamp - valor numérico que representa el tiempo transcurrido en milisegundos desde la media noche del 1ero de enero de 1970 UTC 
    };

    notificacionConTrigger(trigger);
  }
  
  async function notificacionConIntervalo() {
    
    const trigger: IntervalTrigger = {
      type: TriggerType.INTERVAL,
      interval: 15,
      timeUnit: TimeUnit.MINUTES
    };

    notificacionConTrigger(trigger);
  }

  async function notificacionConTrigger(trigger: Trigger) {

    const channelId = await notifee.createChannel({
      id: "trigger",
      name: "notificacion con trigger"
    });

    await notifee.createTriggerNotification(
      {
        title: 'Notificacion con trigger',
        body: 'acuerdate de este pendiente!',
        android: {
          channelId
        }
      },
      trigger
    );
  }

  useEffect(() => {

    console.log("suscribiendose");

    messaging().onMessage(async remoteMessage => {
      Alert.alert("Mensajito llego: ", JSON.stringify(remoteMessage));
    });
  }, []);

  return (
    <View>
      <Text>Notificaciones</Text>
      <Button 
        title='NOTIFICACIÓN ON DEMAND'
        onPress={() => {
          console.log("LLAMANDO NOTIFICACION ON DEMAND");
          notificacionOnDemand();
        }}
      />
      <Button 
        title='NOTIFICACIÓN CON TRIGGER'
        onPress={() => {
          console.log("LLAMANDO NOTIFICACION CON TRIGGER");
          notificacionConTimestamp();
        }}
      />
      <Button 
        title='NOTIFICACIÓN CON INTERVALO'
        onPress={() => {
          console.log("LLAMANDO NOTIFICACION CON INTERVALO");
          notificacionConIntervalo();
        }}
      />
    </View>
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

export default Camara;
