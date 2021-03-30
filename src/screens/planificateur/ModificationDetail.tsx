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
import DateSlider from "../../components/DateSlider";
import * as React from "react";
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { CustomPickerRow, DetachedCustomPickerRow } from "../../components/CustomPicker";
import { Record, Client, Activite, Projet, Type_de_projet } from "../../stores/FMObjectTypes";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../../types";
import { useIsFocused } from "@react-navigation/native";

import { get, add, edit, execScript } from '../../utils/connectorFileMaker';
import { reaction } from "mobx";

type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;


var radio_props = [
    { label: 'Oui', value: 1 },
    { label: 'Non', value: 0 },
];

let formatedTaches = [
    "Analyse",
    "Gestion de projet",
    "Programmation",
    "Support",
    "Rencontre",
    "Appel téléphonique",
    "Améliorations continues",
    "Suivis",
    "Rédaction",
    "Pilotage",
    "Recherche",
    "Design",
];
let initialJobComplete = -1;

let initialFacturable = -1;

let initialRd = -1;


const ModificationDetail = ({ route, navigation, timeStore }: Props) => {
    const editionMode = route.params.editionMode;
    const [record, setRecord] = React.useState<Object>({});
    const [activity, setActivity] = React.useState<Object>({});
    const [employeList, setEmployeList] = React.useState<Object>([]);
    const [isLoading, setLoading] = React.useState<Boolean>(true);

    const [employe, selectedEmploye] = React.useState<Number>(0);
    const [minutePlanifier, setMinutePlanifier] = React.useState<String>("");
    const [minuteReel, setMinuteReel] = React.useState<String>("");


    function getEmployeNameWithPkId(pk_id) {

        for (let i = 0; i < employeList.length; i++) {
            if (employeList[i].pk_ID == pk_id) {
                return employeList[i]._C_nomComplet;
            }
        }
        return "";
    }


    React.useEffect(() => {

        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');

        let db = "vhmsoft";

        let layoutTemps = "mobile_TEMPS2";
        let pk_ID = route.params.pk_ID;

        let layoutAccount = "mobile_ACCOUNT2";

        const getListEmployes = async () => {
            let employes = (await get(username, password, global.fmServer, global.fmDatabase, layoutAccount));
            await setEmployeList(employes);
        }


        const setDataToUpdate = async (pk_ID) => {
            let theRecord = (await get(username, password, global.fmServer, global.fmDatabase, layoutTemps, "&pk_ID=" + pk_ID));
            // console.log(theRecord[0]);
            console.log(theRecord);
            selectedEmploye(theRecord[0].fk_assignation);
            await setRecord(theRecord[0]);

        };
        // alert(route.params.employeRemplacant);


        getListEmployes();
        setDataToUpdate(pk_ID);





        if (route.params.minutePlanifier && route.params.minutePlanifier > 0) {

            setRecord({ ...record, "Minutes_planifie": route.params.minutePlanifier })
        }
        console.log(record);
        setLoading(false);

    }, []);

    function addAndUpdateQuery(deleteVar = false) {
        let StartDate = dateToFMDate(timeStore.selectedDate);
        let fk_assignation = record.fk_assignation;
        let fk_client = record.fk_client;
        let fk_projet = record.fk_projet;
        let Minutes = record.Minutes || "";
        let Minutes_planifie = record.Minutes_planifie || "";

        let AM_PM = record.AM_PM || "";
        let fk_activites = record.fk_activites || "";
        let flag_actif = deleteVar == true ? 0 : 1;
        let Description = record.Description || "";
        let Flag_termine = record.Flag_termine || "";

        let facturable = record.Flag_facturable || "";
        let rd = record.flag_R_et_D;
        let tache = record.Taches;

        if (route.params.employeRemplacant && route.params.employeRemplacant != -1) {
            fk_assignation = route.params.employeRemplacant;
        }



        if (route.params.periode && route.params.periode != record.AM_PM) {
            AM_PM = route.params.periode;
        }

        // alert(route.params.minutePlanifier);

        if (route.params.minutePlanifier && route.params.minutePlanifier > 0) {
            Minutes_planifie = route.params.minutePlanifier;
        }


        let Nom_assignation = getEmployeNameWithPkId(fk_assignation);
        // alert(getEmployeNameWithPkId(fk_assignation));

        let Minutes_restantes = record.Minutes_restantes || "";
        let Minutes_restantes_tache = record.Minutes_restantes_tache || "";

        return "&Nom_assignation=" + Nom_assignation + "&StartDate=" + StartDate + "&fk_assignation=" + fk_assignation + "&fk_client=" + fk_client + "&fk_projet=" + fk_projet + "&Taches=" + tache + "&Flag_facturable=" + facturable + "&flag_R_et_D=" + rd
            + "&Minutes=" + Minutes + "&Minutes_planifie=" + Minutes_planifie + "&AM_PM=" + AM_PM + "&fk_activites=" + fk_activites + "&flag_actif=" + flag_actif + "&Description=" + Description + "&Flag_termine=" + Flag_termine + "&Minutes_restantes=" + Minutes_restantes + "&Minutes_restantes_tache=" + Minutes_restantes_tache;

    }



    async function create() {
        //  POUR AJOUTER


        if (!record.fk_client || !record.fk_projet || !record.fk_activites) {
            alert("Veuillez remplir le client,projet et activites s.v.p");
        } else {
            let username = SyncStorage.get('username');
            let password = SyncStorage.get('password');


            let db = "vhmsoft";

            let layoutTemps = "mobile_TEMPS2";
            await add(username, password, global.fmServer, global.fmDatabase, layoutTemps, addAndUpdateQuery());
            navigation.goBack('Main');
        }
    }

    async function update() {


        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');


        let db = "vhmsoft";

        let layoutTemps = "mobile_TEMPS2";
        if (record.Minutes_restantes_tache.length == 0 && record.Flag_termine == 0) {
            alert("Veuillez entrez une description de ce qui reste à accomplir s.v.p.");
        } else {

        }

    }

    const computeColor = (activite?: Record<Activite>) => {
        //rouge si
        //Activite::Heures_budget_auto  >  Activite::Heures_budget
        if (activite === undefined) return "green";
        return Number(activite.Heures_budget_auto) >= Number(activite.Heures_budget) ? "red" : "green";
    };

    const isProjectRunningBill = (projet?: Record<Projet>) => {
        if (projet === undefined) return false;
        const map: {
            [key in Type_de_projet]: boolean;
        } = {
            "Budget du total des budgets d'activités": true,
            "Budget du total du projet": true,
            "Budget par mois": false,
            "Pas de budget déterminé": false,
            "": false,
        };
        return map[projet.Type_de_projet];
    };



    const color = computeColor(activity);


    let render =
        <Content style={{ flex: 1, flexDirection: "column" }}>

            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>

                <Text style={{ width: '20%' }}>
                    Client:
   </Text>
                <View style={{ marginLeft: 'auto', width: '80%' }}>
                    <Text>
                        {record.Nom_client}
                    </Text>

                </View>


            </View>
            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>

                <Text style={{ width: '20%' }}>
                    Projet:
   </Text>
                <View style={{ marginLeft: 'auto', width: '80%' }}>
                    <Text>
                        {record.Nom_projet}
                    </Text>
                </View>


            </View>

            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>


                <Text style={{ width: '20%' }}>
                    Activité:
   </Text>
                <View style={{ marginLeft: 'auto', width: '80%' }}>
                    <Text>

                        {record.Nom_activite}

                    </Text>
                </View>




            </View>

            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>


                <Text style={{ width: '20%' }}>
                    Tâche:
            </Text>
                <View style={{ marginLeft: 'auto', width: '80%' }}>
                    <Text>
                        {record.Taches}
                    </Text>
                </View>


            </View>




            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                <Text>Description:</Text>
                <Text style={{ marginLeft: 'auto', width: '75%' }}>
                    {record.Description == "-1" ? "" : record.Description}
                </Text>

            </View>



            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                <View style={{ width: '50%' }}>
                    <Text>Date initiale:</Text>
                </View>


                <TouchableOpacity style={{ padding: 5, width: '50%', backgroundColor: '#1f4598' }}
                    onPress={() => navigation.navigate("SuperCalendrier", { minutePlanifier: record.Minutes_planifie, pk_ID: route.params.pk_ID, startDate: dateToFrench(new Date(record.StartDate)), nomClient: record.Nom_client, nomProjet: record.Nom_projet, nomActivite: record.Nom_activite, employerAssignerPkId: record.fk_assignation, nomEmployeAssigner: getEmployeNameWithPkId(record.fk_assignation), periode: record.AM_PM, employeRemplacant: route.params.employeRemplacant, periodeRemplacant: route.params.periode, periodeModifier: route.params.periode, minutesPlanifieModifie: route.params.minutePlanifier })}
                >
                    <Text style={{ color: 'white' }}>
                        {dateToFrench(new Date(record.StartDate))}
                    </Text>

                </TouchableOpacity>
            </View>


            {route.params.date && new Date(route.params.date).toString() != new Date(record.StartDate).toString() ?
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                    <View style={{ width: '50%' }}>
                        <Text>Date modifié:</Text>
                    </View>

                    <View style={{ padding: 5, width: '50%', backgroundColor: 'white' }}
                    >
                        <Text style={{ color: 'green', fontWeight: 'bold' }}>

                            {dateToFrench(new Date(route.params.date))}
                        </Text>
                    </View>
                </View>
                :
                null
            }
            <View style={{ marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ width: '50%', color: 'black' }}>
                        Employé :
                </Text>
                    <View style={{ marginLeft: 'auto', width: '50%' }}>
                        <Text style={{ color: 'black' }}>
                            {getEmployeNameWithPkId(record.fk_assignation)}
                        </Text>
                    </View>
                </View>

            </View>

            <View style={{ marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                {route.params.employeRemplacant && route.params.employeRemplacant != -1 ?
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ width: '50%', color: 'green' }}>
                            Employé remplacant:
                </Text>
                        <View style={{ marginLeft: 'auto', width: '50%' }}>
                            <Text style={{ color: 'green' }}>
                                {getEmployeNameWithPkId(route.params.employeRemplacant)}
                            </Text>
                        </View>
                    </View>
                    :
                    null
                }
            </View>


            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                <View style={{ width: '80%' }}>
                    <Text>Réelles:</Text>
                </View>
                <View style={{ width: '20%', backgroundColor: 'white' }}>
                    <Text style={{ color: 'black' }}> {record.Minutes}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>

                <View style={{ width: '80%' }}>
                    <Text>Heures planifiées:</Text>
                </View>
                <View style={{ width: '20%', backgroundColor: 'white' }}>
                    <Text style={{ color: 'black' }}> {record.Minutes_planifie}</Text>
                </View>

            </View>

            {route.params.minutePlanifier && route.params.minutePlanifier > 0 ?
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>

                    <View style={{ width: '80%' }}>
                        <Text style={{ color: 'green' }}>Heures planifiées modifié:</Text>
                    </View>
                    <View style={{ width: '20%', backgroundColor: 'white' }}>
                        <Text style={{ color: 'green' }}> {route.params.minutePlanifier}</Text>
                    </View>

                </View>
                :
                null
            }

            <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                <Text style={{ width: '50%' }}>
                    AM/PM initiale:
            </Text>
                <View style={{ marginLeft: 'auto', width: '20%' }}>
                    <Text>
                        {record.AM_PM}
                    </Text>
                </View>
            </View>

            {route.params.periode && route.params.periode != record.AM_PM ?

                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15 }}>
                    <Text style={{ width: '50%', color: 'green' }}>
                        AM/PM modifié:
        </Text>
                    <View style={{ marginLeft: 'auto', width: '20%' }}>
                        <Text style={{ color: 'green' }}>
                            {route.params.periode}
                        </Text>
                    </View>

                </View>
                :

                null}

        </Content>;
    return (


        <Container>


            <Header
                style={Platform.OS != 'ios' ? { backgroundColor: 'transparent', height: 80, justifyContent: 'center', top: 15 } : null}
            >
                <Left>
                    <Button
                        onPress={() => {
                            navigation.replace('MainLecture');
                        }}
                        transparent
                    >
                        <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />
                    </Button>

                </Left>

                <Body>
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>Détails</Text>
                </Body>
                <Right>
                    <Button
                        transparent
                        onPress={async () => {
                            let textModal = "Vous allez modifier ces champs :";

                            let showModal = false;
                            if (route.params.date && new Date(route.params.date).toString() != new Date(record.StartDate).toString()) {
                                showModal = true;
                                textModal = textModal + " date ";
                            }



                            if (route.params.employeRemplacant && route.params.employeRemplacant != -1) {
                                showModal = true;
                                textModal = textModal + " employe ";
                            }



                            if (route.params.periode && route.params.periode != record.AM_PM) {
                                showModal = true;
                                textModal = textModal + " periode(AM/PM) ";
                            }

                            if (route.params.minutesPlanifieModifie && route.params.minutesPlanifieModifie > 0 && record.Minutes_planifie != record.params.minutesPlanifieModifie) {
                                showModal = true;
                                textModal = textModal + " minute planifier ";
                            }
                            if (showModal) {
                                Alert.alert(
                                    'Confirmation Planification',
                                    textModal + 'Êtes-vous sur de vouloir continuer?',
                                    [
                                        {
                                            text: 'Oui',
                                            onPress: async () => {

                                                await edit(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_TEMPS2", record['record-id'], addAndUpdateQuery());
                                                navigation.replace('MainLecture');

                                            }
                                        },
                                        {
                                            text: 'Annuler cette replanification',
                                            onPress: () => navigation.replace('MainLecture'),
                                            style: 'cancel'
                                        },
                                        { text: 'Revérifier mes changements', onPress: () => console.log('OK Pressed') }
                                    ],
                                    { cancelable: false }
                                );
                            } else {
                                await edit(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_TEMPS2", record['record-id'], addAndUpdateQuery());
                                navigation.replace('MainLecture');
                            }


                        }}
                    >
                        <Icon name="save" type={"MaterialIcons"} style={{ fontSize: 30, color: '#1f4598' }} />
                    </Button>
                </Right>
            </Header>

            {!getEmployeNameWithPkId(record.fk_assignation) ?
                <View style={[styles.containerLoading, styles.horizontal]}>

                    <ActivityIndicator size="large" color="black" />

                </View>


                :
                render}

        </Container >
    );
};
export default inject("timeStore")(observer(ModificationDetail));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    containerLoading: {
        flex: 1,
        justifyContent: "center"
    },


    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },



    inputWrapper: {
        marginLeft: 5,
        marginTop: 10,


    },
    inputBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
});
