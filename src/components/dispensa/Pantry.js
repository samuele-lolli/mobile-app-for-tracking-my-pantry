import React, {useContext, useEffect, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {Button, Overlay, Text, SearchBar} from "react-native-elements";
import {Card} from "react-native-elements";
import {contextPantry} from "../../utils/context";
import {db} from "../../utils/SQLite"
import DateTimePicker from "@react-native-community/datetimepicker";
import {isFirstRender} from "../../utils/isFirstRender";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function Pantry() {
    const contestPantry = useContext(contextPantry)
    const [isPickerShow, setIsPickerShow] = useState(false);
    const [productId, setProductId] = useState();
    const [date, setDate] = useState(new Date());
    const [showExp, setShowExp] = useState([])
    const [dispensa, setDispensa] = useState([])
    const [show, setShow] = useState(false)
    const [visible, setVisible] = useState(false);
    const [continua, setContinua] = useState(false)
    const [searchValue, setSearchValue] = useState('');
    const [fullData, setFullData] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    const searchFunction = (text) => {
        const updatedData = fullData.filter((item) => {
            const item_data = `${item.name.toUpperCase()})`;
            const text_data = text.toUpperCase();
            return item_data.indexOf(text_data) > -1;
        });
        setDispensa(updatedData)
        setSearchValue(text)
    };

    let isFirst = isFirstRender()
    useEffect(() => {
        if(!isFirst){
            setDispensa(contestPantry.updateDispensa)
            setFullData(contestPantry.updateDispensa)
        }
    },[contestPantry.updateDispensa])


    //carica prodotti dispensa da SQLite
    useEffect(() => {
        let isMounted = true
        const getProducts = async () => {
            await db.transaction(tx => {
                    tx.executeSql(
                        `select * from prodotti where userId = "${contestPantry.userId}"`,
                        null,
                        (_, { rows: { _array } }) => {
                            setDispensa(_array)
                            setContinua(true)
                            setFullData(_array)
                        }
                    )
                },
                (error) => {console.log(error)},
                () => {console.log("success")}
            )
        }
        getProducts().then()
        return () => { isMounted = false }
    },[])

    //cancella prodotti dispensa da SQLite
    const deleteProduct = async (id) => {
        console.log(id)
        db.transaction(tx => {
                tx.executeSql(
                    `delete from prodotti where idProdotto = "${id}" and userId = "${contestPantry.userId}";`
                );
            },
            (error) => {console.log(error)},
            () => {
                console.log('success')
                db.transaction(tx => {
                        tx.executeSql(
                            `select * from prodotti where userId = "${contestPantry.userId}";`,
                            null,
                            (_, { rows: { _array } }) => {
                                console.log(_array)
                                contestPantry.setUpdateDispensa(_array)
                                setContinua(true)
                                setFullData(_array)
                                setIsLoading(false)
                            }
                        )
                    },
                    (error) => {console.log(error)},
                    () => {console.log("success")}
                )
            },
        );
    }

    //card dispensa
    const renderItem = ({item}) => {
        return (
            <View style={{alignItems: "center"}}>
                <Card containerStyle={{width:"80%", height:275, backgroundColor:"#eebe8c", borderRadius: 10, borderColor:"#6f6f72"}}>
                    <Card.Title style={{fontWeight:"bold", fontSize:20, textAlign: "left"}}>{item["name"] !== undefined ? item["name"].toUpperCase() : null}</Card.Title>
                    <View style={{alignItems: "center", justifyContent:"center", flexDirection: "row", marginTop: -25}}>
                        <TouchableOpacity onPress={() => deleteProduct(item["idProdotto"])} style={{marginTop: -12, marginLeft: 15, position: "absolute", right: 0 }}>
                            <FontAwesome name={"trash"} size={27} color={"black"} style={{marginTop: -12}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showPicker(item["idProdotto"])} style={{marginTop: -12, marginLeft: 15, position: "absolute", right: 35 }}>
                            <FontAwesome name={"calendar"} size={22} color={"black"} style={{marginTop: -12}}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={{fontSize: 15, textAlign:"center", marginTop: 15}}>
                        {item["description"]}
                    </Text>
                    <Text style={{fontSize: 15, textAlign:"center"}}> Data di scadenza: {item["dataScadenza"] ? item["dataScadenza"].substring(4, 15) : null} </Text>
                    <View style={{alignItems:"center"}}>
                        {item["img"] ? <Card.Image style={{width: 220, height:160}} source={{uri: item["img"]}} /> : null}
                    </View>
                </Card>
            </View>
        )
    }

    const renderItem2 = ({item}) => {
        return (
            <View >
                <Text style={{textAlign:"center", fontSize: 15, fontWeight:"100"}}> {item["name"]} </Text>
            </View>
        )
    }

    const showPicker = (id) => {
        setIsPickerShow(!isPickerShow);
        setProductId(id)
    };

    const onChange = (event, value) => {
        if (Platform.OS === 'android') {
            setIsPickerShow(false);
        }
        if(value !== undefined){
            setDate(value);
        }
    };

    const isMount = isFirstRender()
    useEffect(() => {
        if(!isMount) {
            const postDate = async () => {
                db.transaction(tx => {
                    tx.executeSql(
                        `select idProdotto from prodotti where idProdotto = "${productId}" and userId = "${contestPantry.userId}"`,
                        null,
                        (_, { rows: { _array } }) => {
                            console.log(_array)
                            if(_array.length > 0){
                                db.transaction(tx => {
                                        tx.executeSql(
                                            `update prodotti set dataScadenza = "${date}" where idProdotto="${productId}" and userId = "${contestPantry.userId}"`
                                        );
                                    },
                                    (error) => {console.log(error)},
                                    () => {
                                        console.log("ok data")
                                        db.transaction(tx => {
                                                tx.executeSql(
                                                    `select * from prodotti where userId = "${contestPantry.userId}"`,
                                                    null,
                                                    (_, { rows: { _array } }) => {
                                                        setDispensa(_array)
                                                        setFullData(_array)
                                                    }
                                                )
                                            }
                                        )
                                    },
                                );
                            }
                        }
                    );
                })
            }
            postDate().then()
        }
    },[date])

    useEffect(() => {
        let isMounted = true
        let array = []
        let array2 = []
        let today = new Date().toDateString().substring(0,15)
        let tomorrow = new Date(today).addDays(1)
        let twoDaysNext = new Date(today).addDays(2)
        for(let i = 0; i<dispensa.length; i++){
            if(dispensa[i]["dataScadenza"]){
                array[i] = dispensa[i]
            }
        }
        let arrayFilter = array.filter(Boolean)
        for (let i = 0; i < arrayFilter.length; i++) {
            if(today === arrayFilter[i]["dataScadenza"].substring(0,15) ||
                tomorrow.toDateString().substring(0,15) === arrayFilter[i]["dataScadenza"].substring(0,15) ||
                twoDaysNext.toDateString().substring(0,15) === arrayFilter[i]["dataScadenza"].substring(0,15)){
                array2[i] = arrayFilter[i]
            }
        }
        let arrayFilter2 = array2.filter(Boolean)
        if(isMounted){
            setShowExp(arrayFilter2)
        }
        return () => isMounted = false
    },[continua])

    useEffect(() => {
        let isMounted = true
        if(showExp.length > 0 && isMounted){
            setVisible(true)
            setShow(true)
        }

        return () => isMounted = false
    },[showExp])

    return (
        <>
            <ImageBackground source={require('../../../assets/sfondoApp2.jpg')} resizeMode="cover" style={styles.image}>
                <View style={styles.centeredView}>
                    <Overlay
                        isVisible={visible}
                        onBackdropPress={() => setVisible(!visible)}
                        overlayStyle={{height: "60%", width: "75%", backgroundColor:"#EEBE8CFF", borderWidth: 1, borderColor:"grey"}}
                    >
                        <Text style={{textAlign:"center", fontSize: 20, fontWeight: "bold"}}> PRODOTTI IN SCADENZA </Text>
                        {show ? <FlatList
                            data={showExp}
                            renderItem={renderItem2}
                            keyExtractor={(item, index) => index.toString()}
                        /> : null}
                        <Text style={{textAlign:"center", fontSize: 15, fontWeight: "bold", marginBottom: 10}}>
                            Controlla la tua dispensa per maggiori informazioni
                        </Text>
                        <View style={{alignItems: "center"}}>
                            <Button
                                title="OK"
                                buttonStyle={{backgroundColor: "#d97817", height: 30, width: 50}}
                                onPress={() => setVisible(false)}
                            />
                        </View>

                    </Overlay>
                    <SearchBar
                        placeholder="Search"
                        onChangeText={queryText => searchFunction(queryText)}
                        lightTheme
                        round
                        value={searchValue}
                        autoCorrect={false}
                        inputStyle={{height: 25}}
                        inputContainerStyle={{height: 25, backgroundColor: "#eebf8f"}}
                        containerStyle={{height:48, width:"95%", backgroundColor:"transparent", borderTopColor:"transparent", borderBottomColor: "transparent"}}
                    />
                    {isLoading && <ActivityIndicator color={"orange"} size={"large"}/>}
                    <SafeAreaView style={{flex: 50, width: "95%"}}>
                        {dispensa.length > 0 ?
                            <FlatList
                                initialNumToRender={2}
                                removeClippedSubviews={true}
                                data={dispensa}
                                renderItem={renderItem}
                                keyExtractor={item => item["idProdotto"].toString()}
                            /> : <Text style={{textAlign: "center"}}> Nessun prodotto nella dispensa </Text> }
                        {isPickerShow && (
                            <DateTimePicker
                                value={date || new Date()}
                                mode={'date'}
                                display='default'
                                is24Hour={true}
                                onChange={onChange}
                                onTouchCancel={() => setDate(new Date())}
                                style={{
                                    shadowColor: '#fff',
                                    shadowRadius: 0,
                                    shadowOpacity: 1,
                                    shadowOffset: { height: 0, width: 0 },
                                }}
                            />
                        )}
                    </SafeAreaView>
                </View>
            </ImageBackground>
        </>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,flexDirection: "column", width: "100%",
        alignItems: "center"
    },
    image: {
        width: "100%",
        height: "100%"
    }
})

Date.prototype.addDays = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

