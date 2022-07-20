import React, { useContext, useState, useEffect } from "react"
import { StyleSheet, Text, ActivityIndicator, View } from "react-native";
import { createStackNavigator, HeaderBackButton } from "@react-navigation/stack";
import { AuthContext } from "../../providers/AuthProvider";
import { Header } from "../../components/Header";
import { hevieStyles, headerStyle, BRAND_COLORS } from "../../styles/HevieStyles";
import { Image } from "react-native-elements";
import { HeaderLogo } from "../../components/HeaderLogo";
import { BalanceParamList } from "./BalanceParamsList";
import { Balance } from "../../screens/settings/associate/balance/Balance";
import { LinkedAccounts } from "../../screens/settings/associate/balance/linkedAccounts/LinkedAccounts";
import { Payments } from "../../screens/settings/associate/balance/payments/Payments";
import { Deposits } from "../../screens/settings/associate/balance/deposits/Deposits";
import { AddBankAccount } from "../../screens/settings/associate/balance/linkedAccounts/AddBankAccount";
import { AddCard } from "../../screens/settings/associate/balance/linkedAccounts/AddCard";

interface BalanceNavigationProps {
}

const Stack = createStackNavigator<BalanceParamList>();
const ModalStack = createStackNavigator();

export const BalanceStack: React.FC<BalanceNavigationProps> = ({}) => {
    return (
        <Stack.Navigator
            screenOptions={{
                cardStyle: {backgroundColor: "white"},
                headerLeftContainerStyle: {paddingLeft: 20, paddingTop: 10},
                headerTitleContainerStyle: {alignItems: "center", width: "100%"},
                headerRightContainerStyle: {paddingRight: 20, paddingTop: 10},
            }}>
            <Stack.Screen
                name="Balance"
                options={{
                    title: "Balance",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={Balance}
            />

            <Stack.Screen
                name="Payments"
                options={{
                    title: "Payments",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={Payments}
            />

            <Stack.Screen
                name="Deposits"
                options={{
                    title: "Deposits",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={Deposits}
            />

            <Stack.Screen
                name="LinkedAccounts"
                options={{
                    title: "Linked Accounts",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={LinkedAccounts}
            />

            <Stack.Screen
                name="AddBankAccount"
                options={{
                    title: "Add Bank Account",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={AddBankAccount}
            />

            <Stack.Screen
                name="AddCard"
                options={{
                    title: "Add Card",
                    headerTitle: () => <HeaderLogo />,
                }}
                component={AddCard}
            />

        </Stack.Navigator>
    );
};