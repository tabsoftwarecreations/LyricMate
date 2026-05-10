import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { supabase } from './supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
    const { theme, toggleTheme, fontSize, updateFontSize, readingLanguage, updateReadingLanguage, colors } = useTheme();

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to permanently delete your account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            const { error } = await supabase.auth.admin.deleteUser(user.id);
                            if (error) Alert.alert("Error", error.message);
                            else {
                                await supabase.auth.signOut();
                                navigation.replace('Auth');
                            }
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: colors.primary }}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Lyrics Display</Text>

                <View style={styles.settingBlock}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: 10 }]}>Font Size ({fontSize})</Text>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={12}
                        maximumValue={40}
                        step={1}
                        value={fontSize}
                        onValueChange={updateFontSize}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={colors.primary}
                    />
                </View>

                <View style={styles.settingBlock}>
                    <Text style={[styles.label, { color: colors.text, marginBottom: 10 }]}>Preferred Language</Text>
                    <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Picker
                            selectedValue={readingLanguage}
                            onValueChange={updateReadingLanguage}
                            style={{ color: colors.text }}
                            dropdownIconColor={colors.primary}
                        >
                            <Picker.Item label="Original / English" value="English" />
                            <Picker.Item label="Transliteration" value="Transliteration" />
                        </Picker>
                    </View>
                    <Text style={[styles.helpText, { color: colors.secondaryText }]}>
                        Transliteration will be shown when available.
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Account</Text>

                <TouchableOpacity
                    style={[styles.dangerButton, { borderColor: '#EF4444' }]}
                    onPress={handleDeleteAccount}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.dangerButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
    settingBlock: { marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '600' },
    pickerContainer: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
    helpText: { fontSize: 12, marginTop: 5, fontStyle: 'italic' },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, marginTop: 10 },
    dangerButtonText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 10 }
});