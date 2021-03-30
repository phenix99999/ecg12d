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
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
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

const ConfirmerPlanification = ({ route, navigation, timeStore }: Props) => {
    const [heure, setHeure] = React.useState<Number>(0);
    const [planification, setPlanification] = React.useState<Object>([]);
    const [temp, setTemp] = React.useState<Number>(0);

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion.");
    }

    function getNbHeuresAssigner() {

        let planification = SyncStorage.get('planification');
        let nbHeures = 0;
        if (planification) {
            for (let i = 0; i < planification.length; i++) {
                nbHeures = parseFloat(planification[i].duree) + parseInt(nbHeures);
            }
        }

        return nbHeures;
    }
    async function addAndUpdateQuery(records) {

        let query = "";
        let layout = "mobile_TEMPS2";
        for (let i = 0; i < records.length; i++) {
            let username = SyncStorage.get('username');
            let password = SyncStorage.get('password');
            query = "&StartDate=" + records[i].StartDate + "&fk_assignation=" + records[i].fk_assignation + "&fk_client=" + records[i].fk_client + "&fk_projet=" + records[i].fk_projet
                + "&Minutes_planifie=" + records[i].Minutes_planifie + "&AM_PM=" + records[i].AM_PM + "&fk_activites=" + records[i].fk_activities + "&flag_actif=" + 1 + "&Taches=" + records[i].Taches + "&flag_entre_planif=1" + "&Description=" + records[i].Description;
            await add(username, password, global.fmServer, global.fmDatabase, layout, query);

        }


        // return "&StartDate=" + StartDate + "&fk_assignation=" + fk_assignation + "&fk_client=" + fk_client + "&fk_projet=" + fk_projet + "&Taches=" + tache + "&Flag_facturable=" + facturable + "&flag_R_et_D=" + rd
        //     + "&Minutes=" + Minutes + "&Minutes_planifie=" + Minutes_planifie + "&AM_PM=" + AM_PM + "&fk_activites=" + fk_activites + "&flag_actif=" + flag_actif + "&Description=" + Description + "&Flag_termine=" + Flag_termine + "&Minutes_restantes=" + Minutes_restantes + "&Minutes_restantes_tache=" + Minutes_restantes_tache;

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
        // if (SyncStorage.get('filterProject')) {
        //     setProject(SyncStorage.get('filterProject'));
        // }
        // if (SyncStorage.get('filterActivity')) {
        //     setActivity(SyncStorage.get('filterActivity'));

        // }    
        setPlanification(SyncStorage.get('planification'));

        const setData = async (username, password, server, db, layoutClient, layoutProjet, layoutActivite) => {
            // setFormatedClients(await get(username, password, server, db, layoutClient));
            if (SyncStorage.get('typeAccount') == "1") {
                setFormatedProjects(await get(username, password, server, db, layoutProjet, "&fk_client=" + SyncStorage.get('client_PK') + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend"));
                setFormatedActivities(await get(username, password, server, db, layoutActivite, "&fk_client=" + SyncStorage.get('client_PK') + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend"));
            } else {
                setFormatedProjects(await get(username, password, server, db, layoutProjet, "&flag_actif=1&-sortfield.1 = Nom & -sortorder.1 = ascend"));
                setFormatedActivities(await get(username, password, server, db, layoutActivite, "&flag_actif=1&-sortfield.1 = Nom & -sortorder.1 = ascend"));
            }

        };


        // setData(username, password, global.fmServer, global.fmDatabase, layoutClient, layoutProjet, layoutActivite);

    }, []);



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
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>Confirmation planification</Text>
                </Body>
                <Right>

                    <View style={{ flexDirection: 'row' }}>
                        <Icon name="clockcircle" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />
                        <View style={{ justifyContent: 'center' }}>
                            <Text style={{ marginLeft: 5, color: 'black', fontSize: 15, fontWeight: 'bold' }}>
                                {(parseFloat(SyncStorage.get('heureFacturable')).toFixed(2) + "/" + SyncStorage.get('budject'))}
                            </Text>

                        </View>
                    </View>
                </Right>
            </Header>


            <Content style={{ flex: 1, flexDirection: "column" }}>
                <ScrollView>

                    {planification.map((planification) => (
                        <View>
                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Date : </Text>
                                <View style={{ width: '80%', marginLeft: 'auto' }}>
                                    <Text> {dateToFrench(new Date(planification.date))} </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Employé : </Text>
                                <View style={{ width: '80%', marginLeft: 'auto' }}>
                                    <Text> {planification.nom} </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>

                                <Text>Client : </Text>
                                <View style={{ width: '80%', marginLeft: 'auto' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{planification.clientName} </Text>
                                </View>

                            </View>



                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Projet : </Text>
                                <View style={{ width: '80%', marginLeft: 'auto' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{planification.projectName} </Text>
                                </View>

                            </View>

                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Activité : </Text>
                                <View style={{ width: '80%', marginLeft: 'auto' }}>

                                    <Text style={{ fontWeight: 'bold' }}>{planification.activityName} </Text>
                                </View>

                            </View>


                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Durée : </Text>
                                <View style={{ marginLeft: 'auto', width: '80%' }}>
                                    <Text>{planification.duree} </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Tache : </Text>
                                <View style={{ marginLeft: 'auto', width: '80%' }}>
                                    <Text>{planification.tache} </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                                <Text>Description : </Text>
                                <View style={{ marginLeft: 'auto', width: '75%' }}>
                                    <Text>{planification.description} </Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 25, marginBottom: 25 }}>
                                <TouchableOpacity
                                    onPress={() => {

                                        let planificationStorage = SyncStorage.get('planification');
                                        let newPlanification = [];
                                        let indexNewPlanification = 0;
                                        for (let i = 0; i < planificationStorage.length; i++) {
                                            if (planificationStorage[i].index != planification.index) {
                                                newPlanification[indexNewPlanification] = planificationStorage[i];
                                                indexNewPlanification++;
                                            } else {
                                                SyncStorage.set('heureFacturable', SyncStorage.get('heureFacturable') - planificationStorage[i].duree)
                                            }
                                        }

                                        SyncStorage.set('planification', newPlanification);
                                        setPlanification(newPlanification)
                                        if (newPlanification.length == 0) {
                                            navigation.goBack();
                                        }
                                    }}
                                    style={{ width: '100%', backgroundColor: 'red', alignItems: 'center' }}>
                                    <Text style={{ color: 'white' }}>Effacer</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ borderBottomWidth: 1, borderColor: 'black' }}>

                            </View>
                        </View>

                    ))
                    }
                </ScrollView>
            </Content>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>


                <Button style={{ width: '65%', justifyContent: 'center', backgroundColor: '#1f4598' }}
                    onPress={async () => {

                        let planification = SyncStorage.get('planification');
                        let StartDate = "";
                        let fk_assignation = "";
                        let fk_client = "";
                        let fk_projet = "";
                        let Minutes_planifie = "";
                        let AM_PM = "";
                        let fk_actif = 1;
                        //TACHE ?!
                        // let tache = "Programmation";
                        let records = [];
                        for (let i = 0; i < planification.length; i++) {
                            records[i] = {};
                            records[i].Taches = planification[i].tache;
                            records[i].StartDate = dateToFMDate(new Date(planification[i].date));
                            records[i].fk_assignation = planification[i].employerPkId;
                            records[i].fk_client = planification[i].client;
                            records[i].fk_projet = planification[i].projet;
                            records[i].Description = planification[i].description;
                            records[i].fk_activities = planification[i].activity;
                            records[i].Minutes_planifie = planification[i].duree;
                            records[i].fk_actif = "1";
                            records[i].AM_PM = planification[i].periode;
                        }

                        await addAndUpdateQuery(records);
                        SyncStorage.remove('planification');
                        SyncStorage.remove('budject');
                        SyncStorage.remove('modeRemplir');
                        SyncStorage.remove("filterClient");
                        SyncStorage.remove("filterProject");
                        SyncStorage.remove("filterActivity");
                        navigation.goBack();
                    }}
                >

                    <Text style={{ textAlign: 'center' }}>
                        Confirmer planification
                </Text>
                </Button>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                <Button style={{ width: '65%', justifyContent: 'center', marginTop: 25, backgroundColor: 'red' }}
                    onPress={async () => {

                        let heureFacturable = 0;
                        for (let i = 0; i < SyncStorage.get('planification').length; i++) {
                            // console.log("DUREE " + SyncStorage.get('planification')[i].duree);
                            heureFacturable = parseFloat(heureFacturable) + parseFloat(SyncStorage.get('planification')[i].duree);
                        }


                        SyncStorage.set('heureFacturable', parseFloat(SyncStorage.get('heureFacturable') - heureFacturable))

                        SyncStorage.remove('planification');
                        SyncStorage.remove('budject');
                        SyncStorage.remove("filterClient");
                        SyncStorage.remove("filterProject");
                        SyncStorage.remove("filterActivity");
                        navigation.goBack();
                    }}
                >

                    <Text style={{ textAlign: 'center' }}>
                        Annuler planification
                </Text>
                </Button>
            </View>
        </Container>
    );
};
export default inject("timeStore")(observer(ConfirmerPlanification));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    inputWrapper: {

        flexDirection: 'row'
    },
    inputBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
});
