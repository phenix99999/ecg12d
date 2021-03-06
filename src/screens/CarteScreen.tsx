import * as React from "react";
import { StyleSheet, SafeAreaView, Dimensions, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import En from '../../en.json'
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
    Container,
    Root,
} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, Platform, NativeModules, TouchableOpacity } from "react-native";
import AuthStore from "../stores/AuthStore";
import { get, execScript } from '../utils/connectorFileMaker';
import { Sound } from "react-native-sound";


import { useFocusEffect } from '@react-navigation/native';


const { StatusBarManager } = NativeModules;

const toastConfig = {
    nbCaractereInvalideCarte: () => (
        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Veuillez vérifier les numéros de cartes saisis. Vous devez saisir 21 chiffres.</Text>
            </View>

            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() =>
                    Toast.hide()

                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    nbCaractereInvalideCarteE: () => (
        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Please check the card numbers entered. You must enter 21 digits.</Text>
            </View>

            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() =>
                    Toast.hide()

                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    carteInvalide: () => (
        <View style={{ height: Platform.OS === "ios" ? 200 : 150, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '95%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Veuillez vérifier les numéros de cartes saisis. Si le problème persiste, il se peut que cette carte ne soit pas enregistrée dans notre système.
                Le client peut contacter le service à la clientèle de Coffrets Prestige au 1800.701.9575. Merci de ne pas honorer la prestation tant que la carte n'est pas enregistrée et activée.
                </Text>
            </View>
            {Platform.OS == "ios" ?

                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>

                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>
                :

                null}
        </View>
    ),
    carteInvalideE: () => (
        <View style={{ height: Platform.OS === "ios" ? 200 : 150, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '95%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Please check the card numbers entered. If the problem persists, this card may not be registered in our system.
                The customer can contact Giftjoy customer service at 1800.701.9575. Please do not honor the service until the card is registered and activated.
                </Text>
            </View>
            {Platform.OS == "ios" ?

                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>

                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>
                :

                null}
        </View>
    )
};


let keyboardDidHideListener;

const CarteScreen = ({ navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);
    const [hasPermission, setHasPermission] = React.useState(null);
    const [flash, setFlash] = React.useState("off");
    const [scanned, setScanned] = React.useState(false);
    const [showBarCodeScanner, setShowBarCodeScanner] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);
    const [focus, setFocus] = React.useState("");

    const [noDeCarteManuel, setNoDeCarteManuel] = React.useState("");
    const [sound, setSound] = React.useState();
    const [noDeCarteAutomatique, setNoDeCarteAutomatique] = React.useState("");

    const [isEnglish, setIsEnglish] = React.useState<Boolean>(false);
    const [langChange, setLangChange] = React.useState("");

    async function getCardInfo() {
        console.log("GET CARD INFO ");
        // setShowToast(false);

        // //603628726841965667180
        let noDeCarte = "";
        let navigateTo = "PartenaireCarteScreen";

        if (await SyncStorage.getItem('connectedPointDeVente') == "true") {
            navigateTo = "EmployeCarteScreen";
        } else if (await SyncStorage.getItem('connectedPartenaire') == "true") {
            navigateTo = "PartenaireCarteScreen";
        }

        if (noDeCarteAutomatique.length == 21) {
            noDeCarte = noDeCarteAutomatique;
        } else {
            noDeCarte = noDeCarteManuel
        }

        if (noDeCarte.length != 21) {

            setShowToast(true);
            if (langChange == 'en') {
                Toast.show({
                    type: 'nbCaractereInvalideCarteE',
                    autoHide: Platform.OS == "ios" ? false : true,
                    position: 'bottom',
                });
            } else {
                Toast.show({
                    type: 'nbCaractereInvalideCarte',
                    autoHide: Platform.OS == "ios" ? false : true,
                    position: 'bottom',
                });
            }

        } else {
            setLoading(true);

            let noDeCarteFM = noDeCarte.substring(noDeCarte.length - 10, noDeCarte.length - 1);
            console.log("Avant le call..");
            let cardInfo = await execScript("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "api_mobile_CARTE_DETAILS", "&Numero_final=" + noDeCarteFM, "Givex_GetBalance");
            console.log(cardInfo);
            let nomCoffret = "";
            let lienCoffretLogo = "";
            let prixCoffret = ""
            let balanceGiveX = "";
            let encaissementPartiel = false;
            if (cardInfo.length == 0) {
                setLoading(false);
                setShowToast(true);
                if (langChange == 'en') {
                    Toast.show({
                        type: 'carteInvalideE',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                } else {
                    Toast.show({
                        type: 'carteInvalide',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }

            } else {
                lienCoffretLogo = cardInfo[0]['COFFRETS_dans_CM::CP_Coffret_Logo'];
                lienCoffretLogo = "https://" + global.fmServer + lienCoffretLogo.replace(/&amp;/g, '&');
                nomCoffret = cardInfo[0]['COFFRETS_dans_CM::CP_Titre'];
                prixCoffret = cardInfo[0]['Prix_detail'];
                balanceGiveX = cardInfo[0]['Givex_balance'];
                setShowToast(false);
                encaissementPartiel = cardInfo[0]['COFFRETS_dans_CM::Flag_encaissement_partiel'];
                navigation.navigate(navigateTo, {
                    lienImage: lienCoffretLogo, nomCoffret: nomCoffret,
                    prixCoffret: prixCoffret, balanceGiveX: balanceGiveX, noDeCarte: noDeCarte, noDeCarteFM: noDeCarteFM, encaissementPartiel: encaissementPartiel
                });
                setLoading(false);
            }
        }


    }



    async function playBip() {

        const { sound } = await Audio.Sound.createAsync(
            require('../assets/bip.mp3')
        );
        setSound(sound);
        setFlash("off");
        await sound.playAsync();
    }
    useFocusEffect(

        React.useCallback(() => {

            setLoading(false);


            const showLayoutOnLanguage = async () => {
                if (await SyncStorage.getItem('language') == null) {
                    setLangChange('fr');
                    setIsEnglish(false);
                } else if (await SyncStorage.getItem('language') == 'fr') {
                    setLangChange('fr');
                    setIsEnglish(false);
                } else if (await SyncStorage.getItem('language') == 'en') {
                    setLangChange('en');
                    setIsEnglish(true);
                }
            }

            showLayoutOnLanguage();



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
                console.log("No de carte automatique " + noDeCarteAutomatique);
                if (scanned) {

                    await playBip();
                    await getCardInfo();
                }

            }

            if (noDeCarteAutomatique.length == 21) {
                getCardInfoConst();
            }
            console.log("UseFocusEffect", noDeCarteAutomatique, scanned.toString());

        }, [noDeCarteAutomatique]));



    const handleBarCodeScanned = ({ type, data }) => {

        if (!scanned) {
            setScanned(true);

            setNoDeCarteAutomatique(data.replace(/ /g, ''));
            setNoDeCarteManuel(data.replace(/ /g, ''));
        }

    };



    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };

    const barcodePng = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAABP4AAAKTCAYAAACJusZ+AAAC6npUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZZtkuQmDIb/c4ocAUkIieNgPqpygxw/L5ju6Z7ZJLu1+TmmGmGBJaFHxh3GX3/O8AcuUkohqXkuOUdcqaTCFQOP91V2TzHtfl9z7Lt1/6YPRSLvEUMlkHJPWL0lVej144GHD7re9cHPDPsxdCaO+SjL8xr31yCh51tP6RHRuAe5uL2Geh1D7SzcoZxfeoZ1i3Uf3hSGLHWFI2EeQtj16tMdgSA6KVLR8+6Vl0YxZskBIkk5xpCQt+09ZIyvCXpL8mMUPmff0zNHb8nnelbIp1zmkyMMfjhB+kkvT//86lieEfH7xCUxfdnO+c3Zfc5x766mjIzmU1E72fQwg4UXUi77sYxm+CnGtltB81hjA/IeW7zQGhViUJmBEnWqNGls2aghxMSDDZK5sWydi3Hhtsml1WiygWEXB7PGI4hAzc9YaPst218jh+dOWMoEYwv7P7bwb5O/0sKcbaWIVjKBnm7AvOoaYSxyq8cqIKB5uOlO8KMd/PGlsFCqYKY7zY4N1njdJi6lj9qSzVmwTiHPWRCsHwNIEXwrgiEBgZhR/ZQpGrMRIY8OQBWRsyS+QIBUuSNITiKZg7Hz8o1njPZaVs681DibAEIli4EN3jLASklRP5YcNVRVNKlqVlMPWrRmySlrztnyOuSqiSVTy2bmVqy6eHL17ObuxWvhIjgDteRixUsptXKocFRhq2J9hebiS6506ZUvu/wqV20on5aattyseSutdu7ScUz03K17L70OCgMnxUhDRx42fJRRJ2ptykxTZ542fZZZn9QO1S/tF6jRocab1FpnT2rQBrOHCVrHiS5mIMYJn4ZoiwAKmhez6JQSL3KLWSyMl0IZQepiEzotYkCYBrFOerL7IPdT3IL6T3Hj/yIXFrr/g1wAuq/cfkCtr+9c28Tut3DlNArePswPr4G9ro9a/V35bejb0Lehb0O/I+ecoeOPaPgbDGjCCKATx1cAAAGEaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDQBzFX1O1IpUOdpDikKE6WRAVcZQqFsFCaSu06mBy6Rc0aUhSXBwF14KDH4tVBxdnXR1cBUHwA8TF1UnRRUr8X1JoEePBcT/e3XvcvQOEZpWpZs8EoGqWkU7ExVx+VQy8IogQwoigT2KmnswsZuE5vu7h4+tdjGd5n/tzDCoFkwE+kXiO6YZFvEE8s2npnPeJw6wsKcTnxOMGXZD4keuyy2+cSw4LPDNsZNPzxGFisdTFchezsqESTxNHFVWjfCHnssJ5i7NarbP2PfkLgwVtJcN1miNIYAlJpCBCRh0VVGEhRqtGiok07cc9/BHHnyKXTK4KGDkWUIMKyfGD/8Hvbs3i1KSbFIwDvS+2/TEKBHaBVsO2v49tu3UC+J+BK63jrzWB2U/SGx0tegSEtoGL644m7wGXO8Dwky4ZkiP5aQrFIvB+Rt+UB4ZugYE1t7f2Pk4fgCx1tXwDHBwCYyXKXvd4d393b/+eaff3A016cpj1ZGRLAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wwPFBoz1UWuugAAFrBJREFUeNrt2DGoJGcBwPHv3eXuYqIxGmNMEAQLQRAsbEwXDMTG3sbKQpu0ptBCCztBLGJjY5EmNiKkiYWVkEII2NkoKITI3eVMIlEvd7l7NjuwLG/37e6b92758/vBshy8m52Z75tvZv5jjHG8w+f+4vsfY4xrY7PLi++XFv/n7so27owxnl35231cWnw/Ocb4y2Lb9xbfHy2+fzMOy0OL75+u7O9FfqbxeHWxL1c27O/R4vsLY4zbK9uZzvHLK8e2bhtXxhhvrPzfuT7TefztDvPmi2OMt85hHKZj+9MY4+GVc7DOlaU5fH9lO39Y2sbROc/P6Xp8bWWubLtGTPv+3CnX9zQGXz/h3E///sEMa8R5eH2POTOdxx+tHP+mNeL5E87rtJ3vz3Rupt/63R7jve31f9Gma+TXK/s5jdffF+vZaeOw7bXy1THG+yvX7nQef7LF70zbeW7DeL94QNfCtA8v7jFnlsfhx1veNz45xvjzmrF8beZj+t7KOC5/vrnDWP5wzRrx0RjjazPMvencPDzGeHvDPp/nZ3mePj/DGjAd08fHGG+uGe/Xd7i/f36M8bcz3N+/NcM4Lc+LN9c8o/5x6TeODuj6/u4Jz+/Tvr9wQGv+dM5+tWbOvLV41ptrvf/KGOPWHvNq2q83lp65j065L7+88n+n6+1/Y4xnDmjOTPvw5cX73T7vlh8srY2Xt/itX64Z73+OMb40w3hfWjqmG2uu3Z/NtEZM4/3zNe9Ht5eeWY5OeY8YY4xX9rg3T3/7yhbvhQ9ibv1izXjfWIzRpnGY5tN3HtC9ctfrf3J1jPHXc9rnbTvA0dJ5/f2e74Vzdp9d1upvX8C4fmPLuffs0tq4+nz/0hbnZVojXlia/zvPiX0XqmfGGB9ueaHeW3wfn7A43ZrxpnVzEf+WHS89RB6SowO4WU/n5tEd9uXtE4Lv8dLitM127o4xnlgzJ+byiR3+9sYY46lzPL9PLG7Y27g7xvjcmu186gHMz8fOOE7/2nJOvLNhwbx3QA+2yx4/w5y4v8MYvLthOx/OdG6OVq6b4z2O6eqBjtPH1hzTZ8cY12e8Vt5Zul7GHufxaOWaOWk7dw7wJe/OTGv5acf0/hjjM2t+67GZj2nTs817O2zn/oaHwJszjsXtMcbTBzAn3p1xfn6w4Tlhl7X3+uJa39e/Zzw/9zY8o356y/vCRV/ftzdc3+8d4Jp/bc3+PrV41pvrvNxcjNlZngvvbvlbV9cc0xT8D831MwSjRxf30m3n1dUN4z3nGrvp/fLyzNfcQ2uO6dqW4z1t55EzPM89cqDPc+vOzZNbjPd0LP89gPfuba7/sfSM9fQ5788uHeDxMzzzzd19thnv/1zgs89p+3LrhLXxeId33aMdnkPXujQAAAAAgBzhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAIAg4Q8AAAAAgoQ/AAAAAAgS/gAAAAAgSPgDAAAAgCDhDwAAAACChD8AAAAACBL+AAAAACBI+AMAAACAIOEPAAAAAIKEPwAAAAAIEv4AAAAAIEj4AwAAAICg/wPlKFmWU0L9XgAAAABJRU5ErkJggg=='
    //ratio of camera 



    //ratio of camera 
    const cameraHeight = 0.33
    const isRatio = true

    //All of these calculations is for android.     
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const headerHeight = Platform.OS === 'ios' ? 64 : 56
    const androidCameraRatio = (4 / 3)

    const cameraContainerHeight = isRatio
        ? Math.round((screenHeight - headerHeight) * cameraHeight)
        : cameraHeight;

    const cameraHeightPercent = Math.round((screenWidth / cameraContainerHeight) * androidCameraRatio * 100)
    const cameraHeightPixels = screenWidth * androidCameraRatio
    const marginTop = (cameraHeightPixels - cameraContainerHeight) / 2 * -1



    const styles = StyleSheet.create({
        containerBarCode: {
            height: '100%',

        },
        camera: {
            marginHorizontal: 0, marginLeft: 0, marginStart: 0,
            paddingHorizontal: 0, paddingLeft: 0, paddingStart: 0,
            height: `${cameraHeightPercent}%`,
            marginTop: marginTop,
            padding: 0
        },
        barcodeContainer: {
            height: cameraContainerHeight,
            overflow: 'hidden'
        },
        noBarcodeContainer: {
            height: cameraContainerHeight,
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center'
        },
        noBarcodeButton: {
        },
        button: {
            borderRadius: 0,
            width: 200,
            alignSelf: 'center',
            justifyContent: 'center'
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





    return (
        <Root>

            <ScrollView
            >


                <SafeAreaView style={{ backgroundColor: '#231F20', height: Platform.OS == "ios" ? 170 : 150, width: '100%' }}>
                    <Row>


                        <Left style={{ marginLeft: 8, marginTop: Platform.OS == "ios" ? null : 40 }}>
                            <Button
                                transparent
                                onPress={async () => {
                                    navigation.openDrawer();

                                }}
                            >
                                <Icon name="menu" type={"MaterialIcons"} style={{ fontSize: 30, color: 'white' }} />
                            </Button>
                        </Left>

                        <Body style={{ height: 80, marginTop: Platform.OS == "ios" ? null : 40 }}>

                            <Image source={require('../assets/images/headerTitle.png')} resizeMode={'contain'} style={{ alignItems: 'center', margin: 8, width: 200, height: 50 }} />
                        </Body>
                        <Right style={{ marginTop: Platform.OS == "ios" ? null : 40 }}>
                            <TouchableOpacity style={{
                                alignItems: 'center', justifyContent: 'center', marginRight: 15,
                                marginTop: 5
                            }} onPress={async () => {
                                if (isEnglish == true) {
                                    setLangChange('fr');
                                    await SyncStorage.setItem('language', 'fr');
                                } else if (isEnglish == false) {
                                    setLangChange('en');
                                    await SyncStorage.setItem('language', 'en');
                                }
                                setIsEnglish(!isEnglish);


                            }}>


                                {isEnglish ? <Image
                                    source={require('../assets/images/drapeu_Canada.png')}
                                    style={{ height: 35, width: 35, borderRadius: 35 / 2 }} /> : <Image
                                    source={require('../assets/images/drapeu_Canada.png')}
                                    style={{ height: 35, width: 35, borderRadius: 35 / 2 }} />}
                                {isEnglish ? <Text style={{ fontSize: 25, textAlign: 'center', color: 'white' }}>En</Text> : <Text style={{ fontSize: 25, color: 'white' }}>Fr</Text>}
                            </TouchableOpacity>



                        </Right>
                    </Row>
                </SafeAreaView>

                {showBarCodeScanner && !scanned ?
                    <View style={{ backgroundColor: 'transparent', zIndex: 9999999, flexDirection: 'row' }}>

                        <View style={{ zIndex: 12, backgroundColor: 'transparent' }}>
                            <TouchableOpacity
                                style={{ backgroundColor: 'transparent' }}
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

                        <TouchableOpacity
                            style={{ marginLeft: 'auto' }}
                            onPress={() => {
                                setFlash('off');
                                setShowBarCodeScanner(false);
                            }}
                        >
                            <Text style={{ fontSize: 24, color: 'white', }}>{isEnglish ? "Close Camera" : "Fermer Camera"}</Text>
                        </TouchableOpacity>
                    </View>
                    : null}
                <View
                >



                    {showBarCodeScanner && !scanned ?


                        <View style={{ backgroundColor: 'red' }} >

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
                                <View

                                    style={{ height: cameraHeightPercent, width: '100%' }}>

                                    <Camera
                                        flashMode={flash}

                                        barCodeScannerSettings={{
                                            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.code128],
                                        }}
                                        onBarCodeScanned={handleBarCodeScanned}

                                        style={[StyleSheet.absoluteFillObject, styles.camera]}
                                        type={Camera.Constants.Type.back}>



                                    </Camera>



                                </View>


                            </View>

                        </View>


                        :
                        <SafeAreaView style={{ height: cameraHeightPercent }} >
                            {scanned ?
                                <View style={{ marginTop: 10, marginBottom: 10 }}>
                                    <ActivityIndicator size="large" color="red" />
                                    <Text style={{ textAlign: 'center' }}>
                                        {isEnglish ? "Your scan is in progress please wait." : "Votre Scan est en cours veuillez patienter s.v.p"}

                                    </Text>
                                </View>
                                : null}


                            {!scanned ?
                                <TouchableOpacity onPress={() => setShowBarCodeScanner(true)}>
                                    <ImageBackground
                                        resizeMode={'cover'}
                                        source={{ uri: barcodePng }}
                                        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                        imageStyle={{ opacity: 0.3 }}>
                                        <View

                                            style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Button light style={{ width: 200, justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowBarCodeScanner(true)}>
                                                <Text style={{ color: 'black' }}>{langChange == 'en' ? `${En.Numériser}` : 'NUMÉRISER'}</Text>
                                            </Button>

                                        </View>
                                    </ImageBackground>
                                </TouchableOpacity>

                                : null}



                        </SafeAreaView>


                    }
                    {!showBarCodeScanner && !scanned ?

                        <View style={{ width: '100%', marginTop: 50 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '84%' }}>

                                    <TextInput
                                        keyboardType="numeric"
                                        placeholderTextColor="#404040"
                                        style={{ height: 45, width: '100%', borderBottomWidth: 0.5, borderColor: '#303030', marginLeft: 17 }}
                                        value={noDeCarteManuel}
                                        onChange={(e) => {
                                            setNoDeCarteManuel(e.nativeEvent.text)
                                        }
                                        }
                                        placeholder={langChange == 'en' ? `${En["Numéro de la carte"]}` : "Numéro de carte"}
                                    />

                                </View>
                                <TouchableOpacity style={{ marginTop: 1 }}
                                    onPress={() => Keyboard.dismiss()}
                                >
                                    <Icon type="AntDesign" name="closecircle" />
                                </TouchableOpacity>


                            </View>
                        </View>
                        : null}

                </View>
                {scanned ?
                    <TouchableOpacity onPress={() => {
                        setScanned(false);
                        setNoDeCarteAutomatique("");
                        setNoDeCarteManuel("");
                        setShowBarCodeScanner(false);
                    }}>
                        <Text style={{ textAlign: 'center' }}>{isEnglish ? "Cancel the scan in progress" : "Annuler le scan en cours"}</Text>


                    </TouchableOpacity>

                    : null}

                {!showBarCodeScanner && !scanned ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', zIndex: 1, marginTop: 25 }}>
                        <Button
                            onPress={async () => {
                                await getCardInfo();
                            }}

                            style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: '#FFB59C', height: 55, padding: 15 }}
                        >

                            {!isLoading ?
                                <Text style={{ fontSize: 14, color: 'white' }}> {langChange == 'en' ? `${En["Soumettre "]} ` : 'SOUMETTRE'} </Text>

                                :
                                <ActivityIndicator size="large" color="white" />


                            }

                        </Button>
                    </View>

                    : null}



            </ScrollView>
            {
                Platform.OS == 'ios' ?
                    <View style={{ position: 'absolute', width: '96%', bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 555555, backgroundColor: 'black', display: showToast ? 'visible' : 'none' }}>
                        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                    </View>

                    :
                    <View style={{ width: '96%', opacity: showToast ? 1 : 0, bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 555555, backgroundColor: 'black' }}>
                        {showToast ?
                            <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

                            :
                            <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} style={{ display: "none" }} />

                        }
                    </View>
            }


        </Root >
    );
};
export default inject("authStore")(observer(CarteScreen));
