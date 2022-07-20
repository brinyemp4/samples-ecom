import React from "react"
import { StyleSheet, Text, View } from "react-native";
import { hevieStyles } from "../styles/HevieStyles";

interface ContainerProps {
    style?: Object
}

export const Container: React.FC<ContainerProps> = ({children, style}) => {
    return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20
    },
});