import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;
    const subtitleFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(blob1Anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(blob2Anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
            ]),
            Animated.timing(subtitleFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace('MainApp');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Ambient glow blobs */}
            <Animated.View style={[styles.blob1, { opacity: blob1Anim }]} />
            <Animated.View style={[styles.blob2, { opacity: blob2Anim }]} />

            {/* Logo content */}
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Image 
                    source={require('../assets/icon.png')} 
                    style={styles.logoImage} 
                    resizeMode="contain"
                />
                <Text style={styles.logoText}>LyricMate</Text>
                <View style={styles.underlineRow}>
                    <View style={styles.underline} />
                </View>
            </Animated.View>

            <Animated.View style={[styles.footer, { opacity: subtitleFade }]}>
                <View style={styles.footerPill}>
                    <Text style={styles.footerText}>COLLECTION OF ISLAMIC SONGS</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F1020',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    // Ambient blobs
    blob1: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: 'rgba(79, 142, 247, 0.22)',
        top: -80,
        right: -60,
        transform: [{ scale: 1 }],
        // React Native doesn't support filter:blur natively, so we layer translucent circles
    },
    blob2: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(124, 111, 239, 0.18)',
        bottom: 40,
        left: -60,
    },

    content: {
        alignItems: 'center',
    },

    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 24,
        marginBottom: 24,
    },

    logoText: {
        fontSize: 44,
        fontWeight: '900',
        color: '#E8EDFF',
        letterSpacing: 1,
        marginBottom: 14,
    },

    underlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    underline: {
        width: 120,
        height: 3,
        backgroundColor: '#4F8EF7',
        borderRadius: 2,
        opacity: 0.8,
    },

    footer: {
        position: 'absolute',
        bottom: 56,
    },
    footerPill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    footerText: {
        color: 'rgba(232, 237, 255, 0.45)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 3,
    },
});