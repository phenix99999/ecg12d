import { StackScreenProps } from "@react-navigation/stack";
import { inject, observer } from "mobx-react";
import {
    Content,
    Form,
    Input,
    Item,
    Label,
    Left,
    Right,
    Header,
    Container,
    Body,
    Icon,
    Button,
    Text,
    Textarea,
} from "native-base";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import SyncStorage from 'sync-storage';
import { dateToFrench, getNotEmptyDates, getDaysInMonth, dateToFMDate } from "../../utils/date";
import NetworkUtils from '../../utils/NetworkUtils';

import * as React from "react";
import { Alert, StyleSheet, unstable_batchedUpdates, View, ScrollView } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { CustomPickerRow, DetachedCustomPickerRow } from "../../components/CustomPicker";
import { Record, Client, Activite, Projet, Type_de_projet } from "../../stores/FMObjectTypes";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../../types";
import CrudResource from "../../stores/FMMobxResource";
import { get, add, edit, execScript } from '../../utils/connectorFileMaker';
import { create } from "mobx-persist";
import { extendObservableObjectWithProperties } from "mobx/lib/internal";
type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;

const UneJourneeEmploye = ({ route, navigation, timeStore }: Props) => {
    const [heure, setHeure] = React.useState<Number>(0);
    const [data, setData] = React.useState<Object>([]);
    const [activitesList, setActivitesList] = React.useState<Object>([]);


    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion.");
    }
    function getActivitiesNameWithPkId(pk_id) {
        for (let i = 0; i < activitesList.length; i++) {
            if (activitesList[i].pk_ID == pk_id) {
                return activitesList[i].Nom;
            }
        }
        return "";
    }

    React.useEffect(() => {
        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');
        let db = "vhmsoft";
        let layoutClient = "mobile_CLIENTS2";
        let layoutProjet = "mobile_PROJETS2";
        let layoutActivite = "mobile_ACTIVITES2";
        let layoutTemps = "mobile_TEMPS2";
        let layoutAccount = "mobile_ACCOUNT2";
        let date = route.params.date;
        let pk_id = route.params.pk_ID;

        let feuilleTempsTemp = route.params.feuilleTemps;
        let feuilleTemps = [];
        let indexFeuilleTemps = 0;
        for (let i = 0; i < feuilleTempsTemp.length; i++) {
            if (feuilleTempsTemp[i].fk_assignation == route.params.pk_ID) {
                // console.log(feuilleTempsTemp[i]);
                feuilleTemps[indexFeuilleTemps] = feuilleTempsTemp[i];
                feuilleTemps[indexFeuilleTemps].planification = false;
                indexFeuilleTemps++;
            }
        }
        let planification = SyncStorage.get('planification');
        // console.log(planification);

        let year = timeStore.selectedDate.getFullYear();
        let month = timeStore.selectedDate.getMonth();
        let day = timeStore.selectedDate.getDate();
        if (planification) {


            for (let i = 0; i < planification.length; i++) {
                let monthPlanification = new Date(planification[i].date).getMonth();
                let dayPlanification = new Date(planification[i].date).getDate();
                let yearPlanification = new Date(planification[i].date).getFullYear();
                // console.log(planification[i]);
                if (yearPlanification == year && dayPlanification == day && monthPlanification == month && planification[i].employerPkId == route.params.pk_ID) {
                    feuilleTemps[indexFeuilleTemps] = { planification: true, StartDate: (timeStore.selectedDate), Nom_projet: planification[i].clientName + " | " + planification[i].projectName, fk_activites: planification[i].activity, "AM_PM": planification[i].periode, "Minutes": planification[i].duree, Taches: planification[i].tache };
                }
                // feuilleTemps[index] = planification;
            }
        }
        const setListActivities = async () => {
            setActivitesList(await get(username, password, global.fmServer, global.fmDatabase, "mobile_ACTIVITES2"
                , "&flag_actif=1"));

        }
        setListActivities();
        setData(feuilleTemps);

        // getData();
    }, []);


    function getActivitiesNameWithPkId(pk_id) {
        for (let i = 0; i < activitesList.length; i++) {
            if (activitesList[i].pk_ID == pk_id) {
                return activitesList[i].Nom;
            }
        }
        return "";
    }
    return (


        <Container>
            <Header
                style={Platform.OS != 'ios' ? { backgroundColor: 'transparent', height: 80, justifyContent: 'center', top: 15 } : { backgroundColor: 'transparent' }}

            >
                <Left>
                    <Button
                        onPress={() => {
                            navigation.goBack();
                        }}
                        transparent
                    >
                        <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} >
                        </Icon>
                    </Button>

                </Left>

                <Body>
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>{route.params.nomComplet}</Text>
                </Body>
                <Right>

                </Right>
            </Header>


            <Content style={{ flex: 1, flexDirection: "column" }}>
                <ScrollView>

                    {data.map((feuilleTemps) => (
                        <View style={{ padding: 14 }}>
                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Date : </Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{dateToFrench(new Date(feuilleTemps.StartDate))} </Text>
                                </View>
                            </View>


                            <View style={styles.inputWrapper}>

                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Client & Projet :</Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.Nom_projet} </Text>
                                </View>

                            </View>





                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Activité :  </Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text numberOfLines={0.5} ellipsizeMode='tail' style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.Nom_activite} </Text>
                                </View>

                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Période </Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.AM_PM} </Text>
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Réel :</Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.Minutes} </Text>
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Planifié :</Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.Minutes_planifie} </Text>
                                </View>
                            </View>
                            <View style={styles.inputWrapper}>
                                <Text style={{ color: feuilleTemps.planification ? "green" : "black", width: '35%' }}>Tache</Text>
                                <View style={{ marginLeft: 'auto', width: '65%' }}>
                                    <Text style={{ color: feuilleTemps.planification ? "green" : "black" }}>{feuilleTemps.Taches} </Text>
                                </View>
                            </View>
                            <View style={{ borderBottomWidth: 1, borderColor: 'black', marginTop: 25 }}>

                            </View>
                        </View>

                    ))
                    }
                </ScrollView>
            </Content>


            <Button style={{ width: '100%', justifyContent: 'center', backgroundColor: '#1f4598' }}
                onPress={async () => {
                    navigation.goBack();
                }}
            >
                <Text style={{ textAlign: 'center' }}>
                    Retour
                </Text>
            </Button>
        </Container>
    );
};
export default inject("timeStore")(observer(UneJourneeEmploye));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    inputWrapper: {
        marginLeft: 10,
        marginTop: 5,
        flexDirection: 'row'
    },
    inputBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
});
