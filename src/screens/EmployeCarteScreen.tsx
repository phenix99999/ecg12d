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
import { authentificationGX, eliotActivateCard } from '../utils/connectorGiveX';
import { get, execScript } from '../utils/connectorFileMaker';

import NetworkUtils from '../utils/NetworkUtils';
import Toast, { BaseToast } from 'react-native-toast-message';

const { StatusBarManager } = NativeModules;

const toastConfig = {
    numeroDeFacturePasRempli: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Veuillez spécifier le numéro de facture.</Text>
            </View>


            <TouchableOpacity onPress={() => {
                Toast.hide();
            }
            } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, marginRight: 15, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),
    nipPasRempli: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Veuillez spécifier le numéro d'employé.
                </Text>
            </View>
            <View style={{ width: '30%', justifyContent: 'center' }}>

                <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginRight: 15, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
            </View>
        </View>
    ),
    nipInvalide: () => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Le NIP employé n'est pas valide.
                </Text>
            </View>
            <View style={{ width: '30%', justifyContent: 'center' }}>

                <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginRight: 15, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
            </View>
        </View>
    ),
};


async function activateCard(nip, facture, cardFM, cardGiveX) {



}
let keyboardDidHideListener;

const EmployeCarteScreen = ({ route, navigation, authStore }: Props) => {
    const [showToast, setShowToast] = React.useState(false);

    React.useEffect(() => {
        console.log(route);
    });


    const [nip, setNip] = React.useState("");
    const [facture, setFacture] = React.useState("");


    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }

    const authHeader = 'Basic ' + base64.encode(`${"Alain Simoneau"}:${"4251"}`);

    return (

        <View style={{ height: '100%', backgroundColor: 'white' }}>
            <SafeAreaView style={{ backgroundColor: '#231F20', height: 100, width: '100%' }}>
                <Row>
                    <Left>
                        <TouchableOpacity onPress={() => navigation.replace('CarteScreen')}>
                            <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                        </TouchableOpacity>
                    </Left>
                    <Body><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Activation</Text></Body>
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
                <TextInput value={nip} style={styles.input} placeholder="Nip employé" placeholderTextColor="#404040"
                    onChange={(e) => (setNip(e.nativeEvent.text))}
                />
            </View>


            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                <TextInput value={facture} style={styles.input} placeholder="Facture" placeholderTextColor="#404040"
                    onChange={(e) => (setFacture(e.nativeEvent.text))}
                />
            </View>
            {route.params.balanceGiveX == 0.00
                ?
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        onPress={async () => {



                            if (facture.length == 0) {
                                setShowToast(true);

                                Toast.show({
                                    type: 'numeroDeFacturePasRempli',
                                    autoHide: false,
                                    position: 'bottom',
                                });

                            } else if (nip.length == 0) {
                                setShowToast(true);

                                Toast.show({
                                    type: 'nipPasRempli',
                                    autoHide: false,
                                    position: 'bottom',
                                });

                            } else {
                                let activation = await eliotActivateCard(route.params.noDeCarteFM, route.params.noDeCarte, facture, SyncStorage.get('codeDeSecurite'), nip);
                                console.log(activation);
                                if (activation.success) {
                                    alert("DONE!");
                                } else {
                                    if (activation.error == "nipEmploye") {
                                        setShowToast(true);

                                        Toast.show({
                                            type: 'nipInvalide',
                                            autoHide: false,
                                            position: 'bottom',
                                        });

                                    } else {
                                        setShowToast(true);

                                        Toast.show({
                                            type: 'erreurInconnue',
                                            autoHide: false,
                                            position: 'bottom',
                                        });
                                    }
                                }
                            }



                            // await getCardInfo();
                        }}
                        style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                    >
                        <Text style={{ fontSize: 14, color: 'white' }}>ACTIVER</Text>
                    </Button>
                </View>
                :
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Cette carte a déjà un solde.</Text>
                </View>
            }


            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                    onPress={async () => {
                        navigation.replace('CarteScreen');
                    }}


                    style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "white", height: 40, padding: 15 }}
                >
                    <Text style={{ fontSize: 14, color: '#007CFF' }}> ANNULER</Text>
                </Button>
            </View>

            <View style={{ position: 'absolute', width: '95%', flexDirection: 'row', bottom: 0, marginLeft: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10, zIndex: 5555, backgroundColor: 'black', display: showToast ? 'visible' : 'none' }}>
                <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
            </View>


        </View >
    );
};
export default inject("authStore")(observer(EmployeCarteScreen));

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
    input: {
        fontSize: 18,

        width: '100%'
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
