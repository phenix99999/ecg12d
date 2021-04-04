import * as React from "react";
import { StyleSheet, SafeAreaView, Dimensions, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from 'sync-storage';
import { Camera } from 'expo-camera';

import Torch from 'react-native-torch';

import { BarCodeScanner } from 'expo-barcode-scanner';
import Toast, { BaseToast } from 'react-native-toast-message';

import { Audio } from 'expo-av';

import { inject, observer } from "mobx-react";
import {
    Body,
    Text,
    Button,
    Left,
    Row,
    Right,
    Icon,
    Form,
    Container
} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, Platform, NativeModules, TouchableOpacity } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import { get, execScript } from '../utils/connectorFileMaker';
import { Sound } from "react-native-sound";
import NetworkUtils from '../utils/NetworkUtils';

const { StatusBarManager } = NativeModules;

const toastConfig = {
    nbCaractereInvalideCarte: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: '70%', marginLeft: 10 }}>

                <Text style={{ color: 'white' }}>{"Veuillez vérifier les numéros de cartes saisis. Vous devez saisir 21 chiffres"}</Text>
            </View>

            <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 40 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),
    carteInvalide: () => (
        <View style={{ height: 200, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: '70%', marginLeft: 10, marginTop: 10 }}>

                <Text style={{ color: 'white' }}>Veuillez vérifier les numéros de cartes saisis. Si le problème persiste, il se peut que cette carte ne soit pas enregistrée dans notre système.
                Le client peut contacter le service à la clientèle Coffrets Prestige au 1800.701.9575. Merci de ne pas honorer la prestation tant que la carte n'est pas enregistrée et activée.
                </Text>
            </View>
            <View style={{ width: '30%', justifyContent: 'center' }}>

                <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 40 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
            </View>
        </View>
    )
};


let keyboardDidHideListener;

const PartenaireScreen = ({ navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);
    const [hasPermission, setHasPermission] = React.useState(null);
    const [flash, setFlash] = React.useState("off");
    const [scanned, setScanned] = React.useState(false);
    const [showBarCodeScanner, setShowBarCodeScanner] = React.useState(false);
    const [noDeCarteManuel, setNoDeCarteManuel] = React.useState("");
    const [sound, setSound] = React.useState();
    const [noDeCarteAutomatique, setNoDeCarteAutomatique] = React.useState("");

    async function onLoginPartenaire() {
        let auth = await authentificationGX(authStore.username, authStore.password);
        return auth;
    }




    async function getCardInfo() {

        let noDeCarte = "";

        if (noDeCarteAutomatique.length == 21) {
            noDeCarte = noDeCarteAutomatique;
        } else {
            noDeCarte = noDeCarteManuel
        }



        if (noDeCarte.length != 21) {
            if (noDeCarteManuel == "") {
                setNoDeCarteManuel(noDeCarteAutomatique);
            }
            Toast.show({
                type: 'nbCaractereInvalideCarte',
                autoHide: false,

            });
        } else {

            let noDeCarteFM = noDeCarte.substring(noDeCarte.length - 10, noDeCarte.length - 1);
            let cardInfo = await get("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "api_mobile_CARTE_DETAILS", "&Numero_final=" + noDeCarteFM);
            let nomCoffret = "";
            let lienCoffretLogo = "";
            let prixCoffret = ""
            let balanceGiveX = "";
            console.log(cardInfo);
            if (cardInfo.length == 0) {

                Toast.show({
                    type: 'carteInvalide',
                    autoHide: false,
                });

            } else {
                lienCoffretLogo = cardInfo[0]['COFFRETS_dans_CM::CP_Coffret_Logo'];
                lienCoffretLogo = "https://" + global.fmServer + lienCoffretLogo.replace(/&amp;/g, '&');
                nomCoffret = cardInfo[0]['COFFRETS_dans_CM::CP_Titre'];
                prixCoffret = cardInfo[0]['Prix_detail'];
                balanceGiveX = cardInfo[0]['Givex_balance'];
                navigation.navigate('PartenaireCarteScreen', { lienImage: lienCoffretLogo, nomCoffret: nomCoffret, prixCoffret: prixCoffret, balanceGiveX });
                // setNoDeCarteManuel("");
            }
            // console.log(cardInfo);

            // // console.log(cardInfo[0]['COFFRETS_dans_CM::CP_Coffret_Logo']);



        }


    }


    async function playBip() {

        const { sound } = await Audio.Sound.createAsync(
            require('../assets/bip.mp3')
        );
        setSound(sound);

        await sound.playAsync();
    }

    React.useEffect(() => {
        const getPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            // const cameraAllowed = await Torch.requestCameraPermission(
            //     'Camera Permissions', // dialog title
            //     'We require camera permissions to use the torch on the back of your phone.' // dialog body
            // );

            setHasPermission(status === 'granted');
        }
        getPermissions();

        const getCardInfoConst = async () => {
            await playBip();
            await getCardInfo();
        }

        if (noDeCarteAutomatique.length == 21) {
            getCardInfoConst();
        }




    }, [noDeCarteAutomatique]);

    const handleBarCodeScanned = ({ type, data }) => {
        // setScanned(true);
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        // alert(data);
        setNoDeCarteAutomatique(data.replace(/ /g, ''));
        // setScanned(false);
    };


    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };

    const barcodePng = 'data:image/gif;base64,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IEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAICg/wPlKFmWU0L9XgAAAABJRU5ErkJggg=='
    //ratio of camera 
    const cameraHeight = 0.33
    const isRatio = true

    return (


        <View>
            {isLoading ?
                <View style={[styles.container, styles.horizontal]}>

                    <ActivityIndicator size="large" color="black" />

                </View>


                :
                <View
                >

                    <View style={{ flexDirection: 'row', zIndex: 5555, backgroundColor: 'black' }}>
                        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                    </View>
                    <SafeAreaView style={{ backgroundColor: '#231F20', height: 122, width: '100%' }}>
                        <Row>


                            <Left style={{ marginLeft: 10 }}>
                                <Button
                                    transparent
                                    onPress={async () => {
                                        navigation.openDrawer();

                                    }}
                                >
                                    <Icon name="menu" type={"MaterialIcons"} style={{ fontSize: 30, color: 'white' }} />
                                </Button>
                            </Left>

                            <Body style={{ height: 80 }}>

                                <Image source={require('../assets/images/headerTitle.png')} resizeMode={'contain'} style={{ alignItems: 'center', margin: 8, width: 200, height: 50 }} />
                            </Body>
                            <Right>

                            </Right>
                        </Row>
                    </SafeAreaView>

                    <View style={styles.containerBarCode}>

                        {showBarCodeScanner ?
                            <View style={{ height: 300 }}>



                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <View
                                        style={{
                                            borderBottomColor: 'red',
                                            borderBottomWidth: 4,
                                            zIndex: 5554,
                                            position: 'absolute',
                                            width: '100%'
                                        }}
                                    />

                                    {/* <BarCodeScanner
                                    onBarCodeScanned={handleBarCodeScanned}
                                    style={StyleSheet.absoluteFillObject}
                                /> */}
                                    <Camera
                                        flashMode={flash}

                                        barCodeScannerSettings={{
                                            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.code128],
                                        }}
                                        onBarCodeScanned={handleBarCodeScanned}

                                        type={Camera.Constants.Type.back}>
                                        <View style={{ zIndex: 9999999999, flexDirection: 'row-reverse', backgroundColor: 'transparent', height: 30 }}>
                                            <TouchableOpacity
                                                style={{ width: 75, left: 0, backgroundColor: 'transparent' }}
                                                onPress={() => {
                                                    if (flash == 'off') {
                                                        setFlash('torch')
                                                    } else {
                                                        setFlash('off');
                                                    }
                                                }}
                                            >
                                                <Icon name={flash == 'torch' ? "flashlight-off" : "flashlight"} type="MaterialCommunityIcons" style={{ color: 'white' }} ></Icon>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity style={{ height: 300, width: 500, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                            setFlash('off');
                                            setShowBarCodeScanner(false);
                                        }} />



                                    </Camera>
                                </View>
                            </View>

                            :
                            <View>
                                <TouchableOpacity style={[styles.barcodeContainer]} onPress={() => setShowBarCodeScanner(true)}>
                                    <ImageBackground
                                        resizeMode={'cover'}
                                        source={{ uri: barcodePng }}
                                        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                        imageStyle={{ opacity: 0.3 }}>
                                        <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <View

                                                style={{ backgroundColor: '#e2e2e2', justifyContent: 'center', alignItems: 'center', width: 175, height: 38 }}>
                                                <Text style={{ fontWeight: 'bold' }}>NUMÉRISER</Text>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        }


                        <View style={{ flexDirection: 'row', width: '100%' }}>

                            <TextInput
                                placeholderTextColor="#404040"
                                style={{ height: 45, top: 25, width: '100%', borderBottomWidth: 0.5, borderColor: '#303030', marginLeft: 17 }}
                                value={noDeCarteManuel}
                                onChange={(e) => (setNoDeCarteManuel(e.nativeEvent.text))}
                                placeholder="Numéro de carte"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                            <Button
                                onPress={async () => {

                                    await getCardInfo();

                                }}


                                style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                            >
                                <Text style={{ fontSize: 14 }}> SOUMETTRE</Text>
                            </Button>


                        </View>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                            <Button
                                onPress={async () => {

                                    Torch.switchState(true); // Turn ON


                                }}


                                style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                            >
                                <Text style={{ fontSize: 14 }}> Flash ON</Text>
                            </Button>

                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                            <Button
                                onPress={async () => {

                                    Torch.switchState(false); // Turn ON

                                }}


                                style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                            >
                                <Text style={{ fontSize: 14 }}> Flash OFF</Text>
                            </Button>

                        </View> */}


                    </View>


                </View>
            }


        </View >
    );
};
export default inject("authStore")(observer(PartenaireScreen));

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
    barcodeContainer: {
        height: 300,
        overflow: 'hidden'
    },
});
