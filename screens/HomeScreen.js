import{StatusBar} from  'expo-status-bar';
import{StyleSheet, Text, View, TouchableOpacity} from 'react-native';

export default function HomeScreen({navigation}) {
    return (
        <View style={Styles.container}>
            <Text style={Styles.title}>LyricMate</Text>
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
                    onPress={() => navigation.navigate('Language', { langName: 'Kannada' })}>
                    <Text style={Styles.cardText}>Kannada</Text>
                    </TouchableOpacity>
                    </View>

                    <StatusBar style="auto" />
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
        borderRadius: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#166534',
    },
});