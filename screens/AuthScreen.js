import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image
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
    const [showPassword, setShowPassword] = useState(false);

    const handleAuthentication = async () => {
        if (!email || !password) { Alert.alert('Hold Up!', 'Please enter both email and password.'); return; }
        setLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) Alert.alert('Sign Up Error', error.message);
            else { Alert.alert('Welcome! 🎉', 'Your account has been created.'); navigation.goBack(); }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert('Login Error', error.message);
            else { Alert.alert('Welcome Back! 👋', 'Success.'); navigation.goBack(); }
        }
        setLoading(false);
    };

    const handleEmergencyClear = async () => {
        setLoading(true); setEmail(''); setPassword(''); setIsSignUp(false);
        await supabase.auth.signOut(); setLoading(false);
        Alert.alert("Cleared 🧹", "Your session has been completely wiped.");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <StatusBar style={theme === 'dark' ? "light" : "dark"} />

            {/* Ambient glow blobs */}
            <View style={[styles.blobA, { backgroundColor: colors.blobA }]} />
            <View style={[styles.blobB, { backgroundColor: colors.blobB }]} />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo + Heading */}
                <View style={styles.headerContainer}>
                    <Image 
                        source={require('../assets/icon.png')} 
                        style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 14 }} 
                    />
                    <Text style={[styles.appName, { color: colors.secondaryText }]}>LYRICMATE</Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        {isSignUp ? 'Join the LyricMate community.' : 'Sign in to manage your favourites.'}
                    </Text>
                </View>

                {/* Glass Form Card */}
                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                    {/* Email */}
                    <View style={[styles.inputWrapper, { borderBottomColor: colors.innerBorder }]}>
                        <View style={[styles.inputIconWrap, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="mail-outline" size={16} color={colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email address"
                            placeholderTextColor={colors.secondaryText}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <View style={[styles.inputIconWrap, { backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="lock-closed-outline" size={16} color={colors.primary} />
                        </View>
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.secondaryText}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={18}
                                color={colors.secondaryText}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Primary CTA */}
                <TouchableOpacity
                    style={[styles.authButton, { backgroundColor: colors.primary, shadowColor: colors.primaryGlow }]}
                    onPress={handleAuthentication}
                    disabled={loading}
                    activeOpacity={0.82}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.authButtonText}>{isSignUp ? 'Create Account' : 'Log In'}</Text>
                    }
                </TouchableOpacity>

                {/* Toggle */}
                <TouchableOpacity style={styles.toggleContainer} onPress={() => setIsSignUp(!isSignUp)}>
                    <Text style={[styles.toggleText, { color: colors.secondaryText }]}>
                        {isSignUp ? "Already have an account?  " : "Don't have an account?  "}
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </Text>
                    </Text>
                </TouchableOpacity>

                {/* Emergency clear */}
                <TouchableOpacity onPress={handleEmergencyClear} style={styles.clearButton}>
                    <Text style={[styles.clearButtonText, { color: colors.secondaryText }]}>
                        Having trouble? Clear Session
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    blobA: {
        position: 'absolute', width: 320, height: 320, borderRadius: 160,
        top: -80, right: -100, opacity: 0.50,
    },
    blobB: {
        position: 'absolute', width: 240, height: 240, borderRadius: 120,
        bottom: 60, left: -100, opacity: 0.40,
    },

    scrollContainer: {
        flexGrow: 1, justifyContent: 'center',
        paddingVertical: 56, paddingHorizontal: 24,
    },
    headerContainer: { alignItems: 'center', marginBottom: 36 },
    logoContainer: {
        width: 76, height: 76, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 18,
        shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
    },
    appName: { fontSize: 12, fontWeight: '700', letterSpacing: 3, marginBottom: 14 },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6, marginBottom: 8 },
    subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    // Form card
    formCard: {
        borderRadius: 22, borderWidth: 1, marginBottom: 16, overflow: 'hidden',
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 18, elevation: 6,
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 4,
        borderBottomWidth: 0.5,
    },
    inputIconWrap: {
        width: 30, height: 30, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    input: { flex: 1, paddingVertical: 17, fontSize: 15 },
    eyeBtn: { padding: 8 },

    // Buttons
    authButton: {
        paddingVertical: 17, borderRadius: 18, alignItems: 'center', marginBottom: 20,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
    },
    authButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    toggleContainer: { alignItems: 'center', marginBottom: 16 },
    toggleText: { fontSize: 14 },
    clearButton: { alignItems: 'center', paddingVertical: 4 },
    clearButtonText: { fontSize: 12, textDecorationLine: 'underline' },
});