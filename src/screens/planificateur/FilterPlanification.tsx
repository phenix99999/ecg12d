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
import { Alert, StyleSheet, unstable_batchedUpdates, View } from "react-native";
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

const TempsDetailsFilter = ({ route, navigation, timeStore }: Props) => {
    const [formatedActivities, setFormatedActivities] = React.useState<Object>([]);
    const [formatedProjects, setFormatedProjects] = React.useState<Object>([]);
    const [project, setProject] = React.useState<Object>([]);
    const [activity, setActivity] = React.useState<Object>([]);

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


        setData(username, password, global.fmServer, global.fmDatabase, layoutClient, layoutProjet, layoutActivite);

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
                    <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>Filtre</Text>
                </Body>
                <Right>
                    <Button
                        transparent
                        onPress={async () => {
                            SyncStorage.set('filterProject', project);
                            SyncStorage.set('filterActivity', activity);
                            navigation.goBack();

                        }}
                    >

                        {SyncStorage.get('filterProject') && SyncStorage.get('filterProject') > 0 || SyncStorage.get('filterActivity') && SyncStorage.get('filterActivity') > 0 ?
                            <Icon name="filter" type={"AntDesign"} style={{ fontSize: 30, marginLeft: 2, color: 'red' }} /> :
                            <Icon name="filter" type={"AntDesign"} style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} />}
                    </Button>
                </Right>
            </Header>
            <View style={{ padding: 20 }}>
                <CustomPickerRow<Projet>
                    records={formatedProjects}
                    valueKey={"pk_ID"}
                    getLabel={(projet: Record<Projet>) => projet.Nom}
                    selectedValue={project}
                    onChange={async (value) => {
                        setFormatedActivities(await get(SyncStorage.get('username'), SyncStorage.get('password'), global.fmServer, global.fmDatabase, "mobile_ACTIVITES2", "&fk_projet=" + value + "&flag_actif=1" + "&-sortfield.1=Nom&-sortorder.1=ascend"));
                        setProject(Number(value));
                    }}
                    placeholder={"Projets"}
                />
            </View>
            <View style={{ padding: 20 }}>
                <CustomPickerRow<Activite>
                    records={formatedActivities}
                    valueKey={"pk_ID"}
                    getLabel={(activite: Record<Activite>) => activite.Nom}
                    selectedValue={activity}
                    onChange={(value) => {
                        let projet;
                        for (let i = 0; i < formatedActivities.length; i++) {
                            if (formatedActivities[i].pk_ID == Number(value)) {
                                projet = (formatedActivities[i].fk_projet);
                                setProject(Number(projet));
                            }
                        }

                        setActivity(Number(value));
                    }}
                    placeholder={"Activités"}
                />

            </View>

            <Button style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => {
                    SyncStorage.set('filterProject', project);
                    SyncStorage.set('filterActivity', activity);
                    navigation.goBack();

                }
                }
            >
                <Text style={{ textAlign: 'center' }}>
                    Rechercher
                </Text>
            </Button>


            <Button style={{ width: '100%', top: '100%', justifyContent: 'center', backgroundColor: 'red' }}
                onPress={async () => {
                    SyncStorage.remove("filterProject");
                    SyncStorage.remove("filterActivity");
                    setProject("");
                    setActivity("");
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
