import { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const API_BASE_URL = 'http://192.168.1.30:8001/api'; // Use your machine's IP

export default function PhotoCaptureScreen() {
    const { sessionCode, entityType, context } = useLocalSearchParams<{
        sessionCode: string;
        entityType: string;
        context: string;
    }>();

    const router = useRouter();
    const cameraRef = useRef<any>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [photos, setPhotos] = useState<string[]>([]);
    const [capturing, setCapturing] = useState(false);
    const [uploading, setUploading] = useState(false);

    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const contextData = context ? JSON.parse(context) : {};
    const entityLabel = entityType === 'machine' ? 'Machine' : 'Ordre de travail';

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.permissionText, { color: colors.foreground }]}>
                    Accès caméra requis
                </Text>
                <TouchableOpacity
                    style={[styles.permButton, { backgroundColor: colors.primary }]}
                    onPress={requestPermission}
                >
                    <Text style={[styles.permButtonText, { color: colors.primaryForeground }]}>
                        Autoriser
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePhoto = async () => {
        if (!cameraRef.current || capturing) return;

        setCapturing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });
            setPhotos(prev => [...prev, photo.uri]);
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Erreur', 'Impossible de prendre la photo');
        } finally {
            setCapturing(false);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async () => {
        if (photos.length === 0) {
            Alert.alert('Aucune photo', 'Veuillez prendre au moins une photo');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();

            for (let i = 0; i < photos.length; i++) {
                let uri = photos[i];
                // Ensure file:// prefix for Android
                if (!uri.startsWith('file://')) {
                    uri = 'file://' + uri;
                }

                const filename = uri.split('/').pop() || `photo_${i}.jpg`;

                formData.append('images', {
                    uri,
                    name: filename,
                    type: 'image/jpeg',
                } as any);
            }

            console.log('Sending upload request to:', `${API_BASE_URL}/photo-sessions/${sessionCode}/images`);

            const response = await fetch(
                `${API_BASE_URL}/photo-sessions/${sessionCode}/images`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error('Upload failed with status:', response.status, text);
                try {
                    const error = JSON.parse(text);
                    throw new Error(error.error || `Upload failed: ${response.status}`);
                } catch (e) {
                    throw new Error(`Upload failed: ${response.status} ${text.substring(0, 50)}`);
                }
            }

            const result = await response.json();

            Alert.alert(
                'Succès !',
                `${result.count} photo(s) envoyée(s). Les photos apparaîtront sur le formulaire web.`,
                [{ text: 'OK', onPress: () => router.replace('/') }]
            );
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Erreur', `Impossible d'envoyer les photos: ${error.message || 'Erreur réseau'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                borderBottomColor: colors.border,
            }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.foreground }]}>{entityLabel}</Text>
                    {contextData.machineName && (
                        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                            {contextData.machineName}
                        </Text>
                    )}
                </View>
                <View style={styles.photoCounter}>
                    <Text style={[styles.photoCountText, { color: colors.primary }]}>
                        {photos.length}/5
                    </Text>
                </View>
            </View>

            {/* Camera */}
            <View style={styles.cameraContainer}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                />

                {/* Capture button */}
                <TouchableOpacity
                    style={[styles.captureButton, {
                        borderColor: colors.primary,
                        opacity: capturing ? 0.7 : 1,
                    }]}
                    onPress={takePhoto}
                    disabled={capturing || photos.length >= 5}
                >
                    {capturing ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <View style={[styles.captureInner, { backgroundColor: colors.primary }]} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Photo preview strip */}
            <View style={[styles.previewContainer, {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
            }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {photos.map((uri, index) => (
                        <View key={index} style={styles.photoWrapper}>
                            <Image source={{ uri }} style={styles.photoThumb} />
                            <TouchableOpacity
                                style={[styles.removeButton, { backgroundColor: colors.destructive }]}
                                onPress={() => removePhoto(index)}
                            >
                                <Ionicons name="close" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {photos.length === 0 && (
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            Aucune photo. Appuyez sur le bouton pour photographier.
                        </Text>
                    )}
                </ScrollView>
            </View>

            {/* Upload button */}
            <View style={[styles.footer, {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 16,
            }]}>
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        {
                            backgroundColor: photos.length > 0 && !uploading
                                ? colors.primary
                                : colors.muted,
                        }
                    ]}
                    onPress={uploadPhotos}
                    disabled={photos.length === 0 || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                        <>
                            <Ionicons
                                name="cloud-upload"
                                size={20}
                                color={photos.length > 0 ? colors.primaryForeground : colors.mutedForeground}
                            />
                            <Text style={[styles.uploadButtonText, {
                                color: photos.length > 0 ? colors.primaryForeground : colors.mutedForeground,
                            }]}>
                                Envoyer {photos.length > 0 ? `(${photos.length})` : ''}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
    },
    photoCounter: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    photoCountText: {
        fontSize: 14,
        fontWeight: '600',
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    captureButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    captureInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    previewContainer: {
        padding: 12,
        borderTopWidth: 1,
        minHeight: 100,
    },
    photoWrapper: {
        marginRight: 12,
        position: 'relative',
    },
    photoThumb: {
        width: 72,
        height: 72,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 12,
        fontStyle: 'italic',
        paddingVertical: 24,
    },
    footer: {
        padding: 16,
    },
    uploadButton: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    permissionText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    permButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    permButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
