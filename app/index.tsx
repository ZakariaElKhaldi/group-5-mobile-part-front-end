import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="construct" size={20} color={colors.primaryForeground} />
                    </View>
                    <View>
                        <Text style={[styles.appTitle, { color: colors.foreground }]}>MaintenancePro</Text>
                        <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>GMAO Mobile</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Main Action Card */}
                <TouchableOpacity
                    style={[styles.mainCard, {
                        backgroundColor: colors.primary,
                        shadowColor: colors.foreground,
                    }]}
                    onPress={() => router.push('/scan-qr')}
                    activeOpacity={0.9}
                >
                    <View style={styles.mainCardContent}>
                        <View style={[styles.mainCardIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                            <Ionicons name="qr-code" size={32} color={colors.primaryForeground} />
                        </View>
                        <Text style={[styles.mainCardTitle, { color: colors.primaryForeground }]}>
                            Scanner un QR Code
                        </Text>
                        <Text style={[styles.mainCardDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                            Scannez le QR code du formulaire web pour prendre des photos
                        </Text>
                        <View style={[styles.mainCardButton, { backgroundColor: colors.background }]}>
                            <Text style={[styles.mainCardButtonText, { color: colors.foreground }]}>
                                Commencer
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color={colors.foreground} />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                        Comment ça marche
                    </Text>

                    {[
                        { step: '1', title: 'Ouvrez le formulaire', desc: 'Sur le web, créez un ordre de travail' },
                        { step: '2', title: 'Cliquez sur "Mobile"', desc: 'Un QR code sera affiché' },
                        { step: '3', title: 'Scannez et photographiez', desc: 'Les photos arrivent automatiquement' },
                    ].map((item, index) => (
                        <View
                            key={index}
                            style={[styles.stepCard, {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            }]}
                        >
                            <View style={[styles.stepNumber, { backgroundColor: colors.secondary }]}>
                                <Text style={[styles.stepNumberText, { color: colors.foreground }]}>
                                    {item.step}
                                </Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.stepDesc, { color: colors.mutedForeground }]}>
                                    {item.desc}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                        MaintenancePro © 2026
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    appSubtitle: {
        fontSize: 12,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    mainCard: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    mainCardContent: {
        padding: 24,
        alignItems: 'center',
    },
    mainCardIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    mainCardTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    mainCardDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    mainCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    mainCardButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    stepCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
        alignItems: 'center',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '600',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    stepDesc: {
        fontSize: 12,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 12,
    },
});
