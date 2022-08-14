import React, { useContext, useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native"
import ScanBarcode from "./ScanBarcode";
import InputBarcode from "./InputBarcode";
import FormPostProductDetails from "./formDetailsProducts/FormPostProductDetails";
import ProductList from "./ProductList";
import { db } from "../../utils/SQLite"
import { contextPantry } from "../../utils/context";
import * as Location from "expo-location";

export default function Home2() {
    const contestPantry = useContext(contextPantry)
    const [barcode, setBarcode] = useState(null)
    const [openScanner, setOpenScanner] = useState(false)
    const [inputBarcode, setInputBarcode] = useState(null)
    const [products, setProducts] = useState([])
    const [sessionToken, setSessionToken] = useState("")
    const [locationPermission, setLocationPermission] = useState(null)
    const [location, setLocation] = useState(null)

    useEffect(() => {
        let isMounted = true
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const userLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest, maximumAge: 10000 });
                if (isMounted) {
                    setLocation(userLocation);
                }
            } else {
                if (isMounted)
                    setLocationPermission("Per utilizzare al meglio questa app sono necessari i permessi per accedere alla posizione, modificali dalle impostazioni.")
            }
        }
        getLocation().then()
        db.transaction(tx => {
            tx.executeSql(
                'create table if not exists prodotti (idProdotto text, name text, userId text, barcode integer, description text, img text, latitude float, longitude float, dataScadenza date);',
                null,
                (success) => console.log(success),
                (error) => console.log(error)
            )
            db.transaction(tx => {
                tx.executeSql(
                    `select rowid, * from prodotti where userId = "${contestPantry.userId}"`,
                    null,
                    (_, { rows: { _array } }) => console.log(_array),
                    (error) => console.log(error)
                )
            }
            )
        })
        return () => { isMounted = false }
    }, [])

    return (
        <ImageBackground source={require('../../../assets/sfondoApp2.jpg')} resizeMode="cover" style={styles.image}>
            <View style={styles.container}>
                <ScanBarcode
                    setProducts={setProducts}
                    barcode={barcode}
                    setBarcode={setBarcode}
                    setInputBarcode={setInputBarcode}
                    setOpenScanner={setOpenScanner}
                    openScanner={openScanner}
                    setSessionToken={setSessionToken}
                />
                <ScrollView style={styles.scrollview}>
                    <InputBarcode
                        setProducts={setProducts}
                        inputBarcode={inputBarcode}
                        setInputBarcode={setInputBarcode}
                        openScanner={openScanner}
                        setSessionToken={setSessionToken}
                    />
                    {!openScanner ?
                        <FormPostProductDetails
                            sessionToken={sessionToken}
                            location={location}
                            setLocation={setLocation}
                            locationPermission={locationPermission}
                            setLocationPermission={setLocationPermission}
                        /> : null}
                </ScrollView>
                {!openScanner ?
                    <ProductList
                        products={products}
                        sessionToken={sessionToken}
                        openScanner={openScanner}
                        location={location}
                        setLocation={setLocation}
                        locationPermission={locationPermission}
                        setLocationPermission={setLocationPermission}
                    /> : null}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },
    scrollview: {
        width: "100%"
    },
    image: {
        width: "100%",
        height: "100%"
    }
});


