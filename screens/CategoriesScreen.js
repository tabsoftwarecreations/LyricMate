import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
    { id: '1', name: 'Malayalam', icon: 'leaf' },
    { id: '2', name: 'English', icon: 'earth' },
    { id: '3', name: 'Kannada', icon: 'map' },
    { id: '4', name: 'Urdu', icon: 'moon' },
    { id: '5', name: 'Mappila Patt', icon: 'musical-notes' },
    { id: '6', name: 'Mashup', icon: 'layers' },
];

export default function CategoriesScreen({ navigation }) {
    const { colors, theme } = useTheme();
    
    const renderCategory = ({ item }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Language', { categoryName: item.name })}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#065F46' : '#DCFCE7' }]}>
                <Ionicons name={item.icon} size={32} color={colors.primary} />
            </View>
            <Text style={[styles.cardText, { color: colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>Browse Categories</Text>
            </View>

            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    gridContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    card: {
        flex: 1,
        margin: 8,
        paddingVertical: 30,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        padding: 15,
        borderRadius: 50,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});