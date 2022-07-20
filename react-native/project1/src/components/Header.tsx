import React from "react"
import { StyleSheet, Text, SafeAreaView, Image, View } from "react-native";
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { hevieStyles } from "../styles/HevieStyles";

interface HeaderProps {

}

export const Header: React.FC<HeaderProps> = ({}) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.buttonContainer, styles.leftButton]}>
                <Text style={[hevieStyles.bodyText, styles.title]}></Text>
            </View>
            <Image style={styles.logo} source={require("../../assets/logo.png")} />
            <View style={[styles.buttonContainer, styles.rightButton]}>
                <Ionicons  name="ios-menu" size={24} color="black" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "nowrap",
        backgroundColor: "white"
    },
    title: {
        width: "33%",
        borderWidth: 0,
        marginLeft: 8,
        fontWeight: "600"
    },
    logo: {
        width: "33%",
        zIndex: 10,
        position: "relative",
        borderWidth: 0,
        height: 40,
        resizeMode: "contain",
    },
    buttonContainer: {
        padding: 20,
    },
    rightButton: {
    },
    leftButton: {
    }
});