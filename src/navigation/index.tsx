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
import PartenaireScreen from "../screens/PartenaireScreen";
import PartenaireCarteScreen from "../screens/PartenaireCarteScreen";

import SyncStorage from 'sync-storage';
import { SafeAreaView } from "react-native-safe-area-context";

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
let nbAssignation = 0;
export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {

        };
    }


    async componentDidMount() {


    }

    componentDidUpdate() {
        // alert("ALlo");
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
                        onPress={() => {
                            SyncStorage.remove('username');
                            SyncStorage.remove('password');
                            props.navigation.navigate('LoginScreen');
                        }}
                    >
                        <Text>Deconnexion</Text>
                    </TouchableOpacity>
                </View>

            );
        }

        function StackPartenaire() {

            return (
                <Stack.Navigator screenOptions={{ headerShown: false }} mode="modal" >
                    <Stack.Screen name="PartenaireScreen" component={PartenaireScreen} />
                    <Stack.Screen name="PartenaireCarteScreen" component={PartenaireCarteScreen} />
                </Stack.Navigator>
            );


        }


        const Stack = createStackNavigator();
        global.fmServer = "cpfilemaker.com";
        global.fmDatabase = "Coffrets_Prestige";
        // this.fmClient = new FMClient('cpfilemaker.com', 'Coffrets_Prestige', 'Basic QXBwbGljYXRpb25fbW9iaWxlOg==')
        let navigation;
        if (SyncStorage.get('username')) {
            navigation = <Stack.Navigator screenOptions={{ headerShown: false }} >
                <Stack.Screen name="PartenaireScreen" component={PartenaireScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />

            </Stack.Navigator>
        } else {
            navigation =
                <Stack.Navigator screenOptions={{ headerShown: false }} >
                    <Stack.Screen name="PartenaireScreen" component={PartenaireScreen} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="PartenaireCarteScreen" component={PartenaireCarteScreen} />
                </Stack.Navigator>
        }


        navigation =
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}

            >
                <Drawer.Screen name="LoginScreen" component={LoginScreen} />

                <Drawer.Screen name="PartenaireScreen" component={StackPartenaire} />

            </Drawer.Navigator>
        return (
            <NavigationContainer>

                {navigation}

            </NavigationContainer>
        )
    }



}
