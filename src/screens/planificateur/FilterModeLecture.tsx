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
import ProgressCircle from 'react-native-progress-circle'

import * as React from "react";
import { Alert, StyleSheet, unstable_batchedUpdates, View, Platform } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { CustomPickerRow, DetachedCustomPickerRow } from "../../components/CustomPicker";
import { Record, Client, Activite, Projet, Type_de_projet } from "../../stores/FMObjectTypes";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../../types";
import CrudResource from "../../stores/FMMobxResource";
import { get, add, edit, execScript } from '../../utils/connectorFileMaker';
import { create } from "mobx-persist";
import { extendObservableObjectWithProperties } from "mobx/lib/internal";
import { onChange } from "react-native-reanimated";
type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;

const TempsDetailsFilter = ({ route, navigation, timeStore }: Props) => {
    const [formatedActivities, setFormatedActivities] = React.useState<Object>([]);
    const [formatedProjects, setFormatedProjects] = React.useState<Object>([]);
    const [formatedClient, setFormatedClient] = React.useState<Object>([]);



    const [employe, setEmploye] = React.useState<Number>(0);
    const [formatedEmploye, setFormatedEmploye] = React.useState<Object>([]);
    const [client, setClient] = React.useState<Number>(0);
    const [clientName, setClientName] = React.useState<String>("");
    const [project, setProject] = React.useState<Number>(0);
    const [projectName, setProjectName] = React.useState<String>("");
    const [activity, setActivity] = React.useState<Number>(0);
    const [activityName, setActivityName] = React.useState<String>("");

    const [heureFacturable, setHeureFacturable] = React.useState<Number>(0);
    const [budject, setBudject] = React.useState<Number>(0);
    const [pasDeBudject, setPasDeBudject] = React.useState<Number>(0);

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion.");
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
        const getListEmployes = async () => {
            if (Platform.OS != "ios") {
                setFormatedEmploye([{ pk_ID: -1, UserAccountName: 'Choisissez un employé' }].concat(await get(username, password, global.fmServer, global.fmDatabase, layoutAccount, "&PrivilegeSet=0")));

            } else {
                setFormatedEmploye(await get(username, password, global.fmServer, global.fmDatabase, layoutAccount, "&PrivilegeSet=0"));

            }

        }

        const setData = async (username, password, server, db, layoutClient, layoutProjet, layoutActivite) => {
            if (Platform.OS != "ios") {
                setFormatedClient([{ pk_ID: -1, Nom: 'Choisissez un client', fk_client: -1 }].concat(await get(username, password, server, db, layoutClient, "&pk_ID=>0&-sortfield.1=Nom&-sortorder.1=ascend")));
            } else {
                setFormatedClient(await get(username, password, server, db, layoutClient, "&pk_ID=>0&-sortfield.1=Nom&-sortorder.1=ascend"));

            }

            if (SyncStorage.get('filterCalendrier_client')) {
                setClient(SyncStorage.get('filterCalendrier_client'));
                await onChangeClient(SyncStorage.get('filterCalendrier_client'));
            }



            // setFormatedProjects(await get(username, password, server, db, layoutProjet, "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend"));
            // setFormatedActivities(await get(username, password, server, db, layoutActivite, "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend"));
        }

        setData(username, password, global.fmServer, global.fmDatabase, layoutClient, layoutProjet, layoutActivite);
        // alert("ICI");
        if (SyncStorage.get('filterCalendrier_employe')) {
            setEmploye(SyncStorage.get('filterCalendrier_employe'));
        }


        getListEmployes();
    }, []);

    function getClientNameWithClientId(id) {
        // alert("ICI");
        for (let i = 0; i < formatedClient.length; i++) {
            if (formatedClient[i].pk_ID == id) {
                return formatedClient[i].Nom;
            }
        }
        return "";
    }


    function getProjectNameWithProjectId(id) {
        for (let i = 0; i < formatedProjects.length; i++) {
            if (formatedProjects[i].pk_ID == id) {
                return formatedProjects[i].Nom;
            }
        }
        return "";
    }


    function getActivityNameWithActivityId(id) {
        for (let i = 0; i < formatedActivities.length; i++) {
            if (formatedActivities[i].pk_ID == id) {
                return formatedActivities[i].Nom;
            }
        }
        return "";
    }


    async function onChangeClient(value) {

        let theClient = 0;


        let tempFormatedProjects = await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_PROJETS2", "&fk_client=" + value || SyncStorage.get('filterCalendrier_client') + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend")
        let budgetTemp = 0;
        let pasDeBudget = false;

        for (let i = 0; i < tempFormatedProjects.length; i++) {
            if (tempFormatedProjects[i].Type_de_projet == "Pas de budget déterminé") {
                pasDeBudget = true;
            }
            if (tempFormatedProjects[i].Heures_budget) {
                budgetTemp += parseFloat(tempFormatedProjects[i].Heures_budget);
            }

        }
        let tempFormatedActivities = [];

        if (tempFormatedProjects.length == 1) {
            tempFormatedActivities = await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_ACTIVITES2", "&flag_actif=1&fk_client=" + value + "&fk_projet=" + tempFormatedProjects[0].pk_ID + "&-sortfield.1=Nom&-sortorder.1=ascend");
        }

        let heureFacturableTemp = 0;

        for (let i = 0; i < tempFormatedActivities.length; i++) {
            if (tempFormatedActivities[i].Heures_budget_auto) {
                heureFacturableTemp += parseFloat(tempFormatedActivities[i].Heures_budget_auto);
            }
        }

        if (pasDeBudget) {
            heureFacturableTemp = budgetTemp;
        }

        setHeureFacturable(heureFacturableTemp);


        setBudject(budgetTemp);
        setPasDeBudject(pasDeBudget);

        setFormatedProjects(tempFormatedProjects);

        setFormatedActivities(tempFormatedActivities);
        setClient(Number(value));

        setClientName(getClientNameWithClientId(value));


        if (SyncStorage.get('filterCalendrier_projet')) {
            // setProject(SyncStorage.get('filterCalendrier_projet'));
            onChangeProject(SyncStorage.get('filterCalendrier_projet'));
        }

        if (SyncStorage.get('filterCalendrier_activite')) {
            // setProject(SyncStorage.get('filterCalendrier_projet'));
            onChangeActivity(SyncStorage.get('filterCalendrier_activite'));
        }

    }

    async function onChangeProject(value) {
        let theClient = 0;
        theClient = client;
        if (theClient == 0) {
            theClient = SyncStorage.get('filterCalendrier_client');
        }

        let tempFormatedProjects = await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_PROJETS2", "&pk_ID=" + value + "&fk_client=" + theClient + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend")
        let budgetTemp = 0;
        let pasDeBudget = false;
        for (let i = 0; i < tempFormatedProjects.length; i++) {
            if (tempFormatedProjects[i].Type_de_projet == "Pas de budget déterminé") {

                pasDeBudget = true;
            }
            if (tempFormatedProjects[i].Heures_budget) {
                budgetTemp += parseFloat(tempFormatedProjects[i].Heures_budget);
            }

        }

        let tempFormatedActivities = await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_ACTIVITES2", "&fk_projet=" + value + "&fk_client=" + theClient + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend");
        ;



        let heureFacturableTemp = 0;

        for (let i = 0; i < tempFormatedActivities.length; i++) {
            if (tempFormatedActivities[i].Heures_budget_auto) {
                heureFacturableTemp += parseFloat(tempFormatedActivities[i].Heures_budget_auto);
            }
        }

        setHeureFacturable(heureFacturableTemp);
        if (pasDeBudget) {
            budgetTemp = heureFacturableTemp;
        }
        setBudject(budgetTemp);

        console.log(tempFormatedActivities);
        setFormatedActivities(tempFormatedActivities);
        setProject(Number(value));

        setProjectName(getProjectNameWithProjectId(value));

        if (SyncStorage.get('filterCalendrier_activite')) {
            // setActivity(SyncStorage.get('filterCalendrier_activite'));
            onChangeActivity(SyncStorage.get('filterCalendrier_activite'));
        }


    }

    function onChangeActivity(value) {
        let projet;
        for (let i = 0; i < formatedActivities.length; i++) {
            if (formatedActivities[i].pk_ID == Number(value)) {
                projet = (formatedActivities[i].fk_projet);
                setHeureFacturable(formatedActivities[i].Heures_budget_auto);
                setBudject(formatedActivities[i].Heures_budget);

                setProject(Number(projet));
            }
        }
        setActivity(Number(value));
        setActivityName(getActivityNameWithActivityId(value));
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
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>Filtre Calendrier</Text>
                </Body>
                <Right>

                </Right>
            </Header>

            <View style={{ padding: 20 }}>
                <CustomPickerRow<Projet>
                    records={formatedEmploye}
                    valueKey={"pk_ID"}
                    getLabel={(user) => user.UserAccountName}
                    selectedValue={employe}
                    onChange={async (value) => {

                        setEmploye(value);
                    }}
                    placeholder={"Employé"}
                />
            </View>


            <View style={{ padding: 20 }}>



                <CustomPickerRow<Client>
                    records={formatedClient}
                    valueKey={"pk_ID"}
                    getLabel={(client: Record<Client>) => client.Nom}
                    selectedValue={client}
                    onChange={async (value) => {
                        await onChangeClient(value);
                    }}
                    placeholder={"Client"}
                />
            </View>

            <View style={{ padding: 20 }}>
                <CustomPickerRow<Projet>
                    records={formatedProjects}
                    valueKey={"pk_ID"}
                    getLabel={(projet: Record<Projet>) => projet.Nom}
                    selectedValue={project}
                    onChange={async (value) => {
                        await onChangeProject(value);
                    }}
                    placeholder={"Projet"}
                />
            </View>
            <View style={{ padding: 20 }}>
                <CustomPickerRow<Activite>
                    records={formatedActivities}
                    valueKey={"pk_ID"}
                    getLabel={(activite: Record<Activite>) => activite.Nom}
                    selectedValue={activity}
                    onChange={async (value) => {
                        onChangeActivity(value);
                    }}
                    placeholder={"Activité"}
                />

            </View>

            <Button style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                    if (employe == 0 && client == 0 && project == 0 && activity == 0) {
                        SyncStorage.remove('filterCalendrier_employe');
                        SyncStorage.remove('filterCalendrier_client');
                        SyncStorage.remove('filterCalendrier_projet');
                        SyncStorage.remove('filterCalendrier_activite');
                    }


                    navigation.replace("MainLecture", { employe: employe, client: client, project: project, activity: activity });

                }



                }
            >
                <Text style={{ textAlign: 'center' }}>
                    Rechercher
                </Text>
            </Button>


            <Button style={{ width: '100%', top: '1%', justifyContent: 'center', backgroundColor: 'red' }}
                onPress={async () => {
                    SyncStorage.remove('filterCalendrier_employe');
                    SyncStorage.remove('filterCalendrier_client');
                    SyncStorage.remove('filterCalendrier_projet');
                    SyncStorage.remove('filterCalendrier_activite');
                    setEmploye(0);
                    setClient(0);
                    setProject(0);
                    setActivity(0);
                    navigation.replace("MainLecture", { employe: 0, client: 0, project: 0, activity: 0 });

                }}
            >
                <Text style={{ textAlign: 'center' }}>
                    Annuler les filtres
                </Text>
            </Button>




        </Container>
    );
};
export default inject("timeStore")(observer(TempsDetailsFilter));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    inputWrapper: {
        padding: 20,

    },
    inputBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
});
