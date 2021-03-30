import { Header, Left, Button, Body, Right, Icon } from "native-base";
import { Image, Platform, Text, StyleSheet } from "react-native";

import { StyleProvider, Spinner, Title } from "native-base";
import React from "react";
import Constants from "expo-constants";

import { Ionicons } from "@expo/vector-icons";

const HEADER_MARGIN_TOP = Platform.OS === "ios" ? 0 : Constants.statusBarHeight; /*backgroundColor: "white"*/

const MenuButton = ({ onPress }: { onPress: () => void }) => (
    <Left style={{ flex: 1 }}>
        <Button transparent onPress={() => onPress()}>
            <Icon name="menu" />
        </Button>
    </Left>
);

const Picker = ({ onPress, border = false }: { onPress: () => void; border?: boolean }) => {
    return (
        <Header style={[styles.header, border ? { borderBottomColor: "black" } : {}]}>
            <Left>
                <Button transparent onPress={() => onPress()}>
                    <Text>Annuler</Text>
                </Button>
            </Left>
            <Body>
                <Text>Selectionnez une valeur</Text>
            </Body>
        </Header>
    );
};

const BackButton: React.FunctionComponent<{ onPress: () => void }> = (props) => (
    <Left>
        <Button transparent onPress={() => props.onPress()}>
            <Icon name="arrow-back" />
        </Button>
    </Left>
);

const HasTabs: React.FunctionComponent<{ border?: boolean }> = ({ children, border = false }) => (
    <Header style={[styles.header, border ? { borderBottomColor: "black" } : {}]} hasTabs>
        {children}
    </Header>
);

const TitleImage = () => (
    <Body style={{ flex: 5 }}>
        <Image style={{ width: 250 }} resizeMode={"contain"} source={require("../assets/images/header.png")} />
    </Body>
);
const TitleText = ({ title }: { title: string }) => (
    <Body>
        <Title style={{ alignSelf: "center" }}>{title}</Title>
    </Body>
);

const RightButton = ({ onPress }: { onPress: () => void }) => (
    <Right style={{ flex: 1 }}>
        <Button transparent onPress={() => onPress()}>
            <Icon active name="filter" type="AntDesign" />
        </Button>
    </Right>
);

const CustomHeader: React.FunctionComponent<{ hasBorder?: boolean; hasTabs?: boolean }> = ({
    children,
    hasBorder = true,
    hasTabs = false,
}) => (
    <Header
        noShadow={true}
        style={[
            styles.header,
            hasBorder ? { borderBottomColor: "rgb(222,222,222)" } : { borderBottomColor: "transparent" },
        ]}
        //iosBarStyle={"light-content"}
        //androidStatusBarColor={"black"}
    >
        {children}
    </Header>
);

const LoadingIcon = ({ isLoading }: { isLoading: boolean }) => (
    <Right>{isLoading ? <Spinner color={"black"} /> : null}</Right>
);
const styles = StyleSheet.create({
    header: {
        marginTop: HEADER_MARGIN_TOP,
    },
});

export default {
    Header: CustomHeader,
    BackButton: BackButton,
    RightButton: RightButton,
    TitleImage: TitleImage,
    Picker: Picker,
    TitleText: TitleText,
    MenuButton: MenuButton,
    HasTabs: HasTabs,
    LoadingIcon: LoadingIcon,
};
