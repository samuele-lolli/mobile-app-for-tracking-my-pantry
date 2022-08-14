import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Formik } from 'formik';
import { Input, Button } from "react-native-elements";
import Toast from "react-native-root-toast";
export default function UserRegister() {
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

    const submitRegister = async (values, actions) => {
        if (values.username.trim() !== "" && values.email.trim() !== "" && values.password.trim() !== "") {
            const response = await fetch('api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: values.email,
                    username: values.username,
                    password: values.password
                })
            });
            let json = await response.json()
            if (json.statusCode === 500) {
                setError("Un utente è già registrato con questa mail.")
            } else if (json.id) {
                Toast.show('Registrazione effettuata con successo, effettua ora il login!', optionsToast);
                actions.resetForm({})
                setError("")
            }
        } else if (values.username.trim() === "" && values.email.trim() === "" && values.password.trim() === "") {
            setError("Devi inserire i campi richiesti.")
        } else if (values.username.trim() === "") {
            setError("Username è un campo obbligatorio.")
        } else if (values.password.trim() === "") {
            setError("Password è un campo obbligatorio.")
        } else if (values.email.trim() === "") {
            setError("Email è un campo obbligatorio.")
        }
    }

    return (
        <View style={styles.inputsContainer}>
            <Formik
                initialValues={{ email: '', username: '', password: '' }}
                onSubmit={(values, actions) => submitRegister(values, actions)}
            >
                {({ handleChange, handleBlur, handleSubmit, values }) => (
                    <>
                        <Input
                            required
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            placeholder={"Inserisci la tua mail.."}
                            inputStyle={styles.input}
                            label="Email"
                            labelStyle={styles.labelInput1}
                            leftIcon={{ type: 'font-awesome', name: 'envelope-open', color: "orange" }}
                            style={styles.inputText}
                        />
                        <Input
                            required
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                            value={values.username}
                            placeholder={"Inserisci il tuo username.."}
                            label="Username"
                            labelStyle={styles.labelInput2}
                            leftIcon={{ type: 'font-awesome', name: 'user', color: "orange" }}
                            style={styles.inputText}
                        />
                        <Input
                            required
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            placeholder={"Inserisci la tua password.."}
                            style={styles.inputText}
                            errorStyle={styles.errorInput}
                            errorMessage={error}
                            secureTextEntry={true}
                            label="Password"
                            labelStyle={styles.labelInput2}
                            leftIcon={{ type: 'font-awesome', name: 'key', color: "orange" }}
                        />
                        <View>
                            <Button
                                onPress={handleSubmit}
                                title="Registrati"
                                buttonStyle={styles.button}
                            />
                        </View>
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
    },
    inputText: {
        width: "85%",
        paddingLeft: 5
    },
    input: {
        height: 10
    },
    labelInput1: {
        textAlign: "center",
        fontSize: 20,
        color: "grey",
        marginTop: 8
    },
    labelInput2: {
        textAlign: "center",
        fontSize: 20,
        color: "grey"
    },
    errorInput: {
        color: "red"
    },
    button: {
        backgroundColor: "#DEB887"
    }
});
