import { StackScreenProps } from "@react-navigation/stack";
import { DrawerActions } from "@react-navigation/core";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../../../types";
import DateSlider from "../../components/DateSlider";
import { ScrollView, TouchableOpacity } from "react-native";
import { Container, Header, Button, Left, Icon, Text, Right, Body } from "native-base";
import { setNavigationState } from "../../utils/PersistState";
import { dateToFrench, getNotEmptyDates, getDaysInMonth } from "../../utils/date";
import { get, add } from '../../utils/connectorFileMaker';
import SyncStorage from 'sync-storage';
import { setReactionScheduler } from "mobx/lib/internal";
import { useIsFocused } from "@react-navigation/native";
import NetworkUtils from '../../utils/NetworkUtils';

import { Badge } from 'react-native-paper';
type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;


const MainLecture = ({ route, navigation, timeStore }: Props) => {
    const [formatedDataEmploye, setFormatedDataEmploye] = React.useState<Object>([]);
    const [activitesList, setActivitesList] = React.useState<Object>([]);
    const [formatedData, setFormatedData] = React.useState<Object>([]);
    const [dataOnDate, setDataOnDate] = React.useState<Object>([]);
    const [client, setClient] = React.useState<Number>(0);
    const [project, setProject] = React.useState<Number>(0);
    const [activity, setActivity] = React.useState<Number>(0);
    const [employe, setEmploye] = React.useState<Number>(0);

    const [typeAccount, setTypeAccount] = React.useState<Number>();

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
    function selectDate(date, formatedDataTemp = null) {
        let theData = [];
        if (formatedDataTemp) {
            theData = formatedDataTemp;
        } else {
            theData = formatedData;
        }

        let dateObj = new Date(date);
        let month = ("0" + parseInt(dateObj.getMonth() + 1)).slice(-2);

        let day = dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate();

        let dateStr = month + "/" + day + "/" + dateObj.getFullYear();

        let dataOnDateTemp = [];
        let indexDataOnDate = 0;



        for (let i = 0; i < theData.length; i++) {

            if (theData[i].StartDate == dateStr) {

                dataOnDateTemp[indexDataOnDate] = theData[i];
                indexDataOnDate++;
            }
        }


        setDataOnDate(dataOnDateTemp);
        timeStore.selectDate(date)


    }


    async function getRefreshData() {
        setFormatedData([]);
        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');


        let layoutTemps = "mobile_TEMPS2";

        let month = timeStore.activeMonth + 1;
        let year = timeStore.activeYear;
        let nbJourMois = (getDaysInMonth(timeStore.activeMonth, year).length);
        let query = "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year;



        if (SyncStorage.get("filterCalendrier_employe") && SyncStorage.get("filterCalendrier_employe") != 0) {
            query = query + "&fk_assignation=" + SyncStorage.get("filterCalendrier_employe");
        }

        if (SyncStorage.get("filterCalendrier_client") && SyncStorage.get("filterCalendrier_client") != 0) {
            query = query + "&fk_client=" + SyncStorage.get("filterCalendrier_client");
        }
        if (SyncStorage.get("filterCalendrier_projet") && SyncStorage.get("filterCalendrier_projet") != 0) {
            query = query + "&fk_projet=" + SyncStorage.get("filterCalendrier_projet");
        }
        if (SyncStorage.get("filterCalendrier_activite") && SyncStorage.get("filterCalendrier_activite") != 0) {
            query = query + "&fk_activites=" + SyncStorage.get("filterCalendrier_activite");
        }

        setFormatedData(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps,
            query));

    }

    const isFocused = useIsFocused();

    React.useEffect(() => {

        let employeTemp = 0;
        let clientTemp = 0;
        let projetTemp = 0;
        let activiteTemp = 0;
        if (route.params) {
            // alert(route.params.client);
            SyncStorage.set('filterCalendrier_employe', route.params.employe);
            SyncStorage.set('filterCalendrier_client', route.params.client);
            SyncStorage.set('filterCalendrier_projet', route.params.project);
            SyncStorage.set('filterCalendrier_activite', route.params.activity);
            setEmploye(route.params.employe);
            setClient(route.params.client);
            setProject(route.params.project);
            setActivity(route.params.activity);
            employeTemp = route.params.employe;
            clientTemp = route.params.client;
            projetTemp = route.params.project;
            activiteTemp = route.params.activity;

        } else {
            if (SyncStorage.get('filterCalendrier_employe')) {
                setEmploye(SyncStorage.get('filterCalendrier_employe'));
                employeTemp = SyncStorage.get('filterCalendrier_employe');
            }

            if (SyncStorage.get('filterCalendrier_client')) {
                setClient(SyncStorage.get('filterCalendrier_client'));
                clientTemp = SyncStorage.get('filterCalendrier_client');
            }

            if (SyncStorage.get('filterCalendrier_projet')) {
                setProject(SyncStorage.get('filterCalendrier_projet'));
                projetTemp = SyncStorage.get('filterCalendrier_projet');

            }

            if (SyncStorage.get('filterCalendrier_activite')) {
                setActivity(SyncStorage.get('filterCalendrier_activite'));
                activiteTemp = SyncStorage.get('filterCalendrier_activite');
            }

        }



        // alert(SyncStorage.get('filterCalendrier_employe'));
        const setDataMonth = async (username, password, server, db, month, year, day) => {
            let query = "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year;
            if (employeTemp != 0) {
                query = query + "&fk_assignation=" + employeTemp;
            }

            if (clientTemp != 0) {
                query = query + "&fk_client=" + clientTemp;
            }
            if (projetTemp != 0) {
                query = query + "&fk_projet=" + projetTemp;
            }
            if (activiteTemp != 0) {
                query = query + "&fk_activites=" + activiteTemp;
            }

            setFormatedData(await get(username, password, server, db, layoutTemps, query));
            selectDate(timeStore.selectedDate, await get(username, password, server, db, layoutTemps, query));
        }


        const setDataDay = async (username, password, server, db, month, year, nbJourMois) => {
            let query = "&flag_actif=1&StartDate=" + month + "/" + day + "/" + timeStore.selectedDate.getFullYear();
            if (employeTemp != 0) {
                query = query + "&fk_assignation=" + employeTemp;
            }

            if (clientTemp != 0) {
                query = query + "&fk_client=" + clientTemp;
            }
            if (projetTemp != 0) {
                query = query + "&fk_projet=" + projetTemp;
            }
            if (activiteTemp != 0) {
                query = query + "&fk_activites=" + activiteTemp;
            }

            setDataOnDate(await get(username, password, server, db, layoutTemps,
                query));
        }



        const setListActivities = async () => {
            setActivitesList(await get(username, password, global.fmServer, global.fmDatabase, "mobile_ACTIVITES2"));
        }




        let typeAccount = (SyncStorage.get('typeAccount'));

        setTypeAccount(typeAccount);


        let fk_assignation = SyncStorage.get('user') ? SyncStorage.get('user').pk_ID : -1;
        let pkIdClient;
        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');
        let db = "vhmsoft";
        let layoutTemps = "mobile_TEMPS2";
        let month = timeStore.selectedDate.getMonth() + 1;
        let day = timeStore.selectedDate.getDate() + 1;
        // alert(month);

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }
        // alert(day);
        let year = timeStore.activeYear;
        let nbJourMois = (getDaysInMonth(timeStore.activeMonth, year).length);
        //pk_id du client 
        pkIdClient = SyncStorage.get('client_PK');
        setDataDay(username, password, global.fmServer, global.fmDatabase, month, year, day);
        setDataMonth(username, password, global.fmServer, global.fmDatabase, month, year, nbJourMois, timeStore);
        setListActivities();

    }, [isFocused]);





    let notEmptyDates;

    notEmptyDates = getNotEmptyDates(formatedData, "StartDate");


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
                    navigation.navigate('FilterModeLecture');

                }}
            >
                {(SyncStorage.get("filterCalendrier_client") && SyncStorage.get("filterCalendrier_client") > 0) ||
                    (SyncStorage.get("filterCalendrier_projet") && SyncStorage.get("filterCalendrier_projet") > 0) ||
                    (SyncStorage.get("filterCalendrier_activite") && SyncStorage.get("filterCalendrier_activite") > 0) ||
                    (SyncStorage.get("filterCalendrier_employe") && SyncStorage.get("filterCalendrier_employe") > 0)

                    ?

                    <Icon name="filter" type={"AntDesign"} style={{ fontSize: 30, marginRight: 0, color: 'red' }} >

                    </Icon>
                    :
                    <Icon name="filter" type={"AntDesign"} style={{ fontSize: 30, marginRight: 0, color: '#1f4598' }} >

                    </Icon>
                }
            </Button>

        </View>




        render = (
            <Container style={{ flex: 1 }}>
                <Header
                    style={Platform.OS != 'ios' ? { backgroundColor: 'transparent', height: 80, justifyContent: 'center' } : { backgroundColor: 'transparent' }}
                >
                    <Left>
                        <Button
                            transparent
                            onPress={async () => {
                                navigation.goBack();

                            }}
                        >
                            <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />
                        </Button>

                    </Left>
                    <Right>
                        {rightHeader}

                    </Right>

                </Header>

                <DateSlider
                    onViewUpdate={async (date: { month: number; year: number }) => {
                        timeStore.setMonth(date.month);
                        timeStore.setYear(date.year);
                        await getRefreshData();
                    }}
                    noEmptyDates={notEmptyDates}
                    month={timeStore.activeMonth}
                    year={timeStore.activeYear}
                    selected={timeStore.selectedDate}
                    onSelect={(date: Date) => selectDate(date)}
                />
                <View style={{ maxHeight: 40, flex: 1, flexDirection: "row", paddingLeft: 20 }}>
                    <View style={{ height: 50, flex: 1, justifyContent: "center" }}>
                        <Text style={{ fontWeight: "bold", color: '#1f4598' }}>{dateToFrench(timeStore.selectedDate)}</Text>
                    </View>

                    {!typeAccount ?

                        <View style={{ height: 50, flex: 1, justifyContent: "center" }}>
                            <Button
                                style={{ alignSelf: "flex-end" }}
                                transparent
                                onPress={() => {
                                    // crud.updateEditionMode("create");
                                    navigation.navigate("TempsDetails", { editionMode: 'create' });
                                }}
                            >
                                <Text style={{ color: '#1f4598' }}>+ Nouvelle entrée</Text>
                            </Button>
                        </View>
                        :

                        null}


                </View>
                <ScrollView
                    style={styles.scrollview}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={async () => {
                                getRefreshData();
                                selectDate(timeStore.selectedDate);
                            }}
                        />
                    }
                >


                    {dataOnDate.length === 0 ? (
                        <Text style={styles.noItemText}>Aucune entrée de temps ne correspond à la date sélectionnée</Text>

                    ) :
                        (dataOnDate.map((record) => (
                            <TouchableOpacity
                                onPress={() => {
                                    // crud.updateEditionMode("update");

                                    navigation.replace("ModificationDetail", { pk_ID: record.pk_ID, fk_assignation: record.fk_assignation, editionMode: "read" });
                                }}
                                style={styles.item}
                                key={record.pk_ID}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '90%' }}>
                                        <Text>{record.Nom_assignation}</Text>
                                    </View>
                                    <View style={{ width: '10%' }}>
                                        <Text>
                                            <Text style={{ fontWeight: 'bold', color: "red" }}>
                                                {record.Flag_replanif == 1 ? "R " : null}
                                            </Text>
                                            <Text style={{ fontWeight: 'bold', color: "black" }}>
                                                {record.flag_planif == 1 ? "P" : null}
                                            </Text>
                                        </Text>
                                    </View>
                                </View>


                                <Text>{getActivitiesNameWithPkId(record.fk_activites)}</Text>
                                <Text>{record.Minutes > 0 ? record.Minutes + "h" : record.Minutes_planifie + "h"} en {record.AM_PM} </Text>


                            </TouchableOpacity>
                        ))
                        )

                    }
                </ScrollView>
            </Container>
        );
    }
    return (
        render
    );

};
export default inject("timeStore")(observer(MainLecture));

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
