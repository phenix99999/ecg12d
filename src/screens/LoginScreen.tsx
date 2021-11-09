import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";
import En from '../../en.json'
import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from '@react-native-async-storage/async-storage';

import { Root } from "native-base";
import { inject, observer } from "mobx-react";
import {
    Text,
    Button,
    Form,
} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, NativeModules, TouchableOpacity, Platform } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import NetworkUtils from '../utils/NetworkUtils';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useIsFocused } from "@react-navigation/native";

import { Row, Left, Right, Body } from 'native-base'
const { StatusBarManager } = NativeModules;
import { get, execScript } from '../utils/connectorFileMaker';

import Toast, { BaseToast } from 'react-native-toast-message';


let keyboardDidHideListener;
console.disableYellowBox = true;

const toastConfig = {
    mauvaisMotDePasseF: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row' }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>{"Nom d'utilisateur ou mot de passe invalide."}</Text>
            </View>

            {Platform.OS == "ios" ?
                <View style={{ width: '30%', justifyContent: 'center' }}>

                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center', marginRight: 30 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>
                :
                null
            }
        </View>
    ),
    mauvaisMotDePasseE: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row' }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>{"Invalid username or password."}</Text>
            </View>

            {Platform.OS == "ios" ?
                <View style={{ width: '30%', justifyContent: 'center' }}>

                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center', marginRight: 30 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>
                :
                null
            }
        </View>
    ),
    mauvaisCodeSecuriteF: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, alignItems: 'center', justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Veuillez vérifier votre code de sécurité.
                </Text>
            </View>
            {Platform.OS == "ios" ?
                <View style={{ width: '30%', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center', marginRight: 30 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>

                : null}

        </View>
    ),
    mauvaisCodeSecuriteE: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '75%', marginLeft: 10, marginTop: 5, alignItems: 'center', justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Please verify your security code.
                </Text>
            </View>
            {Platform.OS == "ios" ?
                <View style={{ width: '30%', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => Toast.hide()} style={{ marginLeft: 45, marginTop: 4, backgroundColor: 'red', width: 50, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center', marginRight: 30 }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
                </View>

                : null}

        </View>
    )
};

const LoginScreen = ({ navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);
    const [hasPermission, setHasPermission] = React.useState(null);
    const [scanned, setScanned] = React.useState(false);
    const [badPassword, setBadPassword] = React.useState<Boolean>(false);
    const [codeDeSecurite, setCodeDeSecurite] = React.useState<String>("");
    const [isScreenPartenaire, setPartenaire] = React.useState<Boolean>(true);
    const [isScreenPointVente, setPointVente] = React.useState<Boolean>(false);
    const [showToast, setShowToast] = React.useState<Boolean>(false);
    const [isEnglish, setIsEnglish] = React.useState<Boolean>(false);
    const [langChange, setLangChange] = React.useState("");

    async function onLoginPartenaire() {
        let auth = await authentificationGX(authStore.username, authStore.password);
        // alert(auth);

        if (auth) {
            SyncStorage.setItem('connectedPointDeVente', false);
            SyncStorage.setItem('connectedPartenaire', true);
            SyncStorage.setItem('username', authStore.username);
            SyncStorage.setItem('password', authStore.password);

            navigation.navigate('CarteScreen');
        } else {
            setShowToast(true);
            if (langChange == 'en') {
                Toast.show({
                    type: 'mauvaisMotDePasseE',
                    autoHide: false,
                    position: 'bottom',
                });
            } else {
                Toast.show({
                    type: 'mauvaisMotDePasseF',
                    autoHide: false,
                    position: 'bottom',
                });
            }


        }


    }


    async function onLoginEmploye() {

        let auth = await get("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "api_mobile_SECURITE_POINT_DE_VENTE", "&Code_de_securite=" + codeDeSecurite);
        // // alert(auth);
        console.log("auth");
        console.log(auth);
        if (auth.length > 0 && auth.length != -1) {
            // alert(codeDeSecurite);
            SyncStorage.setItem('codeDeSecurite', codeDeSecurite);
            SyncStorage.setItem('connectedPartenaire', false);
            SyncStorage.setItem('connectedPointDeVente', true);
            navigation.navigate('CarteScreen');
        } else {
            setShowToast(true);
            if (langChange == 'en') {
                Toast.show({
                    type: 'mauvaisCodeSecuriteE',
                    autoHide: false,
                    position: 'bottom',
                });
            } else {
                Toast.show({
                    type: 'mauvaisCodeSecuriteF',
                    autoHide: false,
                    position: 'bottom',
                });
            }

        }


    }



    async function _keyboardDidHide() {
        // alert("Keyboard did hide " + authStore.username.length + " " + authStore.password.length);
        if (authStore.password.length > 2) {

            await onLoginPartenaire();
        }
    }


    const isFocused = useIsFocused();

    React.useEffect(() => {


        if (SyncStorage.getItem('language') == null) {
            setLangChange('fr');
            setIsEnglish(false);
        } else if (SyncStorage.getItem('language') == 'fr') {
            setLangChange('fr');
            setIsEnglish(false);
        } else if (SyncStorage.getItem('language') == 'en') {
            setLangChange('en');
            setIsEnglish(true);
        }


        // alert(SyncStorage.get('username'));
        authStore.username = "";
        authStore.password = "";
        setCodeDeSecurite("");

        // alert(StatusBarManager.HEIGHT);
        const getPermission = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        }
        // alert(StatusBar.currentHeight);
        if (SyncStorage.getItem('username')) {
            authStore.username = SyncStorage.getItem('username');
        }
        // keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow());
        keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
        return () => {
            Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
        }
    }, [isFocused]);

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

                    <SafeAreaView style={{ backgroundColor: '#231F20', height: Platform.OS == "ios" ? 170 : 180, width: '100%', }}>
                        <Row>

                            <Left>

                            </Left>
                            <Body style={{ marginTop: Platform.OS == "ios" ? null : 40 }}>
                                <Image source={require('../assets/images/headerTitle.png')} resizeMode={'contain'} style={{
                                    alignItems: 'center',
                                    margin: 8, width: 200, height: 50
                                }} />

                            </Body>

                            <Right style={{ marginTop: Platform.OS == "ios" ? null : 40 }}>
                                <TouchableOpacity style={{
                                    alignItems: 'center', justifyContent: 'center', marginRight: 15,
                                    marginTop: 5
                                }} onPress={() => {
                                    if (isEnglish == true) {
                                        setLangChange('fr');
                                        SyncStorage.setItem('language', 'fr');
                                    } else if (isEnglish == false) {
                                        setLangChange('en');
                                        SyncStorage.setItem('language', 'en');
                                    }
                                    setIsEnglish(!isEnglish);


                                }}>


                                    <Image
                                        source={require('../assets/images/drapeu_Canada.png')}
                                        style={{ height: 35, width: 35, borderRadius: 35 / 2 }} />


                                    {isEnglish ? <Text style={{ fontSize: 25, textAlign: 'center', color: 'white' }}>En</Text> : <Text style={{ fontSize: 25, color: 'white' }}>Fr</Text>}
                                </TouchableOpacity>


                            </Right>
                        </Row>
                        {/* <View style={{ height: 80, justifyContent: 'center', alignItems: 'center',backgroundColor:'yellow' }}>
                            <Image source={require('../assets/images/logo_vide_noir_giftjoy-01.png')}
                             resizeMode={'contain'} style={{ alignItems: 'center', margin: 8, width: 200, height: 50 }} />
                          
                              <TouchableOpacity   style={{ alignItems: 'center', justifyContent: 'center',
                            marginTop: 5,backgroundColor:'red'}} onPress ={() =>{
                                if(isEnglish == true){
                                    setLangChange('en');
                                    SyncStorage.set('language','en');
                                }else if (isEnglish == false){
                                    console.log("on passe ici");
                                    setLangChange('fr');
                                    SyncStorage.set('language','fr');
                                }
                                setIsEnglish(!isEnglish);
                            
                                
                            }}>
                                  <Image 
                                  source={require('../assets/images/drapeu_Canada.png')}
                                  style ={{height : 35, width:35, borderRadius : 35/2}} />
                               { isEnglish ? <Text style={{fontSize:25,textAlign:'center'}}>En</Text> : <Text style={{fontSize:25}}>Fr</Text>}
                            </TouchableOpacity>
                        </View> */}

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={{ width: '50%', padding: 5, alignItems: 'center' }}
                                onPress={() => {
                                    setPartenaire(true);
                                    setPointVente(false);
                                }}
                            >
                                <Text style={{ color: 'white', marginRight: 20, fontSize: isScreenPartenaire ? 13 : 11 }}>
                                    {langChange === 'en' ? ` ${En["Connexion partenaire"]}` : 'Partenaire'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '50%', padding: 5, alignItems: 'center' }}
                                onPress={() => {
                                    setPointVente(true);
                                    setPartenaire(false);
                                }}
                            >
                                <Text style={{ color: 'white', marginRight: 20, fontSize: isScreenPointVente ? 13 : 11 }}>
                                    {langChange == 'en' ? `${En["Connexion point de vente"]}` : 'Point de vente '}
                                </Text>
                            </TouchableOpacity>
                        </View>


                        {isScreenPartenaire ?

                            <View style={{ flexDirection: 'row', marginTop: 2 }}>

                                <View style={{ width: '50%', padding: 5, alignItems: 'center', borderColor: 'white', borderBottomWidth: 3 }} />
                            </View>

                            :
                            null}
                        {isScreenPointVente ?
                            <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                <View style={{ width: '50%', padding: 5, alignItems: 'center', borderColor: 'transparent', borderBottomWidth: 3 }} />

                                <View style={{ width: '50%', padding: 5, alignItems: 'center', borderColor: 'white', borderBottomWidth: 3 }} />
                            </View>

                            :
                            null}
                    </SafeAreaView>


                    {isScreenPartenaire ?

                        <View>

                            <Form style={styles.form}>
                                <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, justifyContent: 'center' }}>
                                    <Text  >{langChange == 'en' ? `${En["Connectez-vous ici si vous etes une entreprise partenaire"]}` : 'Connectez-vous ici si vous êtes une entreprise partenaire.'}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 15, height: 15 }}>
                                    <Text style={{ color: 'red' }}>{badPassword ? "Votre nom d'utilisateur ou mot de passe est erronée" : "\n"} </Text>
                                </View>



                                <View style={{ marginTop: 15 }}>

                                    <TextInput
                                        placeholderTextColor="#404040"
                                        style={{ height: 45, width: 350, borderWidth: 0.5, borderColor: badPassword ? 'red' : '#303030', padding: 7 }}
                                        value={authStore.username}
                                        onChange={(e) => (authStore.username = e.nativeEvent.text)}
                                        placeholder={langChange == 'en' ? `${En["Nom d'utilisateur"]}` : "Nom d'utilisateur"}
                                    />


                                    <TextInput
                                        placeholderTextColor="#404040"

                                        secureTextEntry={true}
                                        value={authStore.password}
                                        placeholder={langChange == 'en' ? `${En["Mot de Passe"]}` : "Mot de passe"}
                                        onChange={(e) => (authStore.password = e.nativeEvent.text)}
                                        style={{ marginTop: 10, height: 45, width: 350, borderWidth: 0.5, borderColor: badPassword ? 'red' : '#303030', padding: 7 }}

                                    />

                                </View>
                            </Form>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                <Button
                                    onPress={async () => {

                                        await onLoginPartenaire();
                                    }}


                                    style={{
                                        alignItems: 'center', justifyContent: 'center',
                                        width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15
                                    }}
                                >
                                    <Text style={{ color: 'white' }}> {langChange == 'en' ? `${En.Connexion}` : 'Connexion'}</Text>
                                </Button>

                            </View>
                        </View>

                        :

                        null}

                    {isScreenPointVente ?

                        <View>
                            <Form style={styles.form}>
                                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                                    <Text style={{ marginLeft: 25, marginRight: 25 }}>{langChange == 'en' ? `${En["Connectez-vous ici si vous êtes l'employé d'un point de vente."]}` : 'Connectez-vous ici si vous êtes l\'employé d\'un point de vente.'} </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 15, height: 15 }}>
                                    <Text style={{ color: 'red' }}>{badPassword ? "Votre nom d'utilisateur ou mot de passe est erronée" : "\n"} </Text>
                                </View>



                                <View style={{ marginTop: 15 }}>

                                    <TextInput
                                        placeholderTextColor="#404040"
                                        style={{ height: 45, width: 350, borderWidth: 0.5, borderColor: badPassword ? 'red' : '#303030', padding: 7 }}
                                        value={codeDeSecurite}
                                        onChange={(e) => (setCodeDeSecurite(e.nativeEvent.text))}
                                        placeholder={langChange == 'en' ? `${En["Code de sécurité"]}` : "Code de sécurité"}
                                    />




                                </View>
                            </Form>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                <Button
                                    onPress={async () => {
                                        if (codeDeSecurite.length == 0) {
                                            setShowToast(true);

                                            if (langChange == 'en') {
                                                Toast.show({
                                                    type: 'mauvaisCodeSecuriteE',
                                                    autoHide: Platform.OS == "ios" ? false : true,
                                                    position: 'bottom',
                                                });
                                            } else {
                                                Toast.show({
                                                    type: 'mauvaisCodeSecuriteF',
                                                    autoHide: Platform.OS == "ios" ? false : true,
                                                    position: 'bottom',
                                                });
                                            }
                                        } else {

                                            await onLoginEmploye()
                                        }

                                    }}


                                    style={{
                                        alignItems: 'center', justifyContent: 'center', width: 250,
                                        marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15
                                    }}
                                >
                                    <Text style={{ color: 'white' }}> {langChange == 'en' ? `${En.Connexion}` : 'Connexion'}</Text>
                                </Button>

                            </View>

                        </View>

                        :

                        null}



                    {/* <Container style={{ flexGrow: 1, flex: 1, backgroundColor: 'transparent', top: 200 }}>
            <ScrollView style={{ width: "100%" }} contentContainerStyle={styles.content}>
                <Content style={{ flexGrow: 1, flex: 1, flexDirection: "row" }}>
                    <View style={[styles.subContainer, { justifyContent: "flex-start" }]}>
                        <Form style={styles.form}>
                            <TextInput
                                placeholderTextColor="#404040"
                                style={{ height: 45, width: 200, borderWidth: 0.5, borderColor: '#303030', padding: 7 }}
                                value={authStore.username}
                                onChange={(e) => (authStore.username = e.nativeEvent.text)}
                                placeholder="Nom d'utilisateur"
                            />
                            <TextInput
                                placeholderTextColor="#404040"
                                secureTextEntry={true}
                                value={authStore.password}
                                placeholder="Mot de passe"
                                onChange={(e) => (authStore.password = e.nativeEvent.text)}
                                style={{ marginTop: 10, height: 45, width: 200, borderWidth: 0.5, borderColor: '#303030', padding: 7 }}
                            />
                        </Form>
                        <Button
                            onPress={async () => {
                                await onLogin()
                            }}
                            style={{ justifyContent: 'center', marginTop: 52, backgroundColor: "#1f4598", height: 40, width: '100%', borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                        >
                            <Text> Connexion</Text>
                        </Button>
                    </View>
                </Content>
            </ScrollView>
            </Container> */}
                    {Platform.OS == 'ios' ?
                        <View style={{ position: 'absolute', width: '96%', bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black', display: showToast ? 'visible' : 'none' }}>
                            <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                        </View>

                        :


                        <View style={{ position: 'absolute', width: '96%', bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black' }}>
                            {showToast ?
                                <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

                                : null}
                        </View>}
                </ImageBackground>
            }



        </View >
    );
};
export default inject("authStore")(observer(LoginScreen));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center"
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