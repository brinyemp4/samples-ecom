import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"

export type BalanceParamList = {
    Balance: undefined,
    Payments: undefined,
    Deposits: undefined,
    LinkedAccounts: undefined,
    AddCard: undefined,
    AddBankAccount: undefined
}

export type BalanceNavProps<T extends keyof BalanceParamList> = {
    navigation: StackNavigationProp<BalanceParamList, T>,
    route: RouteProp<BalanceParamList, T>,
}