import React, {useEffect} from 'react';
import {StyleSheet, View} from "react-native";
import MapView, {Marker} from "react-native-maps";
import {Button, Text} from "react-native-elements";

export default function RegisterLocation(props) {

    //se la mappa è aperta --> registro la posizione attuale o quella selezionata
    //se la mappa è chiusa --> registro posizione nulla
    const handleLocationFromUser = () => {
        if(props.showMap){
            props.setUserWantLocation(false)
        } else {
            props.setUserWantLocation(true)
        }
        props.setShowMap(!props.showMap)
    }

    useEffect(() => {
        console.log(props.location)
    }, [props.location])

    return (
        <>
            {props.showMap ?
                <View style={styles.containerMap}>
                    {props.location ?
                        <MapView style={styles.map}
                                 initialRegion={{
                                     latitude: props.location.coords.latitude,
                                     longitude: props.location.coords.longitude,
                                     latitudeDelta: 0.005,
                                     longitudeDelta: 0.005
                                 }}
                                 onPress={e => {props.setSelectedCoordinate(e.nativeEvent.coordinate)}}
                        >
                            {props.selectedCoordinate ?
                                <Marker
                                    title="Luogo di acquisto"
                                    coordinate={{latitude: props.selectedCoordinate["latitude"], longitude: props.selectedCoordinate["longitude"]}}
                                /> : null}
                                <Marker
                                    title="Ti trovi qui ora!"
                                    coordinate={{latitude: props.location.coords.latitude, longitude: props.location.coords.longitude}}
                                />
                        </MapView> : null}
                </View>
                : null}
            <View style={styles.containerButtonRegister}>
                {!props.locationPermission ?
                    <Button
                        onPress={handleLocationFromUser}
                        title={props.showMap ?"Chiudi" : "Registra posizione"}
                        buttonStyle={styles.buttonRegister}
                    /> : <Text style={styles.textErrorPermission}> {props.locationPermission} </Text>}
            </View>
        </>
    );
}


const styles = StyleSheet.create({
    containerMap: {
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        height: 300,
        width: 300,
        marginTop: 20
    },
    containerButtonRegister: {
        alignItems: "center",
        justifyContent: "center"
    },
    buttonRegister: {
        backgroundColor: "#d97817",
        marginVertical: 10,
        width: 200,
        height: 30
    },
    textErrorPermission: {
        textAlign: "center"
    }
})
