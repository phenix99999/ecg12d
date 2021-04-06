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

import SyncStorage from 'sync-storage';
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
        await SyncStorage.init();
        if (SyncStorage.get('connectedPartenaire')) {
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
                            await SyncStorage.remove('username');
                            await SyncStorage.remove('password');
                            await SyncStorage.remove('connectedPartenaire');
                            props.navigation.navigate('LoginScreen');
                        }}
                    >
                        <Text>Deconnexion</Text>
                    </TouchableOpacity>
                </View>

            );
        }

        function StackCarte() {

            return (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="CarteScreen" component={CarteScreen} />
                    <Stack.Screen name="PartenaireCarteScreen" component={PartenaireCarteScreen} />
                    <Stack.Screen name="EmployeCarteScreen" component={EmployeCarteScreen} />

                </Stack.Navigator>
            );


        }


        const Stack = createStackNavigator();
        global.fmServer = "cpfilemaker.com";
        global.fmDatabase = "Coffrets_Prestige";
        // this.fmClient = new FMClient('cpfilemaker.com', 'Coffrets_Prestige', 'Basic QXBwbGljYXRpb25fbW9iaWxlOg==')
        let navigationConnectedPartenaire;
        let navigation;

        // alert("Render");

        navigationConnectedPartenaire =
            <Drawer.Navigator
                drawerContent={(props) => <CustomDrawerContent {...props} />}

            >

                <Drawer.Screen name="CarteScreen" component={StackCarte} />
                <Drawer.Screen name="LoginScreen" component={LoginScreen} />

            </Drawer.Navigator>;

        // alert("ELSE");
        navigation = <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}

        >
            <Drawer.Screen name="LoginScreen" component={LoginScreen} />

            <Drawer.Screen name="CarteScreen" component={StackCarte} />

        </Drawer.Navigator>;


        return (
            <NavigationContainer>

                {SyncStorage.get('connectedPartenaire') ? navigationConnectedPartenaire : navigation}

            </NavigationContainer>
        )
    }



}
