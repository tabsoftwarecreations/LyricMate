import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen({ navigation }) {
    // Built-in React Native animation values (100% stable)
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Run fade and scale at the same time
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4, // Bouncy effect
                useNativeDriver: true,
            })
        ]).start();

        // Navigate to the main app after 3 seconds
        const timer = setTimeout(() => {
            navigation.replace('MainApp');
        }, 3000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Ionicons name="musical-notes" size={100} color="#FFFFFF" />
                <Text style={styles.logoText}>LyricMate</Text>
                <View style={styles.underline} />
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>COLLECTIONS OF ISLAMIC MADH</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#166534',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
        marginTop: 20,
    },
    underline: {
        width: 150,
        height: 4,
        backgroundColor: '#F59E0B',
        marginTop: 10,
        borderRadius: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 3,
    }
});