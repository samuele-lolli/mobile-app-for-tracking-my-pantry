import React, {useContext, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Button, Input, Text} from "react-native-elements";
import {Formik} from "formik";
import {db} from "../../../utils/SQLite"
import {fire} from "../../../utils/firebase";
import {context, contextPantry} from "../../../utils/context";
import Toast from "react-native-root-toast";
import CameraAndGallery from "./CameraAndGallery";
import RegisterLocation from "./RegisterLocation";

export default function FormPostProductDetails(props) {
    const contest = useContext(context)
    const contestPantry = useContext(contextPantry)
    const [visiblePostProduct, setVisiblePostProduct] = useState(false) //state per mostrare/nascondere il form
    const [imageURI, setImageURI] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")  //state per errori negli input del form
    const [showMap, setShowMap] = useState(false)
    const [selectedCoordinate, setSelectedCoordinate] = useState(null) //state per salvare le coordinate selezionate dall'utente
    const [userWantLocation,setUserWantLocation] = useState(false)  //state che salva la volontà dell'utente di memorizzare la posizione di un prodotto o meno

    //crea un blob dato un uri di un'immagine, lo carica sullo storage di firebase
    //e fornisce l'url della foto da memorizzare su firestore
    const createBlobAndURL = async (values) => {
        if(imageURI !== ""){
            const fetchImageURI = await fetch(imageURI);
            const blob = await fetchImageURI.blob()
            let ref = fire.storage().ref().child("images/" + values.name);
            await ref.put(blob);
            return await fire.storage().ref("/images/" + values.name).getDownloadURL()
        }
    }

    //post sul db remoto di tutti i dati necessari
    const postProductDetails = async (values, actions) => {
        setLoading(true)
        let url = await createBlobAndURL(values).then()
        if(values.name !== "" && values.description !== "" && values.barcode !== ""){
            const response = await fetch(`https://lam21.iot-prism-lab.cs.unibo.it/products`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + contest.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: props.sessionToken,
                    name: values.name,
                    description: values.description,
                    barcode: values.barcode,
                    img: url || "null",
                    test: false,
                })
            });
            let json = await response.json()
            actions.resetForm({})
            await postProductOnSQLite(values, url, json).then()
            setError("")
            setLoading(false)
            setVisiblePostProduct(!visiblePostProduct)
        } else {
            setError("Devi inserire tutti i campi obbligatori!")
            setLoading(false)
        }
    }

    //post su firestore di tutti i dati necessari, con aggiunta data di scadenza e locazione
    const postProductOnSQLite = async (values, url, json) => {
        let coordinate;
        coordinate = selectedCoordinate //se l'utente ha selezionato una location diversa da quella attuale seleziono quella
        if(selectedCoordinate === null && props.location){  //se l'utente non ha selezionato una posizione, prendo quella corrente.
            coordinate = {latitude: props.location.coords.latitude, longitude: props.location.coords.longitude}
        }
        if(!userWantLocation){  //se l'utente ha chiuso la mappa setto le coordinate a null
            setSelectedCoordinate(null)
            coordinate = {latitude: null, longitude: null}
        }

        db.transaction(tx => {
                tx.executeSql(
                    `insert into prodotti (idProdotto, name, userId, barcode, description, img, latitude, longitude ) values (?,?,?,?,?,?,?,?);`,
                    [json["id"], values.name, json["userId"], values.barcode, values.description, url ? url : null, coordinate.latitude, coordinate.longitude]
                );
            },
            (error) => {console.log(error)},
            () => {
                setImageURI("")
                setUserWantLocation(false)
                setSelectedCoordinate(null)
                coordinate = null
                setShowMap(false)
                db.transaction(tx => {
                        tx.executeSql(
                            `select * from prodotti where userId = "${contestPantry.userId}"`,
                            null,
                            (_, { rows: { _array } }) => {
                                contestPantry.setUpdateDispensa(_array)
                                Toast.show('Prodotto aggiunto alla dispensa', {
                                        duration: Toast.durations.SHORT,
                                        position: Toast.positions.BOTTOM,
                                        shadow: true,
                                        animation: true,
                                        hideOnPress: true,
                                        delay: 0,
                                        backgroundColor: "grey"
                                    },
                                );
                            }
                        )
                    }
                )
            }
        )
    }

    return (
        <>
            {props.sessionToken ?
                <>
                    <View style={styles.containerShowForm}>
                        <Text style={styles.textShowForm}> Non hai trovato il tuo prodotto? </Text>
                        <TouchableOpacity onPress={() => {
                            setVisiblePostProduct(!visiblePostProduct)
                            setImageURI("")
                            setShowMap(false)
                        }}>
                            {visiblePostProduct ?
                                <Text style={styles.textButtonShowForm}> Chiudi </Text> : <Text style={styles.textButtonShowForm}> Clicca qui </Text>}
                        </TouchableOpacity>
                    </View></> : null}
            {visiblePostProduct ?
                <Formik
                    initialValues={{ name: '', description: '', barcode: '' }}
                    onSubmit={(values, actions) => postProductDetails(values, actions)}
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <>
                            <Text style={styles.formTitle}>
                                INSERISCI LE INFORMAZIONI DEL PRODOTTO
                            </Text>
                            <Input
                                required
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                value={values.name}
                                placeholder={"Ex: Coca cola"}
                                label="Inserisci il nome del prodotto"
                                labelStyle={styles.labelInputForm}
                            />
                            <Input
                                required
                                onChangeText={handleChange('description')}
                                onBlur={handleBlur('description')}
                                value={values.description}
                                placeholder={"Bibita popolare in tutto il mondo"}
                                label="Inserisci la descrizione del prodotto"
                                labelStyle={styles.labelInputForm}
                            />
                            <Input
                                required
                                onChangeText={handleChange('barcode')}
                                onBlur={handleBlur('barcode')}
                                value={values.barcode}
                                placeholder={"Ex: 8044542472451"}
                                label="Inserisci il barcode del prodotto"
                                labelStyle={styles.labelInputForm}
                                errorMessage={error}
                            />
                            <CameraAndGallery
                                setImageURI={setImageURI}
                                imageURI={imageURI}
                                loading={loading}
                            />
                            <RegisterLocation
                                location={props.location}
                                setLocation={props.setLocation}
                                locationPermission={props.locationPermission}
                                setLocationPermission={props.setLocationPermission}
                                selectedCoordinate={selectedCoordinate}
                                setSelectedCoordinate={setSelectedCoordinate}
                                showMap={showMap}
                                setShowMap={setShowMap}
                                setUserWantLocation={setUserWantLocation}
                            />
                            <View style={styles.containerButtonInsert}>
                                <Button
                                    disabled={loading}
                                    onPress={handleSubmit}
                                    title="Inserisci nuovo prodotto"
                                    buttonStyle={styles.buttonInsert}
                                />
                            </View>
                        </>
                    )}
                </Formik> : null}
        </>
    );
}

const styles = StyleSheet.create({
    containerShowForm: {
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center"
    },
    textShowForm: {
        color: "grey"
    },
    textButtonShowForm: {
        color: "#e66814",
        fontSize: 17
    },
    formTitle: {
        textAlign:"center",
        color: "grey",
        fontSize: 20,
        fontWeight:"bold",
        marginVertical: 10,
        backgroundColor:"#eebe8c",
        borderRadius:10
    },
    labelInputForm: {
        textAlign: "center"
    },
    containerButtonInsert: {
        alignItems: "center",
        justifyContent: "center"
    },
    buttonInsert: {
        backgroundColor: "#d97817",
        marginVertical: 10,
        width: 250,
        height: 35
    }
})


