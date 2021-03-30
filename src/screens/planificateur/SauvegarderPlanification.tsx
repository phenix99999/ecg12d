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
import { Alert, StyleSheet, Platform, View } from "react-native";
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

const SauvegarderPlanification = ({ route, navigation, timeStore }: Props) => {
    const [heure, setHeure] = React.useState<Number>(0);
    const [tache, setTache] = React.useState<String>("");
    const [description, setDescription] = React.useState<String>("");


    if (!NetworkUtils.isNetworkAvailable()) {
        alert("Erreur de connexion.");
    }

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



        let planification = SyncStorage.get('planification');
        if (planification && planification.length > 0) {

            let dateWeAreOn = route.params.date.getFullYear() + "-" + route.params.date.getMonth() + "-" + route.params.date.getDate();
            let datePlanification = new Date(planification[0].date).getFullYear() + "-" + new Date(planification[0].date).getMonth() + "-" + new Date(planification[0].date).getDate();

            for (let i = 0; i < planification.length; i++) {
                if (dateWeAreOn == datePlanification && planification[i].employerPkId == route.params.pk_ID && planification[i].periode == route.params.periode) {
                    setHeure(planification[i].duree);
                    setTache(planification[i].tache);
                }
            }
        } else {

        }


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

    return (


        <Container>
            <Header
                style={Platform.OS != 'ios' ? { backgroundColor: 'transparent', height: 80, justifyContent: 'center' } : { backgroundColor: 'transparent' }}
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
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>Sauvegarder planification</Text>
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
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 5 }}>


                    <Text>Date : </Text>
                    <View style={{ marginLeft: 'auto', width: '80%' }}>
                        <Text> {dateToFrench(new Date(route.params.date))} </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>


                    <Text>Employé : </Text>
                    <View style={{ width: '80%', marginLeft: 'auto' }}>
                        <Text> {route.params.nomComplet} </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <View style={{ width: '15%' }}>


                        <Text>Client : </Text>
                    </View>
                    <View style={{ width: '80%', marginLeft: 'auto' }}>
                        <Text>{SyncStorage.get('filterClientName')} </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Projet : </Text>
                    <View style={{ width: '80%', marginLeft: 'auto' }}>
                        <Text>{SyncStorage.get('filterProjectName')} </Text>
                    </View>

                </View>

                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Activité :  </Text>
                    <View style={{ width: '80%', marginLeft: 'auto' }}>
                        <Text>{SyncStorage.get('filterActivityName')} </Text>
                    </View>

                </View>

                <View style={{ flexDirection: 'row', marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Durée</Text>
                    <View style={{ width: '80%', marginLeft: 'auto' }}>
                        <TextInput
                            keyboardType='numeric'
                            value={heure}
                            onChange={(e) => {
                                if (SyncStorage.get('pasDeBudget')) {
                                    (setHeure(e.nativeEvent.text))
                                } else {



                                    // alert(parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable')));
                                    if (parseFloat(e.nativeEvent.text) > (parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable')))) {
                                        alert("Vous pouvez entrez un maximum de " + parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable')).toFixed(2) + " heure.");
                                        setHeure(parseFloat(SyncStorage.get('budject') - SyncStorage.get('heureFacturable')).toFixed(2));
                                    } else {
                                        if (e.nativeEvent.text > route.params.reste) {
                                            alert("Vous pouvez entrez un maximum de " + route.params.reste + " heure.");
                                            setHeure("");
                                        } else {
                                            (setHeure(e.nativeEvent.text))
                                        }
                                    }
                                }


                            }
                            }
                            placeholder="Nombre d'heure"
                        />
                    </View>
                </View>

                <View style={{ marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <DetachedCustomPickerRow

                        name={"Sélectionner Tâches"}
                        values={formatedTaches}
                        label={(tache: Record<Activite>) => tache.name}
                        selectedValue={tache}
                        onChange={(value) => {
                            setTache(value);
                            // setRecord({ ...record, "Taches": value })
                        }}
                        placeholder={"Tâches"}
                    />
                </View>

                <View style={{ marginLeft: 20, marginRight: 20, marginTop: 25 }}>
                    <Text>Description du travail à faire:</Text>
                    <Textarea
                        placeholder={"Écrivez la description ici"}
                        bordered

                        style={styles.inputBorder}
                        rowSpan={3}
                        value={description}
                        onChangeText={(text) => {
                            setDescription(text);
                        }}
                    />
                </View>
            </Content>

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

                <Button style={{ marginTop: 50, width: '65%', backgroundColor: '#1f4598', justifyContent: 'center' }}
                    onPress={async () => {
                        // SyncStorage.remove('planification');
                        let planification = SyncStorage.get('planification');
                        if (!planification) {
                            planification = [];
                            planification[0] = {};
                            planification[0].employerPkId = route.params.pk_ID;
                            planification[0].duree = heure;
                            planification[0].nom = route.params.nomComplet;
                            planification[0].clientName = SyncStorage.get('filterClientName');
                            planification[0].projectName = SyncStorage.get('filterProjectName');
                            planification[0].activityName = SyncStorage.get('filterActivityName');
                            planification[0].client = SyncStorage.get('filterClient');
                            planification[0].projet = SyncStorage.get('filterProject');
                            planification[0].activity = SyncStorage.get('filterActivity');
                            planification[0].periode = route.params.periode;
                            planification[0].date = route.params.date;
                            planification[0].tache = tache;
                            planification[0].description = description;
                            planification[0].index = 0;

                        } else {
                            let planificationLength = (planification.length);
                            planification[planificationLength] = {};

                            planification[planificationLength].nom = route.params.nomComplet;
                            planification[planificationLength].employerPkId = route.params.pk_ID;
                            planification[planificationLength].periode = route.params.periode;
                            planification[planificationLength].clientName = SyncStorage.get('filterClientName');
                            planification[planificationLength].projectName = SyncStorage.get('filterProjectName');
                            planification[planificationLength].activityName = SyncStorage.get('filterActivityName');
                            planification[planificationLength].duree = heure;
                            planification[planificationLength].client = SyncStorage.get('filterClient');
                            planification[planificationLength].projet = SyncStorage.get('filterProject');
                            planification[planificationLength].activity = SyncStorage.get('filterActivity');
                            planification[planificationLength].date = route.params.date;
                            planification[planificationLength].tache = tache;
                            planification[planificationLength].description = description;
                            planification[planificationLength].index = planificationLength;

                        }

                        SyncStorage.set('heureFacturable', parseFloat(parseFloat(SyncStorage.get('heureFacturable')) + parseFloat(heure)));

                        SyncStorage.set('planification', planification);

                        navigation.goBack();

                    }}
                >

                    <Text style={{ textAlign: 'center' }}>
                        Confirmer planification
                </Text>

                </Button>


            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Button style={{ width: '65%', justifyContent: 'center', marginTop: 25, backgroundColor: 'red' }}
                    onPress={async () => {

                        navigation.goBack();
                    }}
                >

                    <Text style={{ textAlign: 'center' }}>
                        Annuler planification
                </Text>
                </Button>
            </View>

        </Container >
    );
};
export default inject("timeStore")(observer(SauvegarderPlanification));

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    inputWrapper: {
        padding: 20,
        flexDirection: 'row'
    },
    inputBorder: {
        borderWidth: 1,
        borderColor: "black",
    },
});
