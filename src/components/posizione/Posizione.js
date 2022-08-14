import React, { useContext, useEffect, useRef, useState } from "react";
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { db } from "../../utils/SQLite";
import { isFirstRender } from "../../utils/isFirstRender";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { contextPantry } from "../../utils/context";

export default function Posizione() {
    const contestPantry = useContext(contextPantry)
    const [locationDispensa, setLocationDispensa] = useState([])
    const [selectedValue, setSelectedValue] = useState()
    const [markerLocation, setMarkerLocation] = useState({})
    const [showMap, setShowMap] = useState(false)
    const [errorPermission, setErrorPermission] = useState(null)
    const scrollRef = useRef();

    useEffect(() => {
        setLocationDispensa(contestPantry.updateDispensa)
        setShowMap(false)
        setSelectedValue()
    }, [contestPantry.updateDispensa])

    useEffect(() => {
        const getProducts = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                db.transaction(tx => {
                    tx.executeSql(
                        `select * from prodotti where userId = "${contestPantry.userId}"`,
                        null,
                        (_, { rows: { _array } }) => setLocationDispensa(_array)
                    )
                }
                )
            } else {
                setErrorPermission("Non hai concesso i permessi per utilizzare la posizione, non potrai usufruire dei servizi completi offerti dall'applicazione, modifica i permessi in impostazioni!")
            }
        }
        getProducts().then()
    }, [])

    const isMounted = isFirstRender()
    useEffect(() => {
        (async () => {
            if (!isMounted) {
                console.log(selectedValue)
                if (selectedValue) {
                    let prodottoAttuale = locationDispensa.filter(prodotto => prodotto.name === selectedValue && prodotto.latitude !== null && prodotto.longitude !== null)
                    if (prodottoAttuale.length > 0) {
                        setMarkerLocation({ latitude: prodottoAttuale[0].latitude, longitude: prodottoAttuale[0].longitude })
                        setShowMap(true)
                    }
                } else {
                    setMarkerLocation({})
                    setShowMap(false)
                }
            }
        })()
    }, [selectedValue])

    return (
        <>
            <ImageBackground source={require('../../../assets/sfondoApp2.jpg')} resizeMode="cover" style={styles.image}>
                <ScrollView ref={scrollRef} style={{ marginTop: 5 }}>
                    <Text style={{ textAlign: "center", fontSize: 15, marginBottom: 10 }}> Seleziona il prodotto che desideri per vedere la sua posizione: </Text>
                    {!errorPermission ?
                        locationDispensa.filter(prodotto => prodotto.latitude !== null && prodotto.longitude !== null).map((location, index) => {
                            return (
                                <View style={{ alignItems: "center" }} key={index}>
                                    <TouchableOpacity onPress={() => {
                                        setSelectedValue(location.name)
                                        scrollRef.current?.scrollToEnd({ animated: true });
                                    }
                                    }
                                        style={{ backgroundColor: "orange", marginVertical: 5, width: "50%", height: 25 }} >
                                        <Text style={{ textAlign: "center", fontSize: 14, marginTop: 2, fontWeight: "bold" }}> {location.name} </Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                        : <Text style={{ textAlign: "center" }}> {errorPermission} </Text>}
                    <View style={{ alignItems: "center" }}>
                        {showMap ?
                            <MapView style={styles.map}
                                region={{
                                    latitude: markerLocation.latitude,
                                    longitude: markerLocation.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005
                                }}
                            >
                                <Marker
                                    title="Luogo di acquisto"
                                    coordinate={{ latitude: markerLocation.latitude, longitude: markerLocation.longitude }}
                                />
                            </MapView>
                            : null}
                    </View>
                </ScrollView>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%"
    },
    map: {
        marginTop: 20,
        width: 350,
        height: 350,
        marginBottom: 30
    }
});




