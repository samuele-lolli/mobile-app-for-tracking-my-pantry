import React, { useContext, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Overlay, Text } from "react-native-elements";
import { context, contextPantry } from "../../utils/context";
import { db } from "../../utils/SQLite"
import { AirbnbRating } from "react-native-ratings";
import Toast from "react-native-root-toast";
import MapView, { Marker } from "react-native-maps";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function ProductList(props) {
    const contestPantry = useContext(contextPantry)
    const contest = useContext(context)
    const [rate, setRate] = useState(0)
    const [visible, setVisible] = useState(false)
    const [selectedCoordinate, setSelectedCoordinate] = useState(null)
    const [product, setProduct] = useState(null)

    const toastOptions = {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: "grey"
    }

    const addToPantry = async (booleano) => {
        let coordinate;
        coordinate = selectedCoordinate //se l'utente ha selezionato una location diversa da quella attuale seleziono quella
        if (selectedCoordinate === null && props.location) {  //se l'utente non ha selezionato una posizione, prendo quella corrente.
            coordinate = { latitude: props.location.coords.latitude, longitude: props.location.coords.longitude }
        }
        if (!booleano) {  //se l'utente ha chiuso la mappa setto le coordinate a null
            setSelectedCoordinate(null)
            coordinate = { latitude: null, longitude: null }
        }

        db.transaction(tx => {
            tx.executeSql(
                `select name from prodotti where name = "${product.name}" and userId = "${contestPantry.userId}"`,
                null,
                (_, { rows: { _array } }) => {
                    if (_array.length === 0) {
                        db.transaction(tx => {
                            tx.executeSql(
                                `insert into prodotti (idProdotto, name, userId, barcode, description, img, latitude, longitude ) values (?,?,?,?,?,?,?,?);`,
                                [product["id"], product["name"], contestPantry.userId, product["barcode"], product["description"], product["img"], coordinate.latitude, coordinate.longitude]
                            );
                        },
                            (error) => { console.log(error) },
                            () => {
                                db.transaction(tx => {
                                    tx.executeSql(
                                        `select * from prodotti where userId = "${contestPantry.userId}"`,
                                        null,
                                        (_, { rows: { _array } }) => {
                                            contestPantry.setUpdateDispensa(_array)
                                            Toast.show('Prodotto aggiunto alla dispensa', toastOptions);
                                            setVisible(false)
                                        }
                                    )
                                }
                                )
                            },
                        );
                    } else {
                        Toast.show("Questo prodotto è già presente nella dispensa!", toastOptions);
                        setVisible(false)
                    }
                }
            );
        })
    }

    //voto i prodotti con una POST sul db remoto
    const ratingCompleted = async (rating, productId) => {
        const response = await fetch('api/votes', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + contest.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: props.sessionToken,
                rating: parseInt(rating),
                productId: productId
            })
        });
        let json = await response.json()
        console.log(json)
        setRate(0)
    }

    const openOverlay = (item) => {
        setVisible(true)
        setSelectedCoordinate(null)
        setProduct(item)
    }

    const keyExtractor = (item) => item.id //estraggo la key univoca per ogni item, in questo caso è l'id del prodotto

    //per ogni item creo una card con tutto il necessario (voto, titolo, descrizione, etc)
    const renderItem = ({ item }) => {
        return (
            <View style={styles.containerCard}>
                <Card containerStyle={styles.card}>
                    <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", marginTop: -10 }}>
                        <Card.Title style={styles.cardTitle}>{item["name"].toUpperCase()}</Card.Title>
                        <TouchableOpacity onPress={() => openOverlay(item)} style={{ marginTop: -12, marginLeft: 15, position: "absolute", right: 0 }}>
                            <FontAwesome name={"shopping-basket"} size={23} color={"black"} style={{ marginTop: -12 }} />
                        </TouchableOpacity>
                    </View>
                    <AirbnbRating
                        count={3}
                        showRating={false}
                        defaultRating={rate}
                        size={17}
                        onFinishRating={(rate) => ratingCompleted(rate, item["id"])}
                        starContainerStyle={styles.containerRating}
                        selectedColor={"orange"}
                        unSelectedColor={"#c4a689"}
                    />
                    <View style={styles.containerCardDescr}>
                        <Text style={styles.cardDescription}>
                            {item["description"]}
                        </Text>
                        <View style={styles.cardImg}>
                            {item["img"] ? <Card.Image style={styles.img} source={{ uri: item["img"] }} /> : null}
                        </View>
                    </View>
                </Card>
            </View>
        )
    }

    return (
        <>
            <SafeAreaView style={styles.containerList}>
                {props.openScanner === false ? <Text style={styles.titleList}>
                    LISTA DEI PRODOTTI SIMILI
                </Text> : null}
                {props.products.length > 0 ?
                    <FlatList
                        getItemLayout={(data, index) => (
                            { length: 307, offset: 307 * index, index }
                        )}
                        initialNumToRender={2}
                        removeClippedSubviews={true}
                        data={props.products}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                    /> :
                    <Text style={styles.noList}>
                        Nessun prodotto trovato.
                    </Text>}
            </SafeAreaView>
            <Overlay
                isVisible={visible}
                onBackdropPress={() => setVisible(!visible)}
                overlayStyle={{ height: "80%", width: "87%", backgroundColor: "#EEBE8CFF", borderWidth: 1, borderColor: "black" }}
            >
                <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold" }}> POSIZIONE ACQUISTO </Text>
                <Text style={{ textAlign: "center", fontSize: 13 }}> Puoi selezionare la posizione attuale, una posizione a tua scelta oppure decidere di continuare senza aggiungere una posizione
                    di acquisto.
                </Text>
                <View style={styles.containerMap}>
                    {props.location ?
                        <MapView style={styles.map}
                            initialRegion={{
                                latitude: props.location.coords.latitude,
                                longitude: props.location.coords.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005
                            }}
                            onPress={e => { setSelectedCoordinate(e.nativeEvent.coordinate) }}
                        >
                            {selectedCoordinate ?
                                <Marker
                                    title="Luogo di acquisto"
                                    coordinate={{ latitude: selectedCoordinate["latitude"], longitude: selectedCoordinate["longitude"] }}
                                /> : null}
                            <Marker
                                title="Ti trovi qui ora!"
                                coordinate={{ latitude: props.location.coords.latitude, longitude: props.location.coords.longitude }}
                            />
                        </MapView> : null}
                    {props.locationPermission ? <Text style={{ textAlign: "center" }}> {props.locationPermission} </Text> : null}
                    <View style={{ flexDirection: "row" }}>
                        {!props.locationPermission && props.location ? <Button
                            title="Aggiungi posizione"
                            buttonStyle={{ backgroundColor: "#d97817", marginTop: 12, marginRight: 10 }}
                            onPress={() => addToPantry(true)}
                        /> : null}
                        <Button
                            title="Continua"
                            buttonStyle={{ backgroundColor: "#d97817", marginTop: 12 }}
                            onPress={() => addToPantry(false)}
                        />
                    </View>

                </View>
            </Overlay>
        </>
    );
}

const styles = StyleSheet.create({
    containerCard: {
        alignItems: "center"
    },
    card: {
        width: "85%",
        height: 250,
        backgroundColor: "#eebe8c",
        borderRadius: 10,
        borderColor: "#6f6f72"
    },
    cardTitle: {
        fontWeight: "bold",
        fontSize: 20
    },
    containerRating: {
        position: "relative",
        top: -11
    },
    containerCardDescr: {
        position: "relative",
        top: -13
    },
    cardDescription: {
        fontSize: 14,
        textAlign: "center"
    },
    cardImg: {
        alignItems: "center"
    },
    img: {
        width: 220,
        height: 150
    },
    containerList: {
        flex: 50,
        width: "95%"
    },
    titleList: {
        textAlign: "center",
        color: "grey",
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 0,
        backgroundColor: "#eebe8c",
        borderRadius: 10
    },
    noList: {
        textAlign: "center",
        color: "grey",
        fontSize: 15,
        fontWeight: "bold",
        marginVertical: 10
    },
    containerMap: {
        alignItems: "center",
        justifyContent: "center"
    },
    map: {
        height: "75%",
        width: 300,
        marginTop: -15
    },
})




