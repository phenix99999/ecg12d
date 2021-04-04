import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from 'sync-storage';

import base64 from 'react-native-base64';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { Root } from "native-base";
import { inject, observer } from "mobx-react";
import {
    Right,
    Text,
    Button,
    Left,
    Body,
    Form,
    Row,
    Icon,
} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, Platform, NativeModules, TouchableOpacity } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import { get, execScript } from '../utils/connectorFileMaker';

import NetworkUtils from '../utils/NetworkUtils';

const { StatusBarManager } = NativeModules;



let keyboardDidHideListener;

const PartenaireCarteScreen = ({ route, navigation, authStore }: Props) => {


    console.log(route.params);
    React.useEffect(() => {
        console.log(route);
    });


    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }

    const authHeader = 'Basic ' + base64.encode(`${"Alain Simoneau"}:${"4251"}`);

    return (

        <View style={{ height: '100%', backgroundColor: 'white' }}>
            <SafeAreaView style={{ backgroundColor: '#231F20', height: 100, width: '100%' }}>
                <Row>
                    <Left>
                        <TouchableOpacity onPress={() => navigation.replace('PartenaireScreen')}>
                            <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                        </TouchableOpacity>
                    </Left>
                    <Body><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}> Encaissement</Text></Body>
                    <Right></Right>
                </Row>

            </SafeAreaView>
            <SafeAreaView style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    style={{ height: 135, width: 250, marginTop: 15 }}
                    source={
                        {
                            uri: route.params.lienImage,
                            headers: {
                                Authorization: authHeader
                            }
                        }
                    } />


            </SafeAreaView >
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                <Text style={{ fontSize: 16 }}>Produit</Text>
                <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.nomCoffret}</Text>

            </View>

            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                <Text style={{ fontSize: 16 }}>Prix de détail</Text>
                <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.prixCoffret}</Text>
            </View>


            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                <Text style={{ fontSize: 16 }}>Balance</Text>
                <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.balanceGiveX}</Text>
            </View>
            {route.params.balanceGiveX != 0.00
                ?
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        onPress={async () => {
                            alert("Bientot");
                            // await getCardInfo();
                        }}
                        style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                    >
                        <Text style={{ fontSize: 14 }}>ENCAISSER</Text>
                    </Button>
                </View>
                :
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Cette carte a déjà été encaissée. Le client peut contacter le service à la clientèle Coffrets Prestige au 1 800.701.9575. Merci de ne pas honorer la prestation.</Text>
                </View>
            }


            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                    onPress={async () => {
                        navigation.replace('PartenaireScreen');

                    }}


                    style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "white", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                >
                    <Text style={{ fontSize: 14, color: 'darkblue' }}> ANNULER</Text>
                </Button>
            </View>

        </View >
    );
};
export default inject("authStore")(observer(PartenaireCarteScreen));

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
