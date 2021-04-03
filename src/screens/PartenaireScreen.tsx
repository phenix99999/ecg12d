import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
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

    async function onLoginPartenaire() {
        let auth = await authentificationGX(authStore.username, authStore.password);
        return auth;
    }




    async function getCardInfo() {
        if (noDeCarteManuel.length != 21) {
            Toast.show({
                type: 'nbCaractereInvalideCarte',
                autoHide: false,

            });
        } else {

            let noDeCarteFM = noDeCarteManuel.substring(noDeCarteManuel.length - 10, noDeCarteManuel.length - 1);
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
            }
            console.log(cardInfo);

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

        if (noDeCarteManuel.length == 21) {
            getCardInfoConst();
        }




    }, [noDeCarteManuel]);

    const handleBarCodeScanned = ({ type, data }) => {
        // setScanned(true);
        // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        alert(data);
        setNoDeCarteManuel(data.replace(/ /g, ''));
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
            {isLoading ?
                <View style={[styles.container, styles.horizontal]}>

                    <ActivityIndicator size="large" color="black" />

                </View>


                :
                <ImageBackground
                    source={require("../assets/images/backgroundImage.jpg")}
                    style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.1 }}

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
                      <View style={{height: 400}}>
                     <View style={{zIndex:9999999999,backgroundColor:'black',position:'absolute',flexDirection:'row'}}>
                                <TouchableOpacity
                                    onPress={()=> {
                                        if(flash =='off'){
                                            setFlash('torch')
                                        }else{
                                            setFlash('off');
                                        }
                                    }}
                                >
                                 <Icon name={flash == 'torch' ? "flashlight-off" : "flashlight"} type="MaterialCommunityIcons" style={{ color: 'white',fontWeight: 'bold',marginLeft:'94%' }}></Icon>
                                </TouchableOpacity>
                            </View>
             
                   

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
                                <View style={{height:400,width:500,alignItems:'center',justifyContent:'center'}}>
                                <TouchableOpacity
                                    onPress={() => setShowBarCodeScanner(false)}
                                    style={{ zIndex: 5555, backgroundColor: '#e2e2e2', justifyContent: 'center', alignItems: 'center', width: 175, height: 38 }}>
                                    <Text style={{ fontWeight: 'bold' }}>NUMÉRISER</Text>
                                </TouchableOpacity>

                                </View>
                            </Camera>
                            </View>
                            </View>
                      
                            :
                            <View>
                              
                                <ImageBackground source={require('../assets/images/code_bar.jpeg')} style={{ width: '100%', height: 400 }} >
                                    <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() => setShowBarCodeScanner(true)}
                                            style={{  backgroundColor: '#e2e2e2', justifyContent: 'center', alignItems: 'center', width: 175, height: 38 }}>
                                    <Text style={{ fontWeight: 'bold' }}>NUMÉRISER</Text>
                                        </TouchableOpacity>

                                    </View>
                                </ImageBackground>

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


                </ImageBackground>
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

});
