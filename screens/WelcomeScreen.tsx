import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    ScrollView,
} from 'react-native';

export default function WelcomeScreen({ navigation }: any) {
    const { width, height } = useWindowDimensions();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Logo Box - +1 */}
            <View
                style={[
                    styles.logoBox,
                    {
                        width: width * 0.25,
                        height: width * 0.25,
                    },
                ]}
            >
                <Text style={styles.logoText}>+1</Text>
            </View>

            {/* Population +1 Title */}
            <Text style={[styles.title, { fontSize: width * 0.08 }]}>Population +1</Text>

            {/* Tagline */}
            <Text style={[styles.tagline, { fontSize: width * 0.045 }]}>
                Welcome To The +1 Announcement Creator Studio where you are the creator of that special announcement. Create something that will certainly stand the test of time for the people in your life!
            </Text>

            {/* Welcome Text */}
            <Text style={[styles.welcomeText, { fontSize: width * 0.05, marginTop: height * 0.05 }]}>
                WELCOME TO THE +1 ANNOUNCEMENT APP CREATOR STUDIO
            </Text>

            {/* Tagline 2 */}
            <Text style={[styles.tagline2, { fontSize: width * 0.045, marginTop: height * 0.02 }]}>
                CREATE, EDUCATE, GIFT, REMINISCE
            </Text>

            {/* Question */}
            <Text style={[styles.question, { fontSize: width * 0.05, marginTop: height * 0.03 }]}>
                What are you creating today?
            </Text>

            {/* Button Group */}
            <View style={[styles.buttonGroup, { marginTop: height * 0.04 }]}>
                {/* Baby Announcement Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('BabyAnnouncement')}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonEmoji}>👶</Text>
                        <View style={styles.buttonText}>
                            <Text style={styles.buttonTitle}>+1 New Baby Announcement</Text>
                            <Text style={styles.buttonDescription}>
                                Welcome your +1 to friends & family with a custom announcement!
                            </Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                    </View>
                </TouchableOpacity>

                {/* Life Milestones Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('LifeMilestones')}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonEmoji}>🎉</Text>
                        <View style={styles.buttonText}>
                            <Text style={styles.buttonTitle}>Life Milestones</Text>
                            <Text style={styles.buttonDescription}>
                                Birthday, Sweet 16, Graduation, Anniversary & more!
                            </Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a472a',
    },
    contentContainer: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    logoBox: {
        backgroundColor: '#2d6a3f',
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 48,
    },
    title: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 12,
    },
    tagline: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    welcomeText: {
        color: '#fff',
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
    },
    tagline2: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: 1,
    },
    question: {
        color: '#fff',
        fontWeight: '700',
        textAlign: 'center',
    },
    buttonGroup: {
        width: '100%',
        gap: 16,
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    buttonEmoji: {
        fontSize: 40,
    },
    buttonText: {
        flex: 1,
    },
    buttonTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#333',
        marginBottom: 4,
    },
    buttonDescription: {
        fontSize: 13,
        color: '#666',
        fontWeight: '400',
        lineHeight: 18,
    },
    arrow: {
        fontSize: 24,
        color: '#1a472a',
        fontWeight: '900',
    },

