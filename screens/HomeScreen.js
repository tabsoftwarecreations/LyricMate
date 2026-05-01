import{StatusBar} from  'expo-status-bar';
import{StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';

export default function HomeScreen({navigation}) {
    return (
        <View style={Styles.container}>
            <View style={Styles.titleRow}>
                <Ionicons name="book" size={36} color="#166534" />
                <Text style={Styles.title}>LyricMate</Text>
            </View>
            <Text style={Styles.subtitle}>Islamic Songs Collection</Text>
            <View style={Styles.cardContainer}>
                <TouchableOpacity
                style={Styles.card}
                onPress={() => navigation.navigate('Language', { langName: "English" })}>
                    <Text style={Styles.cardText}>English</Text>
                    </TouchableOpacity>

                <TouchableOpacity
                style={Styles.card}
                onPress={() => navigation.navigate('Language', { langName: "Malayalam" })}>
                    <Text style={Styles.cardText}>Malayalam</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                style={Styles.card}
                onPress={() => navigation.navigate('Language', { langName: "Urdu" })}>
                    <Text style={Styles.cardText}>Urdu</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                    style={Styles.card}
                    onPress={() => navigation.navigate('Language', { langName: 'Kannada' })}>
                    <Text style={Styles.cardText}>Kannada</Text>
                    </TouchableOpacity>
                    </View>

                    <StatusBar style="auto" />
                    <TouchableOpacity
                    style={Styles.uploadButton}
                    onPress={() => navigation.navigate('Upload')}>
                        <Ionicons name="add-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={Styles.uploadButtonText}>Add a New Song</Text>
                    </TouchableOpacity>
                    </View>
                    );
                }

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#166534',
    },
    subtitle: {
        fontSize: 18,
        color: '#4B5563',
        marginTop: 8,
    },
    cardContainer: {
        marginTop: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 15,
    },
    uploadButton: {
        marginTop: 30,
        backgroundColor: '#166534',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    }
});