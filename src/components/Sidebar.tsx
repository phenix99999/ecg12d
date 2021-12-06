import * as React from "react";
import { StyleSheet } from "react-native";
import { StackScreenProps, StackNavigationProp } from "@react-navigation/stack";

import { inject, observer } from "mobx-react";
import { Left, Right, Icon, Body, Button } from "native-base";
import { Image, RefreshControl, ScrollView, View } from "react-native";
import { DrawerActions } from "@react-navigation/native";
import Header from "./Header";

import { Container, Content, Text, List, ListItem } from "native-base";

import { DrawerContentComponentProps, DrawerContentOptions } from "@react-navigation/drawer";
import { setNavigationState } from "../utils/PersistState";

//StackScreenProps<DossierStackParamList, 'DossierList'>

const CustomSidebar = (props: DrawerContentComponentProps<DrawerContentOptions>) => {
    let imgSource = require("../assets/images/header.png");

    return (
        <View style={{ flex: 1 }}>
            <Content>
                <Header.Header>
                    <Header.TitleText title={"Menu"} />
                </Header.Header>
                <List>
                    <ListItem
                        icon
                        button={true}
                        onPress={() => {
                            props.navigation.dispatch(DrawerActions.closeDrawer());
                            props.navigation.navigate("Logout");
                            setNavigationState("Logout");
                        }}
                    >
                        <Left>
                            <Icon active name="log-out" />
                        </Left>
                        <Text>Déconnexion</Text>
                        <Body>
                        </Body>
                    </ListItem>
                    <ListItem
                        icon
                        button={true}
                        onPress={() => {
                            props.navigation.dispatch(DrawerActions.closeDrawer());
                            props.navigation.navigate("Logout");
                            setNavigationState("Logout");
                        }}
                    >
                        <Left>
                            <Icon active name="log-out" />
                        </Left>
                        <Body>
                            <Text>Déconnexion</Text>
                        </Body>
                    </ListItem>

                </List>
            </Content>
        </View>
    );
};
export default inject("authStore")(observer(CustomSidebar));

const styles = StyleSheet.create({});
