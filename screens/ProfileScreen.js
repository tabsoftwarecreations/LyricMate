import React from "react";
import { StyleSheet, Text, View } from "react-native";
export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
    },
});