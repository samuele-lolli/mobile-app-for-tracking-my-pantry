import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./src/components/authentication/Home";
import HomePantry from "./src/components/routing/HomePantry";
import * as SecureStore from "expo-secure-store";
import { context } from "./src/utils/context";
import { RootSiblingParent } from 'react-native-root-siblings';
import { LogBox } from "react-native";

const Stack = createNativeStackNavigator();
export default function App() {
    const [isLoggedIn, setLoggedIn] = useState(false);
    const [accessToken, setAccessToken] = useState(null)

    useEffect(() => {
        let isMounted = true
        let store = async () => {
            let accessToken = await SecureStore.getItemAsync("accessToken");
            console.log(accessToken)
            if (accessToken && isMounted) {
                setAccessToken(accessToken)
                setLoggedIn(true)
            }
        }
        store().then()

        return () => { isMounted = false }
    }, [])

    return (
        <>
            <RootSiblingParent>
                <NavigationContainer>
                    <context.Provider value={{ accessToken, setAccessToken, isLoggedIn, setLoggedIn }}>
                        <Stack.Navigator >
                            <Stack.Screen
                                name={isLoggedIn ? "HomePantry" : "Home"}
                                component={isLoggedIn ? HomePantry : Home}
                                options={{ headerShown: false }}
                            />
                        </Stack.Navigator>
                    </context.Provider>
                </NavigationContainer>
            </RootSiblingParent>
        </>
    );
}











LogBox.ignoreLogs(['Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake,']);
