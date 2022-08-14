import React, { useContext, useState } from 'react';
import { Button, Input, Text } from "react-native-elements";
import { context } from "../../utils/context";
import { StyleSheet, View } from "react-native";

export default function InputBarcode(props) {
    const contest = useContext(context)
    const [error, setError] = useState("")

    const getProducts = async () => {
        props.setProducts([])
        if (props.inputBarcode) {
            const response = await fetch(`api/products?barcode=${props.inputBarcode}`, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + contest.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            let json = await response.json()
            props.setSessionToken(json["token"])
            props.setProducts(json["products"])
            setError("")
        } else {
            setError("Devi inserire un barcode corretto.")
        }
    }

    return (
        <>
            {props.openScanner === false ?
                <>
                    <Text style={styles.oppure}> OPPURE </Text>
                    <View style={styles.containerInput}>
                        <Input
                            labelStyle={styles.labelInput}
                            onChangeText={input => props.setInputBarcode(input)}
                            value={props.inputBarcode}
                            placeholder="Inserisci il barcode.."
                            inputStyle={styles.input}
                            errorMessage={error}
                            errorStyle={styles.errorInput}
                            leftIcon={{ type: 'font-awesome', name: 'barcode', color: "grey" }}
                        />
                        <Button
                            title="Verifica"
                            onPress={getProducts}
                            buttonStyle={styles.button}
                        />
                    </View>
                </> : null}
        </>
    );
}


const styles = StyleSheet.create({
    oppure: {
        color: "grey",
        textAlign: "center",
        marginTop: 7
    },
    containerInput: {
        flexDirection: "row",
        width: "72%",
        alignItems: "center"
    },
    labelInput: {
        textAlign: "center",
        fontSize: 16
    },
    input: {
        paddingLeft: 7
    },
    errorInput: {
        textAlign: "center"
    },
    button: {
        backgroundColor: "#d97817",
        marginBottom: 15,
        marginLeft: 15,
        width: 90,
        height: 35
    }
})
