import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";
import En from '../../en.json'
import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { Root } from "native-base";
import { inject, observer } from "mobx-react";
import {
    Text,
    Button,
    Form,
    Header,
    Icon,

} from "native-base";
import { Modal, Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, NativeModules, TouchableOpacity, Platform } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useIsFocused } from "@react-navigation/native";

import { Row, Left, Right, Body } from 'native-base'
const { StatusBarManager } = NativeModules;
import { get, execScript } from '../utils/connectorFileMaker';

import Toast, { BaseToast } from 'react-native-toast-message';


let keyboardDidHideListener;
console.disableYellowBox = true;

const LoginScreen = ({ route, navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);
    const [hasPermission, setHasPermission] = React.useState(null);
    const [scanned, setScanned] = React.useState(false);
    const [badPassword, setBadPassword] = React.useState<Boolean>(false);
    const [codeDeSecurite, setCodeDeSecurite] = React.useState<String>("");
    const [login, setLogin] = React.useState<String>("");
    const [password, setPassword] = React.useState<String>("");
    const [isScreenPartenaire, setPartenaire] = React.useState<Boolean>(true);
    const [isScreenPointVente, setPointVente] = React.useState<Boolean>(false);
    const [showToast, setShowToast] = React.useState<Boolean>(false);
    const [openWebViewModal, setOpenWebViewModal] = React.useState<Boolean>(false);
    const [data, setData] = React.useState([]);
    const [dataUrl, setDataUrl] = React.useState([]);
    const [urlWebView, setUrlWebView] = React.useState("");
    const [webViewLoaded, setWebViewLoaded] = React.useState(false);
    const [titreModal, setTitreModal] = React.useState("");


    const isFocused = useIsFocused();
    const getUrl = async () => {

        let dataUrl = await get("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "ECG12D");
        console.log(dataUrl);
        setDataUrl(dataUrl);

    }
    React.useEffect(() => {
        console.log(route.params);
        let sousSpecialite = route.params.sousSection;
        let dataSection = [];
        let indexSection = 0;
        for (let i = 0; i < sousSpecialite.length; i++) {
            if (sousSpecialite[i]._link == route.params.pk_ID) {
                dataSection[indexSection] = sousSpecialite[i];
                indexSection++;
            }
        }
        setData(dataSection);

        getUrl();

    }, [isFocused]);


    const modalWebView =
        <Modal
            animationType="slide"

            visible={openWebViewModal}

        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Header
                        noShadow={true}
                        style={{
                            borderBottomWidth: 0, backgroundColor: '#292016'
                        }}
                    ><Left><TouchableOpacity onPress={() => setOpenWebViewModal(false)}><Icon type="MaterialIcons" name="arrow-back" style={{ color: 'white', fontWeight: 'bold', fontSize: 32 }} /></TouchableOpacity></Left>
                        <Body style={{ flex: 1.75 }}><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{titreModal}</Text>
                        </Body>
                        <Right>
                        </Right>
                    </Header>
                    {webViewLoaded ? <ActivityIndicator size="large" color="black" style={{ marginTop: 10 }} /> : null}
                    <WebView source={{ uri: urlWebView }} onLoad={() => setWebViewLoaded(false)} />
                </View>
            </View>
        </Modal>;


    return (


        <View>
            <Header style={styles.header}>
                <Left style={{ flex: 1 }}>
                    <Button
                        transparent
                        icon
                        onPress={() => navigation.goBack()}

                    >
                        <Icon name="arrow-back" type="MaterialIcons" style={{ color: 'black', fontWeight: 'bold', }}></Icon>
                    </Button>
                </Left>
                <Body style={{ flexDirection: 'row', flex: 8, justifyContent: 'center' }}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>{"ECG12D"}</Text>
                </Body>
                <Right style={{ flex: 1 }}></Right>
            </Header>
            {modalWebView}

            {

                data.length > 0 && data.map((value) => (
                    <TouchableOpacity
                        onPress={() => {
                            let url = "";
                            for (let i = 0; i < dataUrl.length; i++) {
                                if (dataUrl[i].fk_soussection == value.pk_ID) {
                                    url = dataUrl[i].URL;
                                    setUrlWebView(dataUrl[i].URL);
                                    setTitreModal(value.Nom);
                                    break;
                                }

                            }
                            setOpenWebViewModal(true);
                        }
                        }
                        style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderRadius: 5, height: 65, marginTop: 10 }}
                    >

                        <Text style={{ fontSize: 18, textAlign: 'center', marginLeft: 20, color: '#292016' }}>{value.Nom}</Text>
                    </TouchableOpacity>
                ))}
            {data.length == 0 ?
                <View>
                    <Text style={{ textAlign: 'center', marginTop: 25 }}>
                        Aucun choix disponible.
                    </Text>
                </View> : null
            }

        </View>


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
    centeredView: {
        flex: 1,
    },
    modalView: {
        backgroundColor: "white",
        height: '100%',
    },


});