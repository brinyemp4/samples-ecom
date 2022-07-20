import { useQuery } from "@apollo/react-hooks";
import React, { useEffect, useState } from "react"
import { StyleSheet, Text } from "react-native";
import { GetBalanceOnlyResponse, GET_BALANCE_ONLY } from "../api/balance/GetBalance";

interface AvailableBalanceProps {
    style?: Object
}

export const AvailableBalance: React.FC<AvailableBalanceProps> = ({style}) => {
    const getBalanceQuery = useQuery<GetBalanceOnlyResponse>(GET_BALANCE_ONLY, {
        fetchPolicy: "cache-and-network",
        pollInterval: 10000,
    });
    const [balance, setBalance] = useState<number>(0);
    
    useEffect(() => {
        if(getBalanceQuery.data?.balance?.available) {
            setBalance(getBalanceQuery.data.balance.available);
        }
    }, [getBalanceQuery.data?.balance?.available])
    
    return (<Text style={style}>{`$${balance.toFixed(2)}`}</Text>);
};