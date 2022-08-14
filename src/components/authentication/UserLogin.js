import React, { useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Formik } from 'formik';
import * as SecureStore from 'expo-secure-store';
import { context } from "../../utils/context";
import { Input, Button } from "react-native-elements";
import Toast from "react-native-root-toast";

export default function UserLogin() {
    const contest = React.useContext(context)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const optionsToast = {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "grey"
    }

    const submitLogin = async (values, actions) => {
        setIsLoading(true)
        if (values.email.trim() !== "" && values.password.trim() !== "") {
            const response = await fetch('api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password
                })
            });
            let json = await response.json()
            if (json.accessToken) {
                Toast.show('Login effettuato con successo!', optionsToast);
                await SecureStore.setItemAsync("accessToken", json.accessToken);
                actions.resetForm({})
                contest.setAccessToken(json.accessToken)
                contest.setLoggedIn(true)
            } else if (json.error) {
                setError("Email o password sbagliate. Riprova!")
                setIsLoading(false)
            }
        } else if (values.email.trim() === "" && values.password.trim() === "") {
            setError("Devi inserire i campi richiesti.")
            setIsLoading(false)
        } else if (values.email.trim() === "") {
            setError("Email è un campo obbligatorio.")
            setIsLoading(false)
        } else if (values.password.trim() === "") {
            setError("Password è un campo obbligatorio.")
            setIsLoading(false)
        }
    }

    return (
        <View style={styles.inputsContainer}>
            <Formik
                initialValues={{ email: '', password: '' }}
                onSubmit={(values, actions) => submitLogin(values, actions)}
            >
                {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <>
                        <Input
                            required
                            keyboardType="email-address"
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            placeholder={"Inserisci la tua mail.."}
                            leftIcon={{ type: 'font-awesome', name: 'envelope-open', color: "orange" }}
                            label="Email"
                            labelStyle={styles.labelInput}
                            style={styles.inputText}
                        />
                        <Input
                            required
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            errorStyle={styles.errorInput}
                            errorMessage={error}
                            secureTextEntry={true}
                            placeholder={"Inserisci la tua password.."}
                            label="Password"
                            labelStyle={styles.labelInput}
                            leftIcon={{ type: 'font-awesome', name: 'key', color: "orange" }}
                            style={styles.inputText}
                        />
                        {isLoading && <ActivityIndicator color={"green"} />}
                        <Button
                            onPress={handleSubmit}
                            title="Accedi"
                            buttonStyle={styles.button}
                        />
                    </>
                )}
            </Formik>
        </View>
    );
}

const styles = StyleSheet.create({
    inputsContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 5
    },
    inputText: {
        width: "85%",
        paddingLeft: 5
    },
    labelInput: {
        textAlign: "center",
        fontSize: 20,
        color: "grey",
    },
    errorInput: {
        color: 'red'
    },
    button: {
        backgroundColor: "#DEB887"
    }
});
