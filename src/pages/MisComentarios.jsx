import React, { useState, useEffect, useContext } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ActivityIndicator, Platform, Modal
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const API_URL = "https://ximbapp.com/api";

const AVATARES = [
    { id: "camara", source: require("../assets/avatares/camara.png") },
    { id: "colibri", source: require("../assets/avatares/colibri.png") },
    { id: "elote", source: require("../assets/avatares/elote.png") },
    { id: "tepecoza", source: require("../assets/avatares/tepecoza.png") },
    { id: "xoloitzcuintle", source: require("../assets/avatares/xoloitzcuintle.png") },
    { id: "bicicleta", source: require("../assets/avatares/bicicleta.png") },
    { id: "brujula", source: require("../assets/avatares/brujula.png") },
];

const getAvatarSource = (avatarId) => {
    const av = AVATARES.find(a => a.id === avatarId);
    return av ? av.source : AVATARES[1].source;
};

const MisComentarios = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fotoZoom, setFotoZoom] = useState(null);
    const [miAvatarId, setMiAvatarId] = useState("colibri");
    const [miColorAvatar, setMiColorAvatar] = useState("#C9B3FF");

    useEffect(() => {
        cargarMisComentarios();
        cargarMiAvatar();
    }, []);

    const cargarMiAvatar = async () => {
        try {
            const avatar = await AsyncStorage.getItem('avatarSeleccionado');
            const color = await AsyncStorage.getItem('colorAvatar');
            if (avatar) setMiAvatarId(avatar);
            if (color) setMiColorAvatar(color);
        } catch (e) {}
    };

    const cargarMisComentarios = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/auth/mis-comentarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setComentarios(data.comentarios || []);
        } catch (error) {
            console.log("Error cargando mis comentarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Comentarios</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <ActivityIndicator color="#e6007e" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={comentarios}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialIcons name="chat-bubble-outline" size={60} color="rgba(230,0,126,0.3)" />
                            <Text style={styles.emptyText}>Aún no has comentado nada</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}
                            onPress={() => item.lugar && navigation.navigate("DetalleLugar", { lugar: item.lugar })}
                        >
                            <View style={styles.cardHeader}>
                                {/* Avatar del usuario */}
                                <View style={[styles.avatarMini, { backgroundColor: miColorAvatar }]}>
                                    <Image
                                        source={getAvatarSource(miAvatarId)}
                                        style={styles.avatarMiniImg}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.cardHeaderTexto}>
                                    <View style={styles.cardLugarRow}>
                                        <MaterialIcons name="place" size={14} color="#e6007e" />
                                        <Text style={styles.cardLugar} numberOfLines={1}>
                                            {item.lugar?.nombre || "Lugar eliminado"}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardFecha}>{formatFecha(item.createdAt)}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardComentario}>{item.comentario}</Text>
                            {item.fotos && item.fotos.length > 0 && (
                                <View style={styles.fotosRow}>
                                    {item.fotos.map((foto, index) => (
                                        <TouchableOpacity key={index} onPress={() => setFotoZoom(foto)}>
                                            <Image source={{ uri: foto }} style={styles.fotoMini} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Modal zoom foto */}
            <Modal visible={!!fotoZoom} transparent animationType="fade" onRequestClose={() => setFotoZoom(null)}>
                <View style={styles.modalZoom}>
                    <TouchableOpacity style={styles.modalCerrar} onPress={() => setFotoZoom(null)}>
                        <MaterialIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {fotoZoom && (
                        <Image source={{ uri: fotoZoom }} style={styles.fotoZoom} resizeMode="contain" />
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default MisComentarios;

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
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
        gap: 8,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatarMini: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#e6007e",
    },
    avatarMiniImg: {
        width: 26,
        height: 26,
    },
    cardHeaderTexto: {
        flex: 1,
        gap: 2,
    },
    cardLugarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardLugar: {
        flex: 1,
        fontSize: 13,
        fontWeight: "bold",
        color: "#e6007e",
    },
    cardFecha: {
        fontSize: 11,
        color: "rgba(230,0,126,0.6)",
    },
    cardComentario: {
        fontSize: 14,
        color: "#e6007e",
        lineHeight: 20,
    },
    fotosRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    fotoMini: {
        width: 70,
        height: 70,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
    },
    modalZoom: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCerrar: {
        position: "absolute",
        top: Platform.OS === "ios" ? 55 : 40,
        right: 20,
        zIndex: 10,
    },
    fotoZoom: {
        width: "100%",
        height: "80%",
    },
});