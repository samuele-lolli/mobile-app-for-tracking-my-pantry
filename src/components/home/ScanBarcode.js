import React, { useContext, useEffect, useState } from 'react';
import { Button } from "react-native-elements";
import { BarCodeScanner } from "expo-barcode-scanner";
import { StyleSheet, View } from "react-native";
import { isFirstRender } from "../../utils/isFirstRender";
import { context } from "../../utils/context";

export default function ScanBarcode(props) {
    const [scanned, setScanned] = useState(false)
    const contest = useContext(context)
    const isFirst = isFirstRender(); //check if this is the first render (on mount) and skip this

    useEffect(() => {
        if (!isFirst) {
            (async () => {
                props.setProducts([])
                const response = await fetch(`api/barcode=${props.barcode}`, {
                    method: 'GET',
                    headers: {
                        Authorization: 'Bearer ' + contest.accessToken,
                        'Content-Type': 'application/json'
                    }
                });
                let json = await response.json()
                props.setSessionToken(json["token"])
                props.setProducts(json["products"])
            })();
        }
    }, [props.barcode]);

    const scanOnBarcode = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        if (status === "granted") {
            props.setProducts([])
            props.setBarcode(null)
            props.setInputBarcode(null)
            props.setOpenScanner(true)
        } else {
            alert("Non hai concesso i permessi per utilizzare la fotocamera, non potrai usufruire dei servizi completi offerti dall'applicazione!")
        }

    }

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true)
        props.setBarcode(data)
        props.setOpenScanner(false)
        setScanned(false)
    };

    return (
        <>
            <Button
                title={props.openScanner ? "Chiudi scanner" : "Scannerizza il barcode"}
                onPress={props.openScanner ? () => props.setOpenScanner(false) : scanOnBarcode}
                buttonStyle={styles.buttonScanner}
            />
            {props.openScanner ?
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={[StyleSheet.absoluteFill, styles.containerScanner]}
                >
                    <>
                        <View style={styles.layerTop} />
                        <View style={styles.layerCenter}>
                            <View style={styles.layerLeft} />
                            <View style={styles.focused} />
                            <View style={styles.layerRight} />
                        </View>
                        <View style={styles.layerBottom} />
                    </>
                </BarCodeScanner> : null}
        </>
    );
}

const opacity = 'rgba(0, 0, 0, .6)'
const styles = StyleSheet.create({
    containerScanner: {
        flex: 1,
        marginTop: 70,
        height: "80%",
        width: "100%",
        flexDirection: 'column'
    },
    buttonScanner: {
        backgroundColor: "#d97817",
        height: 35
    },
    denPermission: {
        textAlign: "center",
        color: "black"
    },
    layerTop: {
        flex: 2,
        backgroundColor: opacity
    },
    layerCenter: {
        flex: 1,
        flexDirection: 'row'
    },
    layerLeft: {
        flex: 2,
        backgroundColor: opacity
    },
    focused: {
        flex: 10
    },
    layerRight: {
        flex: 2,
        backgroundColor: opacity
    },
    layerBottom: {
        flex: 2,
        backgroundColor: opacity
    }
})
