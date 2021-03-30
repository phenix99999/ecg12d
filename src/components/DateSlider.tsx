import { Icon } from "native-base";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { areSameDates, dateToFrench, getDaysInMonth, groupDaysByWeek } from "../utils/date";
type OnSelect = (date: Date) => void;
const FIRST_DAY = 0;
interface DayCellProps {
    isNotEmpty: boolean;
    date: Date;
    onSelect: OnSelect;
    selected: Date;
}

const DayCell = (props: DayCellProps) => {
    const isWeekend = props.date.getDay() === 0 || props.date.getDay() === 6;
    const isSelected = areSameDates(props.selected, props.date);


    const today = new Date();
    const isToday = areSameDates(today, props.date);


    return (
        <View style={[styles.baseCell, styles.dayCell]}>
            <TouchableOpacity
                onPress={() => props.onSelect(props.date)}
                style={[
                    styles.dayButton,
                    props.isNotEmpty ? styles.notEmptyButton : {},
                    isSelected ? styles.selectedDayButton : {},
                    isToday ? styles.todayButton : {},
                    isToday && isSelected ? styles.todayAndSelectedButton : {},
                    props.isNotEmpty && props.date > today ? styles.futureButton : {},

                ]}
            >
                <Text
                    style={[
                        isWeekend ? styles.cellWeekend : styles.cellWeekday,
                        isSelected ? styles.selectedDayText : {},
                        isToday ? styles.selectedDayText : {},
                        props.isNotEmpty && props.date > today ? styles.futureButtonText : {},
                    ]}
                >
                    {props.date.getDate()}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
const BlankDayCell = (props: {}) => <View style={[styles.baseCell, styles.blankDayCell]}></View>;

interface DateSliderProps {
    month: number;
    year: number;
    onSelect: OnSelect;
    selected: Date;
    noEmptyDates: Date[];
    onViewUpdate: (view: { month: number; year: number }) => void;
}

export default (props: DateSliderProps) => {
    const days = getDaysInMonth(props.month, props.year);
    const weeks = groupDaysByWeek(days);

    const firstBlanks = (week: Date[]) => {
        let firstDay = week[0];
        const firstDiff = (firstDay.getDay() + -FIRST_DAY) % 7;
        return Array.from(Array(firstDiff).keys());
    };
    const lastBlanks = (week: Date[]) => {
        let lastDay = week[week.length - 1];
        const lastDiff = (FIRST_DAY + 6 - lastDay.getDay()) % 7;
        return Array.from(Array(lastDiff).keys());
    };

    const moduloMonth = (month: number) => {
        return (month + 12) % 12;
    };
    const numberToMonth = (month: number) => {
        const monthsMap = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Déc"];
        const monthIndex = moduloMonth(month);
        return monthsMap[monthIndex];
    };

    const slide = (increment: number) => {
        const newMonth = props.month + increment;
        const newYear = newMonth >= 0 && newMonth <= 11 ? props.year : props.year + increment;

        props.onViewUpdate({
            month: moduloMonth(newMonth),
            year: newYear,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.monthRow}>
                <TouchableOpacity onPress={() => slide(-1)} style={styles.monthButton}>
                    <Icon name="arrow-back" style={[styles.monthButtonText, { paddingRight: 10 }]}></Icon>
                    <Text style={styles.monthButtonText}>{numberToMonth(props.month - 1)}</Text>
                </TouchableOpacity>
                <View style={styles.monthButton}>
                    <Text style={styles.currentMonth}>{numberToMonth(props.month) + " " + props.year}</Text>
                </View>

                <TouchableOpacity onPress={() => slide(1)} style={[styles.monthButton]}>
                    <Text style={[styles.monthButtonText, { textAlign: "right", flex: 1 }]}>
                        {numberToMonth(props.month + 1)}
                    </Text>
                    <Icon name="arrow-forward" style={[styles.monthButtonText, { paddingLeft: 10 }]}></Icon>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
                <Text style={styles.weekDay}>D</Text>
                <Text style={styles.weekDay}>L</Text>
                <Text style={styles.weekDay}>M</Text>
                <Text style={styles.weekDay}>M</Text>
                <Text style={styles.weekDay}>J</Text>
                <Text style={styles.weekDay}>V</Text>
                <Text style={styles.weekDay}>S</Text>
            </View>
            <View style={styles.calendar}>
                {weeks.map((week) => (
                    <View style={styles.weekRow}>
                        {firstBlanks(week).map((obj, idx) => (
                            <BlankDayCell key={"first" + idx.toString()} />
                        ))}
                        {week.map((date) => (
                            <DayCell
                                onSelect={props.onSelect}
                                selected={props.selected}
                                key={date.toDateString()}
                                date={date}
                                isNotEmpty={props.noEmptyDates.some(
                                    (notEmptyDate) => date.getDate() === notEmptyDate.getDate()
                                )}
                            />
                        ))}
                        {lastBlanks(week).map((obj, idx) => (
                            <BlankDayCell key={"last" + idx.toString()} />
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    baseCell: {
        justifyContent: "center", //Centered vertically
        alignItems: "center", // Centered horizontally
        flex: 1,
        padding: 3,
    },
    weekDay: {
        flex: 1,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 10,
    },
    cellWeekday: {
        color: "black",
    },
    cellWeekend: {
        color: "grey",
    },
    dayCell: {
        flex: 1,
    },
    blankDayCell: {
        flex: 1,
    },
    weekRow: {
        flexDirection: "row",
        flex: 1,
        borderTopWidth: 1,
        maxHeight: 35,
        borderTopColor: "rgb(222, 222,222)",
    },
    calendar: {
        minHeight: 35 * 6,
        width: "100%",
    },
    dayButton: {
        flex: 1,
        width: "100%",
        borderRadius: 30,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    selectedDayText: {
        fontWeight: "bold",
        color: "white",
    },
    notEmptyButton: {
        //backgroundColor: "rgb(242,79,59)",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    selectedDayButton: {
        //backgroundColor: "rgb(242,79,59)",
        backgroundColor: "black",
    },
    todayButton: {
        backgroundColor: "rgba(242,79,59, 0.6)",
    },
    todayAndSelectedButton: {
        backgroundColor: "rgb(242,79,59)",
    },
    futureButton: {
        backgroundColor: "#1f4598",
    },

    futureButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    monthRow: {
        height: 50,
        flexDirection: "row",
        width: "100%",
    },
    monthButton: {
        height: 30,
        flex: 1,
        margin: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    monthButtonText: {
        fontSize: 17,
        color: '#1f4598',
    },
    currentMonth: {
        flex: 1,
        fontSize: 17,
        fontWeight: "bold",
        textAlign: "center",
        color: '#1f4598',
    },
});
