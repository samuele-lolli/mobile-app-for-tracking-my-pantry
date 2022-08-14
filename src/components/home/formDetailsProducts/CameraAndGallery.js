import React, {useEffect, useState} from 'react';
import {Button, Image, Text} from "react-native-elements";
import {ActivityIndicator, StyleSheet, TouchableOpacity, View} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {Camera} from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function CameraAndGallery(props) {
    const [camera, setCamera] = useState(null)
    const [openFotocam, setOpenFotocam] = useState(false)
    const [galleryPermission, setGalleryPermission] = useState(true)
    const [cameraPermission, setCameraPermission] = useState(true)

    useEffect(() => {
        permissionFunction().then()
    },[])

    //richiede i permessi per galleria e fotocamera
    const permissionFunction = async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const imagePermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (imagePermission.status !== 'granted' ) {
            setGalleryPermission(false)
        }
        if (cameraPermission.status !== 'granted' ) {
            setCameraPermission(false)
        }
    }

    //apre la galleria e salva l'uri dell'immagine selezionata
    let openImagePicker = async () => {
        if(galleryPermission){
            let pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "Images",
                quality: 0.1
            });
            if(pickerResult["cancelled"]){
                props.setImageURI("")
            } else {
                props.setImageURI(pickerResult["uri"])
            }
        }
    };

    //scatta la foto al clic del button e salva l'uri della foto scattata
    let takePicture = async () => {
        if(camera && cameraPermission){
            const data = await camera.takePictureAsync(null);
            props.setImageURI(data["uri"]);
            setOpenFotocam(false)
        }
    }

    return (
        <>
            <Text style={styles.textSelectImage}>
                Seleziona l'immagine da inserire:
            </Text>
            <View style={styles.containerButtonsCameraAndGallery}>
                <TouchableOpacity style={styles.button} onPress={openImagePicker}>
                    <Text style={styles.textButtonCamera}> Galleria </Text>
                    <FontAwesome name={"image"} size={30} color={"black"} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {
                    if(cameraPermission){
                        setOpenFotocam(!openFotocam)
                    }
                }}>
                    <Text style={styles.textButtonCamera}>{openFotocam ? "Chiudi" : "Fotocamera"}</Text>
                    <FontAwesome name={"camera"} size={30} color={"black"} />
                </TouchableOpacity>
            </View>
            {galleryPermission ? null : <Text  style={styles.textPermissions}> Per utilizzare al meglio questa app sono necessari i permessi per accedere alla galleria. </Text> }
            {cameraPermission ? null : <Text  style={styles.textPermissions}> Per utilizzare al meglio questa app sono necessari i permessi per accedere alla fotocamera. </Text> }
            <View style={styles.containerPreviewImg}>
                {props.imageURI !== "" ?
                    <>
                        <Text style={styles.textPreviewImg}> Anteprima foto </Text>
                        <Image source={{uri: props.imageURI}} style={styles.previewImg}/>
                    </> : <Text style={styles.noPreviewImgText}> Nessuna immagine selezionata </Text> }
            </View>
            <View style={styles.containerCamera}>
                {openFotocam ?
                    <Camera
                        ref={(ref) => setCamera(ref)}
                        type={Camera.Constants.Type.back}
                        style={styles.camera}
                    /> : null}
            </View>
            <View style={styles.containerButtonImg}>
                {openFotocam ? <Button
                    onPress={takePicture}
                    title="Scatta foto"
                    buttonStyle={styles.buttonImg}
                /> : null}
                {props.loading && <ActivityIndicator size="large" color={"purple"} />}
            </View>
        </>
    );
}


const styles = StyleSheet.create({
    textSelectImage: {
        textAlign:"center",
        color: "grey",
        fontSize: 15,
        fontWeight:"bold",
        marginBottom: 10
    },
    containerButtonsCameraAndGallery: {
        flexDirection:"row",
        alignItems :"center",
        justifyContent:"center"
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eebe8c",
        padding: 4,
        width: "40%",
        marginHorizontal: 5
    },
    textButtonCamera: {
        textAlign:"center",
        fontWeight:"bold",
        marginBottom: 5,
        color: "white"
    },
    textPermissions: {
        textAlign:"center"
    },
    containerPreviewImg: {
        alignItems: "center"
    },
    textPreviewImg: {
        textAlign:"center",
        color: "grey",
        fontSize: 15,
        fontWeight:"bold",
        marginVertical: 10
    },
    previewImg: {
        width: 250,
        height: 200
    },
    noPreviewImgText: {
        textAlign:"center",
        color: "grey",
        fontSize: 12,
        fontWeight:"bold",
        marginVertical: 10
    },
    containerCamera: {
        marginLeft: 18
    },
    camera: {
        flex: 1,
        aspectRatio: 1,
        marginVertical: 10
    },
    containerButtonImg: {
        alignItems: "center",
        justifyContent: "center"
    },
    buttonImg: {
        backgroundColor: "#d97817",
        width: 200,
        height: 30
    }
})
