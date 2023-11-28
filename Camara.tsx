/*

npm i react-native-image-picker
npm install --save @react-native-firebase/storage@18.6.1

*/

import { useState } from 'react';
import { Image, Button, Text, View } from 'react-native';
import { utils } from '@react-native-firebase/app';
import { launchCamera } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export function Camara(){

    const [imageUri, setImageUri] = useState(""); 

    // para utilizar storage necesitamos una referencia / apuntador
    // al archivo remoto
    const reference = storage().ref('unfolder/otrofolder/imagen-chida.jpg');

    return (
        <View>
            <Button
                title="tomar foto"
                onPress={() => {

                    console.log("TOMANDO FOTO...");
                    launchCamera({
                        mediaType: 'photo'
                    }).then(response => {
                        if(response.didCancel){
                            console.log("OPERACIÓN CANCELADA");
                        } else if(response.errorMessage){
                            console.log("ERRORCITO: ", response.errorMessage);
                        } else if(response.assets && response.assets[0].uri){
                            setImageUri(response.assets[0].uri);
                        }
                    });
                }}
            />
            <Button
                title="Subir foto"
                onPress={() => {
                    console.log("SUBIENDO FOTO...");

                    const task = reference.putFile(imageUri);
                    
                    task.on('state_changed', taskSnapshot => {
                        console.log(
                            "avance de subida: ", 
                            taskSnapshot.bytesTransferred,
                            " de ",
                            taskSnapshot.totalBytes);
                    });

                    task.then(() => {
                        console.log("IMAGEN SUBIDA.");
                    });

                    // notitas - una task se puede pausar! 
                    // task.pause(); -> task.resume();
                }}
            />
            <Button
                title="Bajar foto"
                onPress={async () => {
                    console.log("BAJANDO FOTO...");
                    setImageUri(
                        await storage().ref('perritos.jpg').getDownloadURL());
                }}
            />
            { 
                imageUri === "" ?
                    <Text>Sin imagen aún.</Text>
                :
                    <View>
                        <Text>Image: {imageUri}</Text>
                        <Image 
                            source={{uri: imageUri}}
                            style={{width: 400, height: 400}}
                        />
                    </View> 
            }
        </View>
    );
}