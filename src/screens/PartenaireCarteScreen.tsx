import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from 'sync-storage';
import En from '../../en.json';

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
import { givexEncaissement } from '../utils/connectorGiveX';
import { get, execScript } from '../utils/connectorFileMaker';

import NetworkUtils from '../utils/NetworkUtils';
import Toast, { BaseToast } from 'react-native-toast-message';

const { StatusBarManager } = NativeModules;


const toastConfig = {
    balanceInvalide: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Le montant est invalide.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3,
                 alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    balanceInvalideE: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>The amount is invalid.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3,
                 alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    balanceInsuffisante: () => (
        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Le montant à encaisser doit être inférieur que la balance.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    balanceInsuffisanteE: () => (
        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>The amount to be cashed must be less than the balance.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    erreurInnatendue: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Une erreur innatendue est survenue. Veuillez en parler avec votre fournisseur.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
    erreurInnatendueE: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>An unexpected error has occurred. Please discuss this with your supplier.</Text>
            </View>


            {Platform.OS == "ios" ?

                <TouchableOpacity onPress={() => {
                    Toast.hide()
                }
                } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>

                :
                null
            }
        </View>
    ),
};

let keyboardDidHideListener;

const PartenaireCarteScreen = ({ route, navigation, authStore }: Props) => {
    const [showToast, setShowToast] = React.useState(false);
    const [montantAEncaisser, setMontantAEncaisser] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    const [isEnglish, setIsEnglish] = React.useState<Boolean>(false);
    const [langChange, setLangChange] = React.useState(SyncStorage.get('language') != null ? SyncStorage.get('language') : 'en');

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }


    async function encaisser() {
        let montant = route.params.balanceGiveX;
        let error = false;
        if (route.params.encaissementPartiel == true) {

            if (!montantAEncaisser || montantAEncaisser == "0" || montantAEncaisser == "0.0" || montantAEncaisser == "0.00" || montantAEncaisser.search("^[0-9]+(\.[0-9]{1,2})?$") == -1) {
                error = true;
                setShowToast(true);
                if(langChange == 'fr'){
                    Toast.show({
                        type: 'balanceInvalide',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }else{
                    Toast.show({
                        type: 'balanceInvalideE',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }
          
            } else {
                if (montantAEncaisser > montant) {
                    error = true;
                    montant = montantAEncaisser;
                    setShowToast(true);
                    Toast.show({
                        type: 'balanceInsuffisante',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }
            }
        } else {
            setMontantAEncaisser(route.params.balanceGiveX);
        }

        if (!error) {
            const cardGivex = route.params.noDeCarte;
            const partnerUsername = SyncStorage.get('username');
            const partnerPassword = SyncStorage.get('password');

            let returnEncaissement = await givexEncaissement(cardGivex, montantAEncaisser, partnerUsername, partnerPassword);

            if (returnEncaissement.success) {
                setSuccess(true);
            } else {
                if(langChange == 'fr'){
                    setShowToast(true);
                    Toast.show({
                        type: 'erreurInnatendue',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }else{
                    setShowToast(true);
                    Toast.show({
                        type: 'erreurInnatendueE',
                        autoHide: Platform.OS == "ios" ? false : true,
                        position: 'bottom',
                    });
                }
            
            }
        }


    }

    const authHeader = 'Basic ' + base64.encode(`${"Alain Simoneau"}:${"4251"}`);
    let render = null;

    if (success == true) {
        render = <View style={{ height: '100%', backgroundColor: 'white' }}><SafeAreaView style={{ backgroundColor: '#231F20', height: 100, width: '100%' }}>
            <Row>
                <Left>
                    <TouchableOpacity onPress={() => navigation.replace('CarteScreen')}>
                        <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                    </TouchableOpacity>
                </Left>
                <Body>
                        { langChange == 'en' ? <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{En.Encaissement}</Text> :
                         <Text  style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Encaissement</Text>}
                         </Body>
                <Right></Right>
            </Row>
        </SafeAreaView>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../assets/ok-circle.png')} resizeMode={'contain'} style={{
                    height: 100,
                    width: 100,
                    margin: 30
                }} />

            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
                <Text style={{ fontSize: 24, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {langChange == 'en' ? 'The card has been cashed for an amount of'  : 'La carte a bien été encaissée pour un montant de'} {montantAEncaisser != null ? montantAEncaisser : route.params.balanceGiveX}.
                </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Button
                    onPress={async () => {
                        navigation.navigate("CarteScreen");
                    }}
                    style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 55, padding: 15 }}
                >
                    <Text style={{ fontSize: 18, color: 'white' }}>OK</Text>
                </Button>
            </View>

        </View>
    } else {
        render =


            <View style={{ height: '100%', backgroundColor: 'white' }}>
                <SafeAreaView style={{ backgroundColor: '#231F20', height: 100, width: '100%' }}>
                    <Row>
                        <Left>
                            <TouchableOpacity onPress={() => navigation.replace('CarteScreen')}>
                                <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                            </TouchableOpacity>
                        </Left>
                        <Body>
                        { langChange == 'en' ? <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{En.Encaissement}</Text> :
                         <Text  style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Encaissement</Text>}
                         </Body>
                        <Right>
                                <TouchableOpacity   style={{ alignItems: 'center', justifyContent: 'center',marginRight:15,
                                   marginBottom:5}} onPress ={() =>{
                                        if(isEnglish == true){
                                            setLangChange('en');
                                            SyncStorage.set('language','en');
                                        }else if (isEnglish == false){
                                            setLangChange('fr');
                                            SyncStorage.set('language','fr');
                                        }
                                        setIsEnglish(!isEnglish);
                                    
                                        
                                    }}>
                                    

                                { isEnglish ?      <Image 
                                            source={require('../assets/images/drapeu_Canada.png')}
                                            style ={{height : 35, width:35, borderRadius : 35/2}} /> :      <Image 
                                            source={require('../assets/images/imagefrancais.jpeg')}
                                            style ={{height : 35, width:35, borderRadius : 35/2}} />}
                                        { isEnglish ? <Text style={{fontSize:25,textAlign:'center',color:'white'}}>En</Text> : <Text style={{fontSize:25,color:'white'}}>Fr</Text>}
                                    </TouchableOpacity>
                                                
                    
                        </Right>
                    </Row>

                </SafeAreaView>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        style={{ height: 200, width: 300, marginTop: 15 }}
                        resizeMode={'contain'}
                        source={
                            {
                                uri: route.params.lienImage,
                                headers: {
                                    Authorization: authHeader
                                }
                            }
                        } />


                </View >
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                    <Text style={{ fontSize: 16 }}>{langChange == 'en' ? `${En.Produit} `:'Produit'}</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.nomCoffret}</Text>

                </View>

                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                    <Text style={{ fontSize: 16 }}>{langChange == 'en' ? `${En["Prix de détail"]}`: 'Prix de détail'}</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.prixCoffret}</Text>
                </View>


                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15 }}>
                    <Text style={{ fontSize: 16 }}>{langChange == 'en' ? `${En.Balance}`:'Balance'}</Text>
                    <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.balanceGiveX}</Text>
                </View>


                {route.params.encaissementPartiel == true ?
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 15, alignItems: 'center', justifyContent: 'center' }}>
                        <TextInput value={montantAEncaisser}  placeholder={langChange == 'en' ? 'Enter here the amount to be cashed':"Saisir ici le montant à encaisser"} placeholderTextColor="#404040"
                            keyboardType="numeric"
                            onChange={(e) => (setMontantAEncaisser(e.nativeEvent.text))}
                        />
                    </View>
                    :


                    null}



                {route.params.balanceGiveX > 0.00
                    ?
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Button
                            onPress={async () => {
                                await encaisser();
                                // await getCardInfo();
                            }}
                            style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 55, padding: 15 }}
                        >
                        <Text style={{ fontSize: 18, color: 'white' }}>{langChange == 'en' ? `${En.Encaisser}`:'ENCAISSER'}</Text>
                        </Button>
                    </View>
                    :
                    <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                         <Text>{langChange == 'en' ? `${En["Cette carte a déjà été encaissé. Le client peut contacter le service à la clientele Giftjoy au 1 800 701 9575. Merci de ne pas honorer la prestation."]}`
                          :'Cette carte a déjà été encaissée. Le client peut contacter le service à la clientèle Giftjoy au 1 800.701.9575. Merci de ne pas honorer la prestation'}.</Text>
                    </View>
                }


                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Button
                        onPress={async () => {
                            navigation.replace('CarteScreen');

                        }}


                        style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 125, backgroundColor: "white", height: 40, borderColor: '#303030', padding: 15 }}
                    >
                         <Text style={{ fontSize: 18, color: '#007CFF' }}> {langChange == 'en' ? `${En.Annuler}`:'ANNULER'}</Text>
                    </Button>
                </View>
                {Platform.OS == 'ios' ?
                    <View style={{ position: 'absolute', width: '96%', bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black', display: showToast ? 'visible' : 'none' }}>
                        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                    </View>

                    :


                    <View style={{ width: '96%', opacity: showToast ? 1 : 0, bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black' }}>
                        {showToast ?
                            <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

                            :
                            <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} style={{ display: "none" }} />

                        }
                    </View>}

            </View >
    }
    console.log(route.params.lienImage);
    return (
        render
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
