import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from '@react-native-async-storage/async-storage';
import En from '../../en.json'
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
import { eliotActivateCard } from '../utils/connectorGiveX';
import { get, execScript } from '../utils/connectorFileMaker';

import Toast, { BaseToast } from 'react-native-toast-message';
import { addHiddenFinalProp } from "mobx/lib/internal";

const { StatusBarManager } = NativeModules;


const toastConfig = {
    numeroDeFacturePasRempli: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Veuillez spécifier le numéro de facture.</Text>
            </View>


            <TouchableOpacity onPress={() => {
                Toast.hide();
            }
            } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, marginRight: 15, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),
    numeroDeFacturePasRempliE: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Please specify the invoice number</Text>
            </View>


            <TouchableOpacity onPress={() => {
                Toast.hide();
            }
            } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, marginRight: 15, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),
    carteDejaActiver: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>Cette carte a déjà été activé.</Text>
            </View>


            <TouchableOpacity onPress={() => {
                Toast.hide();
            }
            } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, marginRight: 15, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),
    carteDejaActiverE: () => (

        <View style={{ height: 75, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>This card has already been activated.</Text>
            </View>


            <TouchableOpacity onPress={() => {
                Toast.hide();
            }
            } style={{ marginLeft: 35, backgroundColor: 'red', width: 50, marginRight: 15, borderRadius: 3, alignItems: 'center', justifyContent: 'center', height: 28, alignSelf: 'center' }}><Text style={{ color: 'white' }}>{"OK"}</Text></TouchableOpacity>
        </View>
    ),

    nipPasRempli: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Veuillez spécifier le numéro d'employé.
                </Text>
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
    nipPasRempliE: () => (
        <View style={{ height: 60, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Please specify the employee number.
                </Text>
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
    nipInvalide: (langChange: string) => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>{langChange == 'en' ? `${En["Le NIP employé n'est pas valide."]}` : 'Le NIP employé n\'est pas valide.'}
                </Text>
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
    nipInvalideE: (langChange: string) => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>`${En["Le NIP employé n'est pas valide."]}`
                </Text>
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
    certificatInexistant: () => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>Le certificat est inexistant.
                </Text>
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
    certificatInexistantE: () => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>The certificate does not exist.
                </Text>
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
    erreurInconnue: () => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>La carte n'est pas activable pour une raison inconnu.
                </Text>
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
    erreurInconnueE: () => (
        <View style={{ height: 55, width: '100%', backgroundColor: '#201D1F', flexDirection: 'row', padding: 4, marginTop: 94 }}>
            <View style={{ width: Platform.OS === 'ios' ? '70%' : '100%', marginLeft: 10, marginTop: 5, justifyContent: 'center' }}>

                <Text style={{ color: 'white' }}>The card cannot be activated for an unknown reason.
                </Text>
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

const EmployeCarteScreen = ({ route, navigation, authStore }: Props) => {
    const [showToast, setShowToast] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [isEnglish, setIsEnglish] = React.useState<Boolean>(false);
    const [langChange, setLangChange] = React.useState('fr');
    React.useEffect(() => {

        const showLayoutOnLanguage = async () => {
            if (await SyncStorage.getItem('language') == 'fr') {
                setIsEnglish(true);
            } else {
                setIsEnglish(false);
            }

            if (await SyncStorage.getItem('language') != null) {
                setLangChange(SyncStorage.getItem('language'));
            }


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


    }, []);


    const [nip, setNip] = React.useState("");
    const [facture, setFacture] = React.useState("");




    const authHeader = 'Basic ' + base64.encode(`${"Alain Simoneau"}:${"4251"}`);
    let render = <View style={{ height: '100%', backgroundColor: 'white' }}>
        <SafeAreaView style={{ backgroundColor: '#231F20', height: Platform.OS == "ios" ? 100 : 120, width: '100%' }}>
            <Row>
                <Left style={{ marginTop: Platform.OS == "ios" ? null : 30 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                    </TouchableOpacity>
                </Left>
                <Body ><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: Platform.OS == "ios" ? null : 30 }}>{langChange == 'en' ? `${En.Activation}` : 'Activation'}</Text></Body>
                <Right style={{ marginTop: Platform.OS == "ios" ? null : 40 }}>
                    <TouchableOpacity style={{
                        alignItems: 'center', justifyContent: 'center', marginRight: 15,
                        marginBottom: 5
                    }} onPress={async () => {
                        if (isEnglish == true) {
                            setLangChange('fr');
                            await (SyncStorage.setItem('language', 'fr'));
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
        <SafeAreaView style={{ alignItems: 'center', justifyContent: 'center' }}>
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


        </SafeAreaView >
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 10, marginLeft: 10 }}>
            <Text style={{ fontSize: 16 }}>{langChange == 'en' ? `${En.Produit}` : 'Produit'}</Text>
            <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.nomCoffret}</Text>

        </View>

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e2e2', padding: 10, marginLeft: 10 }}>
            <Text style={{ fontSize: 16 }}>{langChange == 'en' ? `${En["Prix de détail"]}` : 'Prix de détail'}</Text>
            <Text style={{ marginLeft: 'auto', marginRight: 5, fontSize: 16 }}>{route.params.prixCoffret}</Text>
        </View>


        <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginTop: 10 }}>
                <View style={{ width: '84%' }}>

                    <TextInput value={nip} style={styles.input} placeholder={langChange == 'en' ? `${En["Nip employé"]}` : "Nip employé"} placeholderTextColor="#404040"
                        onChange={(e) => (setNip(e.nativeEvent.text))}
                    />

                </View>
                <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                >
                    <Icon type="AntDesign" name="closecircle" />
                </TouchableOpacity>


            </View>
        </View>

        <View style={{ width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20, marginTop: 10 }}>
                <View style={{ width: '84%' }}>

                    <TextInput value={facture} style={styles.input} placeholder={langChange == 'en' ? `${En.Facture}` : "Facture"} placeholderTextColor="#404040"
                        onChange={(e) => (setFacture(e.nativeEvent.text))}
                    />

                </View>
                <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                >
                    <Icon type="AntDesign" name="closecircle" />
                </TouchableOpacity>


            </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {facture.length > 0 || nip.length > 0 ?

                <Button

                    onPress={async () => {


                        if (facture.length == 0) {
                            setShowToast(true);

                            if (langChange == 'en') {
                                Toast.show({
                                    type: 'numeroDeFacturePasRempliE',
                                    autoHide: Platform.OS == "ios" ? false : true,
                                    position: 'bottom',
                                });
                            } else {
                                Toast.show({
                                    type: 'numeroDeFacturePasRempli',
                                    autoHide: Platform.OS == "ios" ? false : true,
                                    position: 'bottom',
                                });
                            }


                        } else if (nip.length == 0) {
                            setShowToast(true);

                            if (langChange == 'en') {
                                Toast.show({
                                    type: 'nipPasRempliE',
                                    autoHide: Platform.OS == "ios" ? false : true,
                                    position: 'bottom',
                                });
                            } else {
                                Toast.show({
                                    type: 'nipPasRempli',
                                    autoHide: Platform.OS == "ios" ? false : true,
                                    position: 'bottom',
                                });
                            }


                        } else {
                            let activation = await eliotActivateCard(route.params.noDeCarteFM, route.params.noDeCarte, facture, SyncStorage.getItem('codeDeSecurite'), nip);

                            if (activation.success) {
                                setSuccess(true);
                            } else {
                                if (activation.error == "nipEmploye") {
                                    setShowToast(true);

                                    if (langChange == 'fr') {
                                        Toast.show({
                                            type: 'nipInvalide',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    } else {
                                        Toast.show({
                                            type: 'nipInvalideE',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    }


                                } else if (activation.error.includes("Carte déjà activée")) {
                                    setShowToast(true);
                                    if (langChange == 'en') {
                                        Toast.show({
                                            type: 'carteDejaActiverE',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    } else {
                                        Toast.show({
                                            type: 'carteDejaActiver',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    }


                                } else if (activation.error.includes("Certificat inexistant")) {
                                    setShowToast(true);
                                    if (langChange == 'en') {
                                        Toast.show({
                                            type: 'certificatInexistantE',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    } else {
                                        Toast.show({
                                            type: 'certificatInexistant',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    }


                                } else {
                                    setShowToast(true);
                                    if (langChange == 'en') {
                                        Toast.show({
                                            type: 'erreurInconnueE',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    } else {
                                        Toast.show({
                                            type: 'erreurInconnue',
                                            autoHide: Platform.OS == "ios" ? false : true,
                                            position: 'bottom',
                                        });
                                    }

                                }
                            }
                        }
                    }
                    }
                    style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 52, backgroundColor: "#DF0024", height: 40, borderWidth: 0.5, borderColor: '#303030', padding: 15 }}
                >
                    <Text style={{ fontSize: 14, color: 'white' }}>{langChange == 'en' ? `${En.ACTIVER}` : 'ACTIVER'}</Text>
                </Button>
                : null}
        </View>



        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Button
                onPress={async () => {
                    navigation.goBack();
                }}


                style={{ alignItems: 'center', justifyContent: 'center', width: 250, marginTop: 125, backgroundColor: "white", height: 40, padding: 15 }}
            >
                <Text style={{ fontSize: 14, color: '#007CFF' }}> {langChange == 'en' ? `${En.Annuler}` : 'ANNULER'}</Text>
            </Button>
        </View>







        {
            Platform.OS == 'ios' ?
                <View style={{ position: 'absolute', width: '96%', bottom: 0, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black', display: showToast ? 'visible' : 'none' }}>
                    <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
                </View>

                :


                <View style={{ zIndex: 9999, width: '96%', opacity: showToast ? 1 : 0, bottom: 50, flexDirection: 'row', marginLeft: 10, marginRight: 10, zIndex: 5555, backgroundColor: 'black' }}>
                    {showToast ?
                        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

                        :
                        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />

                    }
                </View>
        }



    </View >;

    if (success == true) {
        render = <View style={{ height: '100%', backgroundColor: 'white' }}><SafeAreaView style={{ backgroundColor: '#231F20', height: 100, width: '100%' }}>
            <Row>
                <Left>
                    <TouchableOpacity onPress={() => navigation.replace('CarteScreen')}>
                        <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'white', marginLeft: 15, fontWeight: 'bold' }}></Icon>
                    </TouchableOpacity>
                </Left>
                <Body><Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}> Encaissement</Text></Body>
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
                    La carte a bien été activée.
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
    }
    return (

        render
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
