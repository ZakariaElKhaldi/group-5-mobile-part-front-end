import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const API_BASE_URL = 'http://192.168.1.30:8001/api'; // Ensure this matches scan-qr.tsx

export default function MachineDetailsScreen() {
    const { code } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [machine, setMachine] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (code) {
            fetchMachineDetails();
        }
    }, [code]);

    const fetchMachineDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/machines/qr/${code}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Machine introuvable');
                throw new Error('Erreur connexion serveur');
            }
            const data = await response.json();
            setMachine(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.mutedForeground }}>Chargement...</Text>
            </View>
        );
    }

    if (error || !machine) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background, padding: 20 }]}>
                <Ionicons name="alert-circle" size={48} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.foreground }]}>{error || 'Aucune donnée'}</Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
                    <Text style={{ color: colors.primaryForeground }}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                {machine.primaryImage ? (
                    <Image source={{ uri: machine.primaryImage }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: colors.muted }]}>
                        <Ionicons name="image-outline" size={48} color={colors.mutedForeground} />
                    </View>
                )}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.reference, { color: colors.primary }]}>{machine.reference}</Text>
                    <View style={[styles.statusBadge, {
                        backgroundColor: machine.statut === 'En service' ? '#dcfce7' : '#fee2e2'
                    }]}>
                        <Text style={[styles.statusText, {
                            color: machine.statut === 'En service' ? '#166534' : '#991b1b'
                        }]}>{machine.statut}</Text>
                    </View>
                </View>

                <Text style={[styles.model, { color: colors.foreground }]}>{machine.modele}</Text>
                <Text style={[styles.brand, { color: colors.mutedForeground }]}>{machine.marque}</Text>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Details Grid */}
                <View style={styles.grid}>
                    <DetailItem label="Numéro Série" value={machine.numeroSerie} colors={colors} />
                    <DetailItem label="Emplacement" value={machine.emplacement} colors={colors} />
                    <DetailItem label="Date Achat" value={machine.dateAcquisition ? new Date(machine.dateAcquisition).toLocaleDateString() : '-'} colors={colors} />
                    <DetailItem label="Année" value={machine.anneeFabrication} colors={colors} />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Actions (Placeholder for Tracking) */}
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Actions Rapides</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.foreground }]}>Historique</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="camera-outline" size={24} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.foreground }]}>Photo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

function DetailItem({ label, value, colors }: { label: string, value: string, colors: any }) {
    if (!value) return null;
    return (
        <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    errorText: { marginTop: 16, fontSize: 16, marginBottom: 24, textAlign: 'center' },
    button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    imageContainer: { height: 250, width: '100%', position: 'relative' },
    image: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    backButton: { position: 'absolute', top: 40, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    reference: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: '500' },
    model: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    brand: { fontSize: 16, marginBottom: 16 },
    divider: { height: 1, marginVertical: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    detailItem: { width: '45%', marginBottom: 12 },
    detailLabel: { fontSize: 12, marginBottom: 4 },
    detailValue: { fontSize: 14, fontWeight: '500' },
    sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionText: { fontSize: 14, fontWeight: '500' },
});
