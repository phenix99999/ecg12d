import { StackScreenProps } from "@react-navigation/stack";
import { DrawerActions } from "@react-navigation/core";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { RefreshControl, StyleSheet, View, FlatList } from "react-native";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../types";
import DateSlider from "../../components/DateSlider";
import { ScrollView, TouchableOpacity } from "react-native";
import { Container, Header, Button, Left, Icon, Text, Right, Body } from "native-base";
import { setNavigationState } from "../../utils/PersistState";
import { dateToFrench, getNotEmptyDates, getDaysInMonth, dateToFMDate } from "../../utils/date";
import { get, add } from '../../utils/connectorFileMaker';
import SyncStorage from 'sync-storage';
import { setReactionScheduler } from "mobx/lib/internal";
import { useIsFocused } from "@react-navigation/native";
import NetworkUtils from '../../utils/NetworkUtils';

import { Badge } from 'react-native-paper';
type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;


const MainPlanification = ({ navigation, timeStore }: Props) => {
    const [formatedDataEmploye, setFormatedDataEmploye] = React.useState<Object>([]);
    const [dataOnDateEmploye, setDataOnDateEmploye] = React.useState<Object>([]);

    const [dataOnDateClient, setDateOnDateClient] = React.useState<Object>([]);
    const [formatedDataClient, setFormatedDataClient] = React.useState<Object>([]);
    const [activitesList, setActivitesList] = React.useState<Object>([]);
    const [modeRemplir, setModeRemplir] = React.useState<Boolean>(false);
    const [employeList, setEmployeList] = React.useState<Object>([]);
    const [typeAccount, setTypeAccount] = React.useState<Number>();
    const [feuilleTempsQuotidien, setFeuilleTempsQuotidien] = React.useState<Object>([]);

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
    function findIndexOfEmployePk_ID(pk_ID, employeListe = null) {
        let employeListeOfficiel = [];
        if (!employeListe) {
            employeListeOfficiel = employeList;
        } else {
            employeListeOfficiel = employeListe;
        }

        for (let i = 0; i < employeListeOfficiel.length; i++) {
            if (employeListeOfficiel[i].pk_ID == pk_ID) {
                return i;
            }
        }
        return -1;
    }

    async function selectDate(date, employeListTemp = false) {

        setModeRemplir(false);
        let employeListe = [];
        if (employeListTemp) {
            employeListe = employeListTemp;
        } else {
            employeListe = employeList;
        }
        let dateObj = new Date(date);
        let month = ("0" + parseInt(dateObj.getMonth() + 1)).slice(-2);

        let day = dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate();

        let dateStr = month + "/" + day + "/" + dateObj.getFullYear();

        // var formattedNumber = ("0" + myNumber).slice(-2);
        let dataOnDateTemp = [];
        let indexDataOnDate = 0;
        let formatedData = [];


        timeStore.selectDate(date)

        let feuilleTemps = await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_TEMPS2"
            , "&flag_actif=1&StartDate=" + month + "/" + date.getDate() + "/" + date.getFullYear())

        setFeuilleTempsQuotidien(feuilleTemps);
        for (let i = 0; i < employeListe.length; i++) {
            // dispoArray[employeList[i].pk_ID.toString()] = {};
            employeListe[i] = { ...employeListe[i], AM: 4, PM: 4, "AM_PM": "" };
        }

        let planification = SyncStorage.get("planification");
        console.log(planification);
        for (let i = 0; i < feuilleTemps.length; i++) {
            let minutes = feuilleTemps[i].Minutes;
            if (!minutes) {
                minutes = feuilleTemps[i].Minutes_planifie;
            }
            if (feuilleTemps[i].AM_PM == "AM") {
                if (findIndexOfEmployePk_ID(feuilleTemps[i].fk_assignation, employeListe) != -1) {
                    employeListe[findIndexOfEmployePk_ID(feuilleTemps[i].fk_assignation, employeListe)].AM -= parseFloat(minutes);
                }
            } else {
                if (findIndexOfEmployePk_ID(feuilleTemps[i].fk_assignation, employeListe) != -1) {

                    employeListe[findIndexOfEmployePk_ID(feuilleTemps[i].fk_assignation, employeListe)].PM -= parseFloat(minutes);
                }
            }
        }


        if (planification) {
            for (let j = 0; j < planification.length; j++) {
                let month = parseInt(timeStore.selectedDate.getMonth()) + 1;

                if (month < 10) {
                    month = "0" + month;
                }

                let day = parseInt(timeStore.selectedDate.getDate()) + 1;
                if (day < 10) {
                    day = "0" + day;
                }

                let monthPlanification = parseInt(new Date(planification[j].date).getMonth()) + 1;

                if (monthPlanification < 10) {
                    monthPlanification = "0" + monthPlanification;
                }

                let dayPlanification = parseInt(new Date(planification[j].date).getDate()) + 1;
                if (dayPlanification < 10) {
                    dayPlanification = "0" + dayPlanification;
                }
                let datePlanification = new Date(planification[j].date).getFullYear() + "-" + monthPlanification + "-" + dayPlanification;
                let dateTimeStore = timeStore.selectedDate.getFullYear() + "-" + month + "-" + day;

                if (datePlanification == dateTimeStore) {
                    if (findIndexOfEmployePk_ID(planification[j].employerPkId, employeListe) != -1) {
                        employeListe[findIndexOfEmployePk_ID(planification[j].employerPkId, employeListe)][planification[j].periode] -= parseFloat(planification[j].duree);
                    }
                }
            }

        }

        if (SyncStorage.get('budject') || SyncStorage.get('modeRemplir')) {
            setModeRemplir(true);
        }

        setEmployeList(employeListe);
    }


    async function getRefreshData() {

        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');


        let layoutTemps = "mobile_TEMPS2";

        let month = timeStore.activeMonth + 1;
        let year = timeStore.activeYear;
        let nbJourMois = (getDaysInMonth(timeStore.activeMonth, year).length);
        if (SyncStorage.get("typeAccount") == 1) {
            // alert("ICI");
            if (SyncStorage.get('filterProject') && SyncStorage.get('filterActivity')) {
                setFormatedDataClient(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps
                    , "&fk_client=" + SyncStorage.get('client_PK') + "&fk_projet=" + SyncStorage.get('filterProject') + "&fk_activites=" + SyncStorage.get('filterActivity') + "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year));
            } else if (SyncStorage.get('filterProject')) {
                setFormatedDataClient(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps
                    , "&fk_client=" + SyncStorage.get('client_PK') + "&fk_projet=" + SyncStorage.get('filterProject') + "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year));
            } else if (SyncStorage.get('filterActivity')) {
                setFormatedDataClient(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps
                    , "&fk_client=" + SyncStorage.get('client_PK') + "&fk_activites=" + SyncStorage.get('filterActivity') + "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year));
            } else {
                setFormatedDataClient(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps
                    , "&fk_client=" + SyncStorage.get('client_PK') + "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year));
            }
        } else {
            let fk_assignation = -1;
            if (SyncStorage.get('user').pk_ID) {
                fk_assignation = SyncStorage.get('user').pk_ID;
            }

            setFormatedDataEmploye(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps
                , "&fk_assignation=" + fk_assignation + "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year));
        }


    }
    const renderItem = ({ item }) => {
        // console.log(SyncStorage.get('planification'));
        // console.log(item);
        let planif = SyncStorage.get('planification');
        let colorAm = 'black';
        let colorPm = 'black';
        console.log(planif);
        if (planif) {


            for (let i = 0; i < planif.length; i++) {
                if (planif[i].employerPkId == item.pk_ID && planif[i].periode == "AM") {
                    colorAm = 'green';
                }
                if (planif[i].employerPkId == item.pk_ID && planif[i].periode == "PM") {
                    colorPm = 'green';
                }
            }

            if (item.AM == 0) {
                colorAm = 'red';
            }
            if (item.PM == 0) {
                colorPm = 'red';
            }
        }
        return (
            <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, height: 60, borderColor: '#1f4598' }}>
                <TouchableOpacity style={{ width: '50%' }}
                    onPress={() => {
                        if (item.AM == 4 && item.PM == 4) {
                            alert("Cette employé n'a rien de planifié cette journée.")
                        } else {
                            navigation.navigate("UneJourneeEmploye", {
                                feuilleTemps: feuilleTempsQuotidien, date: timeStore.selectedDate, nomComplet: item._C_nomComplet, pk_ID: item.pk_ID
                            })

                        }
                    }}
                >

                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>{item._C_nomComplet}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    if (item.AM > 0) {
                        navigation.navigate("SauvegarderPlanification", { reste: item.AM, date: timeStore.selectedDate, nomComplet: item._C_nomComplet, pk_ID: item.pk_ID, periode: "AM" })
                    } else {
                        alert("Cet employé n'a plus de disponibilité en avant-midi");
                    }

                }
                } style={{ width: '12%', backgroundColor: 'transparent' }}>
                    <Text style={{ color: colorAm }}>{item.AM.toFixed(1)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {

                        if (item.PM > 0) {
                            navigation.navigate("SauvegarderPlanification", { reste: item.PM, date: timeStore.selectedDate, nomComplet: item._C_nomComplet, pk_ID: item.pk_ID, periode: "PM" })
                        } else {
                            alert("Cet employé n'a plus de disponibilité en avant-midi");
                        }



                    }}
                    style={{ width: '12%', backgroundColor: 'transparent' }}>
                    <Text style={{ color: colorPm }}>{item.PM.toFixed(1)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("SauvegarderPlanification", { date: timeStore.selectedDate, nomComplet: item._C_nomComplet, pk_ID: item.pk_ID, periode: "ALL" })

                    }}
                    style={{ width: '25%', backgroundColor: 'transparent' }}>
                    <Text style={{ color: item.AM == "red" && item.PM == "red" ? "red" : "black" }} >{(item.AM + item.PM).toFixed(1)}</Text>
                </TouchableOpacity>
            </View>
        );
    }


    const isFocused = useIsFocused();

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

    React.useEffect(() => {

        if (SyncStorage.get('budject') || SyncStorage.get('modeRemplir')) {

            setModeRemplir(true);
        }

        // setModeRemplir(false);

        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');
        let layoutAccount = "mobile_ACCOUNT2";
        const getListEmployes = async () => {
            let employes = (await get(username, password, global.fmServer, global.fmDatabase, layoutAccount, "&PrivilegeSet=0"));
            await selectDate(timeStore.selectedDate, employes);
            return employes;
        }
        let employes = getListEmployes();
        selectDate(timeStore.selectedDate, employes);
        setEmployeList(employes);

    }, [isFocused]);
    let notEmptyDates;
    if (SyncStorage.get('typeAccount') == 1) {
        notEmptyDates = getNotEmptyDates(formatedDataClient, "StartDate");
    } else {
        notEmptyDates = getNotEmptyDates(formatedDataEmploye, "StartDate");
    }

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }

    let render;

    if (SyncStorage.get('typeAccount') == null) {

        render = null;
    } else {

        // alert(SyncStorage.get('filterActivity') > 0);
        let rightHeader;
        rightHeader = <View style={{ flexDirection: 'row' }}>
            <Button
                transparent
                onPress={async () => {
                    navigation.openDrawer();

                }}
            >
                <Icon name="menu" type={"MaterialIcons"} style={{ fontSize: 30, color: '#1f4598' }} />
            </Button>

            <Button
                transparent
                onPress={async () => {
                    navigation.navigate('Planification');

                }}
            >
                <Icon name="plus" type={"AntDesign"} style={{ fontSize: 30, marginRight: 0, color: '#1f4598' }} >
                </Icon>
            </Button>
        </View>




        render = (
            <Container style={{ flex: 1 }}>
                <Header
                    style={Platform.OS != 'ios' ? { backgroundColor: 'transparent', height: 80, justifyContent: 'center' } : { backgroundColor: 'transparent' }}

                >
                    <Left>

                        <View style={{ flexDirection: 'row' }}>

                            <Button
                                transparent
                                onPress={async () => {
                                    navigation.goBack();

                                }}
                            >
                                <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />
                            </Button>

                            {SyncStorage.get('budject') ?
                                <View style={{ flexDirection: 'row' }}>

                                    <Icon name="clockcircle" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />
                                    <View>
                                        <Text style={{ marginLeft: 5, color: 'black', fontSize: 15, fontWeight: 'bold' }}>
                                            {(parseFloat(SyncStorage.get('heureFacturable')).toFixed(2) + "/" + SyncStorage.get('budject'))}
                                        </Text>
                                        <Text style={{ marginLeft: 5, color: parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable')) > 0 ? 'green' : 'red', fontSize: 15, fontWeight: 'bold' }}>
                                            Restant :  {(parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable'))).toFixed(2)}
                                        </Text>
                                    </View>

                                </View>
                                :

                                null}




                        </View>
                    </Left>
                    <Right>
                        {rightHeader}

                    </Right>

                </Header>

                <DateSlider
                    onViewUpdate={(date: { month: number; year: number }) => {
                        timeStore.setMonth(date.month);
                        timeStore.setYear(date.year);
                        getRefreshData();
                    }}
                    noEmptyDates={notEmptyDates}
                    month={timeStore.activeMonth}
                    year={timeStore.activeYear}
                    selected={timeStore.selectedDate}
                    onSelect={async (date: Date) => await selectDate(date)}
                />

                {modeRemplir ?
                    <View>
                        <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                            <Text>
                                Client :  {SyncStorage.get('filterClientName')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 10 }}>
                            <Text>
                                Projet :  {SyncStorage.get('filterProjectName')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', paddingLeft: 20, marginTop: 10 }}>
                            <Text>
                                Activité :  {SyncStorage.get('filterActivityName')}
                            </Text>
                        </View>
                    </View>
                    : null}

                <View style={{ maxHeight: 40, flex: 1, flexDirection: "row", paddingLeft: 20 }}>



                    {SyncStorage.get('planification') && SyncStorage.get('planification').length > 0 ? <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("ConfirmationPlanification")
                        }
                        style={{ width: '50%', height: 50, flex: 1, justifyContent: "center" }}>
                        <Text style={{ fontWeight: "bold", color: '#1f4598' }}>Confirmer planification</Text>
                    </TouchableOpacity> : null}


                </View>

                {modeRemplir ?
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, height: 60, borderColor: '#1f4598' }}>
                        <View style={{ width: '50%' }}>

                            <Text style={{ fontWeight: "bold", color: '#1f4598', paddingLeft: 20 }}>{dateToFrench(timeStore.selectedDate)}</Text>

                        </View>

                        <View style={{ width: '12%' }}>
                            <Text> AM</Text>
                        </View>
                        <View style={{ width: '12%' }}>
                            <Text>PM</Text>
                        </View>
                        <View style={{ width: '26%' }}>
                            <Text>Total Dispo</Text>
                        </View>

                    </View>

                    : null}

                <ScrollView
                    style={styles.scrollview}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={() => {
                                selectDate(timeStore.selectedDate);
                            }}
                        />
                    }
                >
                    {modeRemplir ?

                        <FlatList
                            data={employeList}
                            renderItem={renderItem}
                            keyExtractor={item => item.pk_ID}
                        />
                        :
                        null
                    }


                </ScrollView>
            </Container >
        );
    }
    return (
        render
    );

};
export default inject("timeStore")(observer(MainPlanification));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        flexDirection: "column",
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
    },

    subtitle: {
        fontSize: 14,
        color: "blue",
    },

    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },

    item: {
        backgroundColor: "rgb(240, 240, 240)",
        marginVertical: 8,
        padding: 10,
        margin: 20,
    },
    noItemText: {
        margin: 20,
        textAlign: "center",
    },
    scrollview: {
        flexGrow: 1,
        flex: 1,
    },
});
