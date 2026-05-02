import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Our master list of categories and their icons
const CATEGORIES = [
    { id: '1', name: 'Malayalam', icon: 'leaf' },
    { id: '2', name: 'English', icon: 'earth' },
    { id: '3', name: 'Kannada', icon: 'map' },
    { id: '4', name: 'Urdu', icon: 'moon' },
    { id: '5', name: 'Mappila Patt', icon: 'musical-notes' },
    { id: '6', name: 'Mashup', icon: 'layers' },
];

export default function CategoriesScreen({ navigation }) {
    
    const renderCategory = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            // Notice we are passing categoryName instead of langName now!
            onPress={() => navigation.navigate('Language', { categoryName: item.name })}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={32} color="#166534" />
            </View>
            <Text style={styles.cardText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Browse Categories</Text>
            </View>

            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                numColumns={2} // Creates the beautiful 2-column grid
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
    },
    gridContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        margin: 8,
        paddingVertical: 30,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        backgroundColor: '#DCFCE7',
        padding: 15,
        borderRadius: 50,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    }
});