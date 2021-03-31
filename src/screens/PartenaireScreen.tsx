import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from 'sync-storage';


import { BarCodeScanner } from 'expo-barcode-scanner';
import { Root } from "native-base";
import { inject, observer } from "mobx-react";
import {

    Text,
    Button,

    Form,

} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, Platform, NativeModules, TouchableOpacity } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import NetworkUtils from '../utils/NetworkUtils';

const { StatusBarManager } = NativeModules;



let keyboardDidHideListener;

const LoginScreen = ({ navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);
    const [hasPermission, setHasPermission] = React.useState(null);
    const [scanned, setScanned] = React.useState(false);
    const [showBarCodeScanner, setShowBarCodeScanner] = React.useState(false);
    const [noDeCarteManuel, setNoDeCarteManuel] = React.useState("");

    async function onLoginPartenaire() {
        let auth = await authentificationGX(authStore.username, authStore.password);
        return auth;
    }


    async function _keyboardDidHide() {
        // alert("Keyboard did hide " + authStore.username.length + " " + authStore.password.length);
        // if (!isLoadingTemp && authStore.password.length > 2) {
        //     // alert("Avant executer onconnected");
        //     setLoadingTemp(true);
        //     await onLogin();
        // }
    }



    React.useEffect(() => {
        const getPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        }

        getPermissions();

        // alert(StatusBar.currentHeight);
        if (SyncStorage.get('username')) {
            authStore.username = SyncStorage.get('username');
        }


    });

    const handleBarCodeScanned = ({ type, data }) => {
        // setScanned(true);
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        setNoDeCarteManuel(data);
        // setScanned(false);
    };

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };


    return (


        <View>
            { isLoading ?
                <View style={[styles.container, styles.horizontal]}>

                    <ActivityIndicator size="large" color="black" />

                </View>


                :
                <ImageBackground
                    source={require("../assets/images/backgroundImage.jpg")}
                    style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.1 }}

                >

                    <SafeAreaView style={{ backgroundColor: '#231F20', height: 170, width: '100%' }}>
                        <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>

                            <Image source={require('../assets/images/headerTitle.png')} resizeMode={'contain'} style={{ alignItems: 'center', margin: 8, width: 200, height: 50 }} />
                        </View>

                    </SafeAreaView>

                    <View style={styles.containerBarCode}>

                        {showBarCodeScanner ?
                            <View style={{ height: 250 }}>

                                <BarCodeScanner
                                    onBarCodeScanned={handleBarCodeScanned}
                                    style={StyleSheet.absoluteFillObject}
                                />
                            </View>
                            :
                            <View>
                                <ImageBackground source={require('../assets/images/code_bar.jpeg')} style={{ width: '100%', height: 175 }} >
                                    <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                                        <TouchableOpacity
                                            onPress={() => setShowBarCodeScanner(true)}
                                            style={{ backgroundColor: 'gray', justifyContent: 'center', alignItems: 'center', width: 175, height: 38 }}>
                                            <Text>NUMÉRISER</Text>
                                        </TouchableOpacity>


                                    </View>
                                </ImageBackground>

                            </View>
                        }




                        <View style={{ flexDirection: 'row', width: '100%' }}>

                            <TextInput
                                placeholderTextColor="#404040"
                                style={{ height: 45, top: 25, width: '100%', borderBottomWidth: 0.5, borderColor: '#303030', marginLeft: 17 }}
                                value={""}
                                onChange={(e) => (authStore.username = e.nativeEvent.text)}
                                placeholder="Numéro de carte"
                            />


                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                            <Button
                                onPress={async () => {

                                }}


                                style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                            >
                                <Text style={{ fontSize: 14 }}> SOUMETTRE</Text>
                            </Button>

                        </View>

                    </View>


                </ImageBackground>
            }


        </View >
    );
};
export default inject("authStore")(observer(LoginScreen));

const styles = StyleSheet.create({
    containerBarCode: {


    },
    container: {
        flex: 1,

    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },

    imgBackground: {
        width: "100%",
        height: "100%",

    },
    content: {
        flexDirection: "column",
        flex: 1,
        flexGrow: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        width: 200,
        margin: 20,
        alignSelf: "center",
        textAlign: "center",
        justifyContent: "center",
        backgroundColor: "#0F29AC",
    },
    horizontalRule: {
        borderBottomColor: "black",
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    form: {
        backgroundColor: "transparent",
        alignItems: 'center',
    },

});
