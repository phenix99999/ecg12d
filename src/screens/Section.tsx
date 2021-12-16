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
    Header,
    Icon,
} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, NativeModules, TouchableOpacity, Platform } from "react-native";
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

const LoginScreen = ({ navigation, authStore }: Props) => {
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
    const [isEnglish, setIsEnglish] = React.useState<Boolean>(false);
    const [data, setData] = React.useState([]);
    const [dataSousSection, setDataSousSection] = React.useState([]);




    const isFocused = useIsFocused();
    const getData = async () => {
        ;
        let data = await get("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "SECTIONS");
        setData(data);

        let dataSousSections = await get("Alain Simoneau", "4251", global.fmServer, global.fmDatabase, "SOUSSECTIONS");

        setDataSousSection(dataSousSections);

    }
    React.useEffect(() => {
        getData();
    }, [isFocused]);



    return (


        <View>
            <Header style={styles.header}>
                <Left style={{ flex: 1 }}>

                </Left>
                <Body style={{ flexDirection: 'row', flex: 8, justifyContent: 'center' }}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>{"ECG12D"}</Text>
                </Body>
                <Right style={{ flex: 1 }}></Right>
            </Header>
            {

                data.length > 0 && data.map((value) => (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("SousSection", { pk_ID: value.pk_ID, sousSection: dataSousSection });
                        }
                        }
                        style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderRadius: 5, height: 65, marginTop: 10 }}
                    >

                        <Text style={{ fontSize: 18, textAlign: 'center', marginLeft: 20, color: '#292016' }}>{value.Nom}</Text>
                    </TouchableOpacity>
                ))}

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

});