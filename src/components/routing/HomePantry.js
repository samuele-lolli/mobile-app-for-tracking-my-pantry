import React, { useContext, useEffect, useState } from 'react';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { context, contextPantry } from "../../utils/context";
import Home2 from "../home/Home2";
import Posizione from "../posizione/Posizione";
import Pantry from "../dispensa/Pantry";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-elements";
import * as SecureStore from "expo-secure-store";

const Tab = createBottomTabNavigator();

export default function HomePantry() {
    const [userId, setUserId] = useState("")
    const [updateDispensa, setUpdateDispensa] = useState([])
    const contest = useContext(context)

    //chiamata GET per ottenere l'id dell'utente loggato
    useEffect(() => {
        let isMounted = true
        const getUserId = async () => {
            const result = await fetch(`an api that returns id of the user`, {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + contest.accessToken,
                    'Content-Type': 'application/json'
                }
            })
            let json = await result.json()
            if (isMounted)
                setUserId(json["id"])
        }
        getUserId().then()
        return () => { isMounted = false }
    }, [])

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync("accessToken")
        contest.setLoggedIn(false)
    }

    return (
        <>
            <contextPantry.Provider value={{ userId, setUserId, updateDispensa, setUpdateDispensa }}>
                {userId ? <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ color, size }) => {
                            let iconName;
                            if (route.name === 'Home') {
                                iconName = 'home'
                            } else if (route.name === 'Dispensa') {
                                iconName = 'shopping-basket'
                            } else if (route.name === 'Localizza') {
                                iconName = 'location-arrow'
                            }
                            return <FontAwesome name={iconName} size={size} color={color} />;
                        },
                        tabBarActiveBackgroundColor: '#fdd9b4',
                        tabBarInactiveBackgroundColor: '#efe3d4',
                        tabBarActiveTintColor: '#d97817',
                        tabBarInactiveTintColor: 'gray',
                        headerStyle: {
                            backgroundColor: "#eebe8c"
                        },
                        headerRight: () => (
                            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                                <Text style={{ fontWeight: "bold", marginTop: 0 }}> Logout </Text>
                            </TouchableOpacity>
                        )
                    })}
                >
                    <Tab.Screen name="Home" component={Home2} />
                    <Tab.Screen name="Dispensa" component={Pantry} />
                    <Tab.Screen name="Localizza" component={Posizione} />
                </Tab.Navigator> :
                    <View style={{ marginTop: "80%" }}>
                        <ActivityIndicator size={"large"} color={"orange"} />
                    </View>}
            </contextPantry.Provider>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eebe8c",
        marginRight: 5
    }
})
