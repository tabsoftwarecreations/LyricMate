import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from './supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [token, setToken] = useState('');

    // Function 1: Ask Supabase to send the email
    const sendOTP = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setOtpSent(true);
            Alert.alert('Check your inbox!', 'We sent a 6-digit code to your email.');
        }
    };

    // Function 2: Verify the code the user typed in
    const verifyOTP = async () => {
        if (!token) {
            Alert.alert('Error', 'Please enter the 6-digit code sent to your email.');
            return;
        }
        setLoading(true);
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: token,
            type: 'email',
        });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else if (data.session) {
            // Send them to the Upload Screen once verified!
            navigation.replace('Upload'); 
        }
    };

   return (
        <View style={styles.container}>
            <Ionicons name="shield-checkmark" size={60} color="#166534" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>Creator Login</Text>
            <Text style={styles.subtitle}>Verify your email to upload new songs</Text>

            {!otpSent ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={(text) => setEmail(text.trim())}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity style={styles.button} onPress={sendOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Code</Text>}
                    </TouchableOpacity>
                    
                    {/* Failsafe to jump to the code box */}
                    <TouchableOpacity onPress={() => setOtpSent(true)} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#166534', fontWeight: 'bold' }}>Already have a code?</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        value={token}
                        onChangeText={setToken}
                        keyboardType="number-pad"
                    />
                    <TouchableOpacity style={styles.button} onPress={verifyOTP} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
                    </TouchableOpacity>

                    {/* Failsafe to go back to the email box */}
                    <TouchableOpacity onPress={() => setOtpSent(false)} style={{ marginTop: 20 }}>
                        <Text style={{ color: '#4B5563' }}>Wait, I need a new code</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        backgroundColor: '#166534',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});