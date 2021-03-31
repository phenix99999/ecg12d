import * as React from "react";
import { StyleSheet, SafeAreaView, FlatList, Alert } from "react-native";
import Constants from "expo-constants";

import { StackScreenProps } from "@react-navigation/stack";
import { LoginStackParamList, RootStackParamList } from "../types";
import SyncStorage from 'sync-storage';

import { Root } from "native-base";
import { inject, observer } from "mobx-react";
import {

    Text,
    Button,

    Form,

} from "native-base";
import { Image, ImageBackground, RefreshControl, ScrollView, View, TextInput, Keyboard, ActivityIndicator, StatusBar, Platform, NativeModules, TouchableOpacity } from "react-native";
import AuthStore from "../stores/AuthStore";
import { authentificationGX } from '../utils/connectorGiveX';
import NetworkUtils from '../utils/NetworkUtils';

const { StatusBarManager } = NativeModules;



let keyboardDidHideListener;

const LoginScreen = ({ navigation, authStore }: Props) => {
    const [isLoading, setLoading] = React.useState<Boolean>(false);
    const [isLoadingTemp, setLoadingTemp] = React.useState<Boolean>(false);

    const [isScreenPartenaire, setPartenaire] = React.useState<Boolean>(true);
    const [isScreenPointVente, setPointVente] = React.useState<Boolean>(false);

    async function onLoginPartenaire() {
        let auth = await authentificationGX(authStore.username, authStore.password);
        return auth;
    }


    async function _keyboardDidHide() {
        // alert("Keyboard did hide " + authStore.username.length + " " + authStore.password.length);
        // if (!isLoadingTemp && authStore.password.length > 2) {
        //     // alert("Avant executer onconnected");
        //     setLoadingTemp(true);
        //     await onLogin();
        // }
    }



    React.useEffect(() => {
        // alert(StatusBarManager.HEIGHT);


        // alert(StatusBar.currentHeight);
        if (SyncStorage.get('username')) {
            authStore.username = SyncStorage.get('username');
        }
        // keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow());
        keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
        return () => {
            Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
        }
    });

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };


    return (


        <Root>
            { isLoading ?
                <View style={[styles.container, styles.horizontal]}>

                    <ActivityIndicator size="large" color="black" />

                </View>


                :
                <ImageBackground
                    source={require("../assets/images/backgroundImage.jpg")}
                    style={{ width: '100%', height: '100%' }} imageStyle={{ opacity: 0.1 }}

                >

                    <SafeAreaView style={{ backgroundColor: '#231F20', height: 170, width: '100%' }}>
                        <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>

                            <Image source={require('../assets/images/headerTitle.png')} resizeMode={'contain'} style={{ alignItems: 'center', margin: 8, width: 200, height: 50 }} />
                        </View>




                    </SafeAreaView>





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
                </ImageBackground>
            }


        </Root >
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
