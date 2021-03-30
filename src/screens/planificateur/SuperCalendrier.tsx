import { StackScreenProps } from "@react-navigation/stack";
import { DrawerActions } from "@react-navigation/core";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { RefreshControl, StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity, TextInput } from "react-native";
import TimeStore from "../../stores/TimeStore";
import { MainStackParamList } from "../../../types";
import DateSlider from "../../components/DateSlider";

import { Container, Header, Button, Left, Icon, Text, Right, Body } from "native-base";
import { setNavigationState } from "../../utils/PersistState";
import { dateToFrench, getNotEmptyDates, getDaysInMonth } from "../../utils/date";
import { get, add } from '../../utils/connectorFileMaker';
import SyncStorage from 'sync-storage';
import { CustomPickerRow, DetachedCustomPickerRow } from "../../components/CustomPicker";

import { setReactionScheduler } from "mobx/lib/internal";
import { useIsFocused } from "@react-navigation/native";
import NetworkUtils from '../../utils/NetworkUtils';

import { Badge } from 'react-native-paper';
type Props = {
    timeStore: TimeStore;
} & StackScreenProps<MainStackParamList, "Main">;


const SuperCalendrier = ({ route, navigation, timeStore }: Props) => {
    const [formatedDataEmploye, setFormatedDataEmploye] = React.useState<Object>([]);
    const [activitesList, setActivitesList] = React.useState<Object>([]);
    const [formatedData, setFormatedData] = React.useState<Object>([]);
    const [dataOnDate, setDataOnDate] = React.useState<Object>([]);
    const [periode, setPeriode] = React.useState<String>("");
    const [minutePlanifier, setMinutePlanifier] = React.useState<String>("");
    const [client, setClient] = React.useState<Number>(0);
    const [project, setProject] = React.useState<Number>(0);
    const [activity, setActivity] = React.useState<Number>(0);
    const [employeRemplacant, setEmployeRemplacant] = React.useState<Number>(-1);
    const [employeList, setEmployeList] = React.useState<Object>([]);
    const [typeAccount, setTypeAccount] = React.useState<Number>();
    const [isLoading, setLoading] = React.useState<Boolean>(false);

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


    async function getRefreshData(fk_assignation = null) {

        let username = SyncStorage.get('username');
        let password = SyncStorage.get('password');


        let layoutTemps = "mobile_TEMPS2";

        let month = timeStore.activeMonth + 1;
        let year = timeStore.activeYear;
        let nbJourMois = (getDaysInMonth(timeStore.activeMonth, year).length);
        let query = "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year;
        if (fk_assignation) {
            query = query + "&fk_assignation=" + fk_assignation;
        }

        console.log(query);

        setFormatedData(await get(username, password, global.fmServer, global.fmDatabase, layoutTemps,
            query));

    }

    const isFocused = useIsFocused();
    function getEmployeNameWithPkId(pk_id) {
        for (let i = 0; i < employeList.length; i++) {
            if (employeList[i].pk_ID == pk_id) {
                return employeList[i]._C_nomComplet;
            }
        }
        return "";
    }

    React.useEffect(() => {
        if (route.params.employeRemplacant) {
            setEmployeRemplacant(route.params.employeRemplacant);
        }
        const getListEmployes = async () => {
            let employes = (await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_ACCOUNT2"));
            setEmployeList(employes);
        }
        const setDataMonth = async (username, password, server, db, month, year, day, employePk) => {
            let query = "&flag_actif=1&StartDate=" + month + "/1/" + year + "..." + month + "/" + nbJourMois + "/" + year;
            // if (employeTemp != 0) {
            query = query + "&fk_assignation=" + employePk;
            // }



            setFormatedData(await get(username, password, server, db, "MOBILE_TEMPS2", query));
            // selectDate(timeStore.selectedDate, await get(username, password, server, db, layoutTemps, query));
        }


        const setDataDay = async (username, password, server, db, month, year, nbJourMois, employePk) => {
            let query = "&flag_actif=1&StartDate=" + month + "/" + day + "/" + timeStore.selectedDate.getFullYear();
            // if (employeTemp != 0) {
            query = query + "&fk_assignation=" + employePk;
            // }

            setDataOnDate(await get(username, password, server, db, layoutTemps,
                query));
        }


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
        setDataDay(username, password, global.fmServer, global.fmDatabase, month, year, day, route.params.employerAssignerPkId);
        setDataMonth(username, password, global.fmServer, global.fmDatabase, month, year, nbJourMois, route.params.employerAssignerPkId);
        getListEmployes();
        // alert(route.params.periode);
        if (route.params.periode) {
            setPeriode(route.params.periode);
        }
        // alert(route.params.minutesPlanifieModifie);
        if (route.params.minutesPlanifieModifie) {
            setMinutePlanifier(route.params.minutesPlanifieModifie);
        }

        if (route.params.periodeModifier) {
            setPeriode(route.params.periodeModifier);
        }

    }, []);



    let notEmptyDates;

    notEmptyDates = getNotEmptyDates(formatedData, "StartDate");

    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion");
    }

    let render;

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
            {2 == 2
                ?

                <View style={{ flex: 1 }}>



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
                        <Body>
                            <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>
                                Replanification
                            </Text>
                        </Body>
                        <Right>
                            <Button
                                transparent
                                onPress={() => {
                                    // alert(minutePlanifier);
                                    navigation.replace("ModificationDetail", { pk_ID: route.params.pk_ID, employeRemplacant: employeRemplacant, date: timeStore.selectedDate, editionMode: "read", minutePlanifier: minutePlanifier, periode: periode });
                                }}
                            >
                                <Icon name="save" type={"MaterialIcons"} style={{ fontSize: 30, color: '#1f4598' }} />
                            </Button>
                        </Right>

                    </Header>

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


                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20 }}>
                            <View style={{ height: 50, justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Client : </Text>
                            </View>

                            <View style={{ height: 50, justifyContent: "center", width: '70%', marginLeft: 'auto' }}>
                                <Text>
                                    {route.params.nomClient}
                                </Text>
                            </View>
                        </View>
                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20 }}>
                            <View style={{ height: 50, justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Projet : </Text>
                            </View>

                            <View style={{ height: 50, flex: 1, justifyContent: "center", width: '70%' }}>
                                <Text>

                                    {route.params.nomProjet.split("|")[1]}
                                </Text>
                            </View>
                        </View>

                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20 }}>
                            <View style={{ height: 50, justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Activité : </Text>
                            </View>

                            <View style={{ height: 50, flex: 1, justifyContent: "center", width: '80%' }}>
                                <Text>
                                    {route.params.nomActivite}
                                </Text>
                            </View>
                        </View>



                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20 }}>
                            <View style={{ height: 50, justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Assigné : </Text>
                            </View>

                            <View style={{ height: 50, flex: 1, justifyContent: "center", width: '70%' }}>
                                <Text>
                                    {route.params.nomEmployeAssigner}
                                </Text>
                            </View>
                        </View>


                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20, marginTop: 10 }}>
                            <View style={{ justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Date : </Text>
                            </View>

                            <View style={{ justifyContent: "center", width: '70%' }}>
                                <Text>
                                    {route.params.startDate}
                                </Text>
                            </View>
                        </View>

                        <View style={{ maxHeight: 30, flex: 1, flexDirection: "row", paddingLeft: 20, marginTop: 10 }}>
                            <View style={{ justifyContent: "center", width: '30%' }}>
                                <Text style={{ fontWeight: "bold", color: 'black' }}>Nouvelle Date : </Text>
                            </View>

                            <View style={{ justifyContent: "center", width: '70%' }}>
                                <Text>
                                    {dateToFrench(new Date(timeStore.selectedDate))}
                                </Text>
                            </View>
                        </View>

                        <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                            <CustomPickerRow<Client>
                                records={employeList}
                                valueKey={"pk_ID"}
                                getLabel={(client) => client.UserAccountName}
                                selectedValue={Number(employeRemplacant)}
                                onChange={async (value) => {
                                    setEmployeRemplacant(value);
                                    getRefreshData(value);
                                }}
                                placeholder={"Rempl"}
                            />
                        </View>



                        <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 15, paddingRight: 20 }}>
                            <View style={{ width: '80%' }}>
                                <Text>Heures planifiées:</Text>
                            </View>
                            <View style={{ width: '20%', backgroundColor: 'grey' }}>
                                <TextInput
                                    value={route.params.minutePlanifie}
                                    style={{ color: 'white', padding: 3 }}
                                    value={minutePlanifier}
                                    onChangeText={text => {
                                        setMinutePlanifier(text);
                                    }}

                                />

                            </View>


                        </View>
                        <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                            <DetachedCustomPickerRow
                                name={"Sélectionner Période"}
                                values={["AM", "PM"]}
                                label={(activite: Record<Activite>) => activite.fields.Nom}
                                selectedValue={periode}
                                onChange={(value) => {
                                    setPeriode(value);
                                }}
                                placeholder={"AM / PM "}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', padding: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>Voici le calendrier de {getEmployeNameWithPkId(employeRemplacant) || route.params.nomEmployeAssigner}</Text>
                        </View>
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

                        </View>



                        {dataOnDate.length === 0 ? (
                            <Text style={styles.noItemText}>Aucune entrée de temps ne correspond à la date sélectionnée</Text>

                        ) :
                            (dataOnDate.map((record) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        // crud.updateEditionMode("update");

                                        navigation.navigate("TempsDetailsClient", { pk_ID: route.params.pk_ID });
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
                                    <Text>{(record.Nom_activite)}</Text>
                                    <Text>{record.Minutes ? record.Minutes + "h" : record.Minutes_planifie + "h"} </Text>
                                    <Text>{record.AM_PM} </Text>

                                </TouchableOpacity>
                            ))
                            )

                        }
                    </ScrollView>
                </View>
                : null

            }

        </Container>
    );

    return (
        render
    );

};
export default inject("timeStore")(observer(SuperCalendrier));

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
