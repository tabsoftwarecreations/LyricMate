import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
    { id: '1', name: 'Malayalam', type: 'text', icon: 'അ', accent: '#4F8EF7', accentBg: 'rgba(79,142,247,0.14)' },
    { id: '2', name: 'English', type: 'text', icon: 'A', accent: '#7C6FEF', accentBg: 'rgba(124,111,239,0.14)' },
    { id: '3', name: 'Kannada', type: 'text', icon: 'ಅ', accent: '#30D158', accentBg: 'rgba(48,209,88,0.13)' },
    { id: '4', name: 'Urdu', type: 'text', icon: 'ع', accent: '#FF5F7E', accentBg: 'rgba(255,95,126,0.13)' },
    { id: '5', name: 'Mappila Patt', type: 'text', icon: 'م', accent: '#FFB537', accentBg: 'rgba(255,181,55,0.13)' },
    { id: '6', name: 'Mashup', type: 'icon', icon: 'color-filter', accent: '#4F8EF7', accentBg: 'rgba(79,142,247,0.14)' },
];

export default function CategoriesScreen({ navigation }) {
    const { colors, theme } = useTheme();

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, {
                backgroundColor: colors.cardSolid,
                borderColor: colors.innerBorder,
            }]}
            activeOpacity={0.76}
            onPress={() => navigation.navigate('Language', { categoryName: item.name })}
        >
            {/* Accent glow spot */}
            <View style={[styles.glowSpot, { backgroundColor: item.accentBg }]} />

            <View style={[styles.iconContainer, { backgroundColor: item.accentBg }]}>
                {item.type === 'text' ? (
                    <Text style={[styles.iconText, { color: item.accent }]}>{item.icon}</Text>
                ) : (
                    <Ionicons name={item.icon} size={28} color={item.accent} />
                )}
            </View>

            <Text style={[styles.cardText, { color: colors.text }]}>{item.name}</Text>

            <View style={[styles.arrow, { backgroundColor: item.accentBg }]}>
                <Ionicons name="chevron-forward" size={12} color={item.accent} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.innerBorder }]}>
                <Text style={[styles.headerLabel, { color: colors.secondaryText }]}>Browse</Text>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>Categories</Text>
            </View>

            <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    header: {
        paddingTop: 54,
        paddingHorizontal: 22,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
    },
    headerLabel: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
    headerTitle: { fontSize: 30, fontWeight: '900', letterSpacing: -0.6 },

    gridContainer: { padding: 14, paddingBottom: 110 },
    row: { justifyContent: 'space-between' },

    card: {
        width: '48%',
        marginBottom: 12,
        paddingVertical: 28,
        paddingHorizontal: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 3,
        position: 'relative',
    },

    glowSpot: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        top: -30,
        right: -20,
        opacity: 0.5,
    },

    iconContainer: {
        width: 68,
        height: 68,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    iconText: {
        fontSize: 30,
        fontWeight: '900',
        textAlign: 'center',
        includeFontPadding: false,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: -0.2,
        textAlign: 'center',
        marginBottom: 10,
    },
    arrow: {
        width: 24,
        height: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});