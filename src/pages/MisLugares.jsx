import React, { useState, useEffect, useContext } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";
import { globalStyles, COLORS } from "../theme/styles";

const API_URL = "https://ximbapp.com/api";

const MisLugares = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [lugares, setLugares] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarMisLugares();
    }, []);

    const cargarMisLugares = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/lugares/mis-lugares`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setLugares(data.lugares || []);
        } catch (error) {
            console.log("Error cargando mis lugares:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Lugares</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={lugares}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={globalStyles.emptyContainer}>
                            <MaterialIcons name="place" size={60} color={COLORS.primaryMedium} />
                            <Text style={globalStyles.emptyText}>Aún no has agregado lugares</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}
                            onPress={() => navigation.navigate("DetalleLugar", { lugar: item })}
                        >
                            {item.fotos && item.fotos.length > 0 ? (
                                <Image source={{ uri: item.fotos[0] }} style={styles.cardFoto} />
                            ) : (
                                <View style={[styles.cardFoto, styles.cardFotoEmpty]}>
                                    <MaterialIcons name="image-not-supported" size={30} color={COLORS.primaryMedium} />
                                </View>
                            )}
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardNombre} numberOfLines={1}>{item.nombre}</Text>
                                <Text style={styles.cardCategoria}>{item.categoria}</Text>
                                <Text style={styles.cardLocalidad} numberOfLines={1}>
                                    <MaterialIcons name="place" size={12} color={COLORS.primaryFade} /> {item.localidad}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

export default MisLugares;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "ios" ? 50 : 40,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.primaryMedium,
        gap: 12,
    },
    cardFoto: { width: 70, height: 70, borderRadius: 10 },
    cardFotoEmpty: { backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
    cardInfo: { flex: 1, gap: 4 },
    cardNombre: { fontSize: 15, fontWeight: "bold", color: COLORS.primary },
    cardCategoria: { fontSize: 12, color: COLORS.primaryFade, fontWeight: "bold" },
    cardLocalidad: { fontSize: 12, color: COLORS.primaryFade },
});