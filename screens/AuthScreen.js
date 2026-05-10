import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { supabase } from './supabase';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';

export default function AuthScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // NEW: State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const handleAuthentication = async () => {
        if (!email || !password) {
            Alert.alert('Hold Up!', 'Please enter both an email and a password.');
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) Alert.alert('Sign Up Error', error.message);
            else {
                Alert.alert('Welcome! 🎉', 'Your account has been created.');
                navigation.goBack();
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert('Login Error', error.message);
            else {
                Alert.alert('Welcome Back! 👋', 'Success.');
                navigation.goBack();
            }
        }
        setLoading(false);
    };

    // --- EMERGENCY RESET ---
    const handleEmergencyClear = async () => {
        setLoading(true);
        setEmail('');
        setPassword('');
        setIsSignUp(false);

        // This forces Supabase to kill any corrupted ghost sessions
        await supabase.auth.signOut();

        setLoading(false);
        Alert.alert("Cleared 🧹", "Your session and text fields have been completely wiped.");
    };

    return (
        <KeyboardAvoidingView
            // FIX: Only apply keyboard behavior on mobile platforms. Ignore on web.
            behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* FIX: ScrollView ensures content never collapses on Web */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerContainer}>
                    <Ionicons name="person-circle" size={100} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        {isSignUp ? 'Join the community.' : 'Log in to manage your favorites.'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="mail-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email Address"
                            placeholderTextColor={colors.secondaryText}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="lock-closed-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.secondaryText}
                            value={password}
                            onChangeText={setPassword}
                            // NEW: Toggles based on the state
                            secureTextEntry={!showPassword}
                        />
                        {/* NEW: The Eye Icon Toggle Button */}
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color={colors.secondaryText}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.authButton, { backgroundColor: colors.primary }]}
                        onPress={handleAuthentication}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toggleContainer} onPress={() => setIsSignUp(!isSignUp)}>
                        {/* EMERGENCY RESET BUTTON */}
                        <TouchableOpacity
                            style={{ marginTop: 40, alignItems: 'center' }}
                            onPress={handleEmergencyClear}
                        >
                            <Text style={{ color: colors.secondaryText, fontSize: 14, textDecorationLine: 'underline' }}>
                                Having trouble? Clear Session
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.toggleText, { color: colors.primary }]}>
                            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 20
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 10
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 8
    },
    formContainer: {
        paddingHorizontal: 30
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15
    },
    inputIcon: {
        marginRight: 10
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16
    },
    eyeIcon: {
        padding: 10,
    },
    authButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 2px 3px rgba(0,0,0,0.1)',
            }
        })
    },
    authButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    toggleContainer: {
        marginTop: 25,
        alignItems: 'center'
    },
    toggleText: {
        fontSize: 16,
        fontWeight: '600'
    }
});