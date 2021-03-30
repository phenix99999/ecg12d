import { inject } from "mobx-react";
import { Icon, Picker, Text, View, Left, Body, Right, Header, Button } from "native-base";
import * as React from "react";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Record } from "../stores/FMObjectTypes";


interface CustomPickerProps<Fields> {
    records: Record<Fields>[];
    valueKey: keyof Fields;
    getLabel: (record: Record<Fields>) => string;
    onChange: (itemValue: any) => void;
    selectedValue: number;
    placeholder: string;
}

export const CustomPicker = inject("timeStore")(<Fields,>(props: CustomPickerProps<Fields>) => {
    return (
        <Picker
            style={Platform.OS != 'ios' ? { width: '100%', height: 50 } : null}
            selectedValue={props.selectedValue}
            onValueChange={(itemValue, itemIndex) => {
                props.onChange(itemValue);
            }}
            mode="dropdown"
            iosIcon={<Icon name="arrow-down" />}
            headerBackButtonText={"Annuler"}
            placeholder={props.placeholder}
            placeholderStyle={{ color: "#bfc6ea" }}
            placeholderIconColor="#007aff"
            itemTextStyle={{ flex: 1 }}
            renderHeader={(goBack: any) => (
                <Header>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '30%' }}>
                            <Button
                                onPress={() => {
                                    goBack();
                                }}
                                transparent
                            >
                                <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} >
                                </Icon>
                            </Button>

                        </View>
                        <View style={{ width: '70%' }}>
                            <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>{props.name}</Text>
                        </View>
                    </View>
                </Header>
            )}
        >
            {
                props.records.map((record) => (
                    <Picker.Item
                        label={props.getLabel(record)}
                        value={Number(record[props.valueKey])}
                        key={record.id}
                    />
                ))
            }
        </Picker >
    );
});

export const CustomPickerRow = <Fields,>(props: CustomPickerProps<Fields>) => (
    <View style={styles.pickerRow}>
        <View style={{ width: 150 }}>
            <Text style={styles.pickerText}>{props.placeholder}:</Text>
        </View>
        <View style={{ flexGrow: 1, flex: 1, alignItems: "flex-end" }}>
            <CustomPicker {...props} />
        </View>
    </View>
);

interface DetachedCustomPickerProps {
    values: string[];
    onChange: (itemValue: string) => void;
    selectedValue: string;
    placeholder: string;
}
export const DetachedCustomPickerRow = (props: DetachedCustomPickerProps) => (
    <View style={styles.pickerRow}>
        <View style={{ width: 150 }}>
            <Text style={styles.pickerText}>{props.placeholder}:</Text>
        </View>
        <View style={{ flexGrow: 1, flex: 1, alignItems: "flex-end" }}>
            <Picker
                style={Platform.OS != 'ios' ? { width: '100%', height: 50 } : { justifyContent: 'center', width: '100%' }}

                selectedValue={props.selectedValue}
                onValueChange={(itemValue, itemIndex) => {
                    props.onChange(itemValue);
                }}
                mode="dropdown"
                iosIcon={<Icon name="arrow-down" />}
                headerBackButtonText={"Annuler"}
                placeholder={props.placeholder}
                placeholderStyle={{ color: "#bfc6ea" }}
                placeholderIconColor="#007aff"
                itemTextStyle={{ flex: 1 }}
                renderHeader={(goBack: any) => (
                    <Header>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: '30%' }}>
                                <Button
                                    onPress={() => {
                                        goBack();
                                    }}
                                    transparent
                                >
                                    <Icon name="back" type="AntDesign" style={{ fontSize: 30, marginLeft: 2, color: '#1f4598' }} >
                                    </Icon>
                                </Button>

                            </View>
                            <View style={{ width: '70%' }}>
                                <Text style={{ color: '#1f4598', fontWeight: 'bold' }}>{props.name}</Text>
                            </View>
                        </View>
                    </Header>
                )}
            >
                {

                    props.values.map((value) => (
                        <Picker.Item label={value} value={value} key={value} />
                    ))}
            </Picker>
        </View>
    </View >
);

const styles = StyleSheet.create({
    pickerRow: {
        flexDirection: 'row',
        padding: 0,
    },
    pickerText: {
        lineHeight: 40,
        flex: 1,
    },
});
