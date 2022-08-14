import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, ImageBackground } from 'react-native';
import { ButtonGroup, Divider, Text, Image } from 'react-native-elements';
import UserLogin from "./UserLogin";
import UserRegister from "./UserRegister";

export default function Home() {
    const buttons = ["Accedi", "Registrati"]
    const [selectedIndex, setSelectedIndex] = useState(0)

    return (
        <ImageBackground source={require('../../../assets/sfondoApp2.jpg')} resizeMode="cover" style={styles.image}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}> MYPANTRY </Text>
                <Text style={styles.subtitle}>Tieni traccia della tua dispensa in modo facile e veloce. </Text>
                <View style={styles.viewImg}>
                    <Image
                        source={require('../../../assets/carrellospesa1.png')}
                        style={styles.imgCarrello}
                    />
                </View>
                <Divider orientation="horizontal" color="black" style={styles.divider} />
                <ButtonGroup
                    onPress={(index) => setSelectedIndex(index)}
                    selectedIndex={selectedIndex}
                    buttons={buttons}
                    containerStyle={styles.containerButtonGroup}
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                    selectedButtonStyle={styles.selectedButton}
                    source={require("../../../assets/carrellospesa1.png")}
                />
                {selectedIndex === 0 ? <UserLogin /> : <UserRegister />}
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 30,
        marginBottom: 10
    },
    title: {
        fontSize: 45,
        textAlign: "center",
        color: "black",
    },
    subtitle: {
        fontSize: 20,
        textAlign: "center",
        color: "black",
        marginBottom: 10,
        marginLeft: 1,
        marginRight: 1
    },
    image: {
        width: "100%",
        height: "100%"
    },
    viewImg: {
        justifyContent: "center",
        alignItems: "center"
    },
    imgCarrello: {
        width: 210,
        height: 210,
    },
    divider: {
        borderBottomWidth: 0.6,
        marginTop: 15
    },
    containerButtonGroup: {
        height: 40
    },
    button: {
        backgroundColor: "#DEB887"
    },
    selectedButton: {
        backgroundColor: "#FF9933"
    },
    buttonText: {
        fontSize: 20
    },
});
