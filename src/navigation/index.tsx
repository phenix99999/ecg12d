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
import WelcomeScreen from "../screens/WelcomeScreen";
import PageIntro from "../screens/PageIntro";
import ClientScreen from "../screens/ClientScreen";
import Entypo from "react-native-vector-icons/Entypo";
import { EventRegister } from 'react-native-event-listeners'

import EventBus from 'react-native-event-bus'


import FilterPlanification from "../screens/planificateur/FilterPlanification";
import UneJourneeEmploye from "../screens/planificateur/UneJourneeEmploye";
import ModificationDetail from "../screens/planificateur/ModificationDetail";
import SuperCalendrier from "../screens/planificateur/SuperCalendrier";
import MainLecture from "../screens/planificateur/MainLecture";
import MainPlanification from "../screens/planificateur/MainPlanification";
import Planification from "../screens/planificateur/Planification";
import SauvegarderPlanification from "../screens/planificateur/SauvegarderPlanification";
import ConfirmerPlanification from "../screens/planificateur/ConfirmerPlanification";

import MainScreen from "../screens/MainScreen";
import Bilan from "../screens/Bilan";
import SupportScreen from "../screens/SupportScreen";
import SyncStorage from 'sync-storage';
import BilletDetailsScreen from "../screens/BilletDetailsScreen";

import TempsDetailsScreen from "../screens/TempsDetailsScreen";
import TempsDetailsClient from "../screens/TempsDetailsClient";
import TempsDetailsFilter from "../screens/TempsDetailsFilter";
import { Icon } from "native-base";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SolutionMobileScreen from "../screens/SolutionMobileScreen";
import CalendrierModeList from "../screens/CalendrierModeList";
import SolutionSanteScreen from "../screens/SolutionSanteScreen";
import SolutionPortailScreen from "../screens/SolutionPortailScreen";
import SolutionVhmClassesScreen from "../screens/SolutionVhmClassesScreen";
import SolutionB2bScreen from "../screens/SolutionB2bScreen";
import SolutionScreen from "../screens/SolutionScreen";

import AccueilScreen from "../screens/AccueilScreen";
import SolutionInformatiqueDecisionnelScreen from "../screens/SolutionInformatiqueDecisionnelScreen";
import FilterModeLecture from "../screens/planificateur/FilterModeLecture";
import BilletList from "../screens/BilletList";


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
        const Stack = createStackNavigator();
        global.fmServer = "vhmsoft.com";
        global.fmDatabase = "vhmsoft";

        let navigation =
            <Stack.Navigator screenOptions={{ headerShown: false }} >
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
            </Stack.Navigator>
        return (
            <NavigationContainer>

                {navigation}

            </NavigationContainer>
        )
    }



}
