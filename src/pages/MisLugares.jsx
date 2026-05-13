import React, { useState, useEffect, useContext } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_URL = "http://157.230.63.10:3000/api";

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
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Lugares</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <ActivityIndicator color="#e6007e" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={lugares}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialIcons name="place" size={60} color="rgba(230,0,126,0.3)" />
                            <Text style={styles.emptyText}>Aún no has agregado lugares</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}
                            onPress={() => navigation.navigate("DetalleLugar", { lugar: item })}
                        >
                            {item.fotos && item.fotos.length > 0 ? (
                                <Image source={{ uri: item.fotos[0] }} style={styles.cardFoto} />
                            ) : (
                                <View style={[styles.cardFoto, styles.cardFotoEmpty]}>
                                    <MaterialIcons name="image-not-supported" size={30} color="rgba(230,0,126,0.4)" />
                                </View>
                            )}
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardNombre} numberOfLines={1}>{item.nombre}</Text>
                                <Text style={styles.cardCategoria}>{item.categoria}</Text>
                                <Text style={styles.cardLocalidad} numberOfLines={1}>
                                    <MaterialIcons name="place" size={12} color="rgba(230,0,126,0.7)" /> {item.localidad}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#e6007e" />
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
        borderBottomColor: "#e6007e",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6007e",
    },
    empty: {
        alignItems: "center",
        marginTop: 80,
        gap: 12,
    },
    emptyText: {
        color: "rgba(230,0,126,0.6)",
        fontSize: 15,
        fontWeight: "bold",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
        gap: 12,
    },
    cardFoto: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    cardFotoEmpty: {
        backgroundColor: "rgba(230,0,126,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    cardNombre: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#e6007e",
    },
    cardCategoria: {
        fontSize: 12,
        color: "rgba(230,0,126,0.7)",
        fontWeight: "bold",
    },
    cardLocalidad: {
        fontSize: 12,
        color: "rgba(230,0,126,0.6)",
    },
});