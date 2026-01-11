import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const API_BASE_URL = 'http://192.168.1.30:8001/api'; // Use your machine's IP

export default function ScanQRScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <View style={styles.permissionCard}>
                    <View style={[styles.permissionIcon, { backgroundColor: colors.secondary }]}>
                        <Ionicons name="camera-outline" size={48} color={colors.mutedForeground} />
                    </View>
                    <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
                        Accès à la caméra requis
                    </Text>
                    <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
                        Pour scanner le QR code, nous avons besoin d'accéder à votre caméra.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={requestPermission}
                    >
                        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                            Autoriser la caméra
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelLink}
                        onPress={() => router.back()}
                    >
                        <Text style={[styles.cancelLinkText, { color: colors.mutedForeground }]}>
                            Annuler
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        try {
            // Check for Photo Session QR
            const photoMatch = data.match(/photo-sessions\/([A-Z0-9]+)\/mobile/i) || data.match(/mobile-upload\/([A-Za-z0-9-]+)/i);

            if (photoMatch) {
                const sessionCode = photoMatch[1];
                // Handle Photo Session...
                handlePhotoSession(sessionCode);
                return;
            }

            // Check for Machine QR (URL or Direct Code like GMAO-1-uuid)
            let machineCode = null;

            // Case 1: Full URL e.g. http://.../api/qr/GMAO-1-UUID
            const urlMatch = data.match(/\/api\/qr\/([A-Za-z0-9-]+)/i);
            if (urlMatch) {
                machineCode = urlMatch[1];
            } else if (data.startsWith('GMAO-')) {
                // Case 2: Direct Code
                machineCode = data;
            }

            if (machineCode) {
                // Route to Machine Details
                router.push({
                    pathname: '/machine/details',
                    params: { code: machineCode }
                });
                // Small delay to prevent immediate re-scan if they come back
                setTimeout(() => setScanned(false), 2000);
            } else {
                Alert.alert('QR Non Reconnu', 'Ce QR code ne correspond ni à une session photo ni à une machine.');
                setScanned(false);
            }

        } catch (error) {
            console.error('Error processing QR:', error);
            Alert.alert('Erreur', 'Impossible de traiter le code.');
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoSession = async (sessionCode: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/photo-sessions/${sessionCode}/mobile`);

            if (response.status === 410) {
                Alert.alert('Session expirée', 'Cette session photo a expiré.');
                setScanned(false);
                return;
            }

            if (!response.ok) throw new Error('Session not found');

            const session = await response.json();

            router.push({
                pathname: '/photo-capture',
                params: {
                    sessionCode: session.sessionCode,
                    entityType: session.entityType,
                    context: JSON.stringify(session.context),
                },
            });
        } catch (error) {
            console.error('Photo session error:', error);
            Alert.alert('Erreur', 'Impossible de rejoindre la session photo.');
            setScanned(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarcodeScanned}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Scan frame */}
            <View style={styles.overlay}>
                <View style={styles.scanFrameContainer}>
                    <View style={[styles.scanFrame, { borderColor: colors.primary }]}>
                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.instructions}>
                    <Text style={styles.instructionTitle}>Scanner le QR Code</Text>
                    <Text style={styles.instructionText}>
                        Pointez la caméra vers le QR code affiché sur l'écran
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 16,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrameContainer: {
        padding: 20,
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    instructions: {
        marginTop: 32,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    instructionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    permissionCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    permissionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    permissionText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginBottom: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    cancelLink: {
        padding: 8,
    },
    cancelLinkText: {
        fontSize: 14,
    },
});
