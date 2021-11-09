import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { Component } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { ColorSchemeName, View, Text, ImageBackground, Image, TouchableOpacity, DevSettings, Alert } from "react-native";

import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentOptions } from "@react-navigation/drawer";
//import BarcodeScreen from "../screens/BarcodeScreen";
import { RootStackParamList, MainStackParamList, LoginStackParamList, DrawerStackParamList } from "../types";
import { createStackNavigator } from "@react-navigation/stack";
type InitialRouteNames = "Logout" | "Login";
import LoginScreen from "../screens/LoginScreen";
import CarteScreen from "../screens/CarteScreen";
import EmployeCarteScreen from "../screens/EmployeCarteScreen";
import PartenaireCarteScreen from "../screens/PartenaireCarteScreen";
import En from '../../en.json'
import SyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
let nbAssignation = 0;
export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isConnectedPartenaire: false,
        };
    }


    async componentDidMount() {
        // await SyncStorage.init();
        if (SyncStorage.getItem('connectedPartenaire')) {
            // alert("if component did mount");
            // alert(SyncStorage.get('connectedPartenaire'));
            this.setState({ isConnectedPartenaire: true });
        }

    }

    render() {
        const Drawer = createDrawerNavigator();
        function CustomDrawerContent(props) {



            return (

                <View>

                    <View style={{ backgroundColor: '#231F20', height: 120 }}>
                        <SafeAreaView style={{ alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>
                            <Text style={{ color: 'white', fontSize: 24 }}>Menu</Text>
                        </SafeAreaView>
                    </View>


                    <TouchableOpacity style={{ flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderColor: '#e2e2e2' }}
                        onPress={async () => {

                            Alert.alert(
                                `${SyncStorage.getItem('language') == 'en' ? `${En.ATTENTION}` : 'ATTENTION'}`,
                                `${SyncStorage.getItem('language') == 'en' ? `${En["Êtes-vous sur de vouloir déconnecter?"]}` : 'Êtes-vous sur de vouloir déconnecter?'}`,
                                [
                                    {
                                        text: `${SyncStorage.getItem('language') == 'en' ? 'YES' : 'OUI'}`,
                                        onPress: async () => {
                                            await SyncStorage.removeItem('password');
                                            await SyncStorage.getItem('codeDeSecurite');
                                            await SyncStorage.getItem('connectedPartenaire');
                                            await SyncStorage.removeItem('connectedPointDeVente');
                                            props.navigation.navigate('LoginScreen');

                                        }
                                    },
                                    {
                                        text: `${SyncStorage.getItem('language') == 'en' ? 'NO' : 'NON'}`,
                                        onPress: () => console.log("Cancel Pressed"),
                                        style: "cancel"
                                    },

                                ]
                            );




                            // await SyncStorage.remove('password');
                            // await SyncStorage.get('codeDeSecurite');
                            // await SyncStorage.remove('connectedPartenaire');
                            // await SyncStorage.remove('connectedPointDeVente');
                            // props.navigation.navigate('LoginScreen');

                        }}
                    >
                        <Text>{SyncStorage.getItem('language') == 'en' ? `${En.Déconnexion}` : 'Deconnexion'}</Text>
                    </TouchableOpacity>
                </View>

            );
        }

        function StackCarte() {

            let stack =
                <Stack.Navigator screenOptions={{ headerShown: false }}  >

                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="CarteScreen" component={CarteScreen} />
                    <Stack.Screen name="PartenaireCarteScreen" component={PartenaireCarteScreen} />
                    <Stack.Screen name="EmployeCarteScreen" component={EmployeCarteScreen} />

                </Stack.Navigator>;


            if (SyncStorage.getItem('connectedPointDeVente') || SyncStorage.getItem('connectedPartenaire')) {
                stack = <Stack.Navigator screenOptions={{ headerShown: false }}  >
                    <Stack.Screen name="CarteScreen" component={CarteScreen} />
                    <Stack.Screen name="PartenaireCarteScreen" component={PartenaireCarteScreen} />
                    <Stack.Screen name="EmployeCarteScreen" component={EmployeCarteScreen} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />

                </Stack.Navigator>;
            }
            return (
                stack
            );


        }


        const Stack = createStackNavigator();
        global.fmServer = "cpfilemaker.com";
        global.fmDatabase = "Coffrets_Prestige";
        // this.fmClient = new FMClient('cpfilemaker.com', 'Coffrets_Prestige', 'Basic QXBwbGljYXRpb25fbW9iaWxlOg==')
        let navigationConnectedPartenaire;
        let navigation;

        // alert("Render");

        navigation =
            <Drawer.Navigator
                screenOptions={{ headerShown: false }}
                drawerContent={(props) => <CustomDrawerContent {...props} />}

            >

                <Drawer.Screen name="CarteScreen" component={StackCarte} />

            </Drawer.Navigator>;


        return (
            <NavigationContainer>

                {navigation}
            </NavigationContainer>
        )
    }



}
