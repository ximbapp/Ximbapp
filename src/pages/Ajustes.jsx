import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Platform,
} from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

const Ajustes = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);

    const [idioma, setIdioma] = useState("Español");
    const [notificaciones, setNotificaciones] = useState(true);
    const [unidad, setUnidad] = useState("Kilómetros");

    const handleBorrarHistorial = () => {
        alert("Historial borrado (simulado)");
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
            <View style={styles.webWrapper}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>

                <Text style={styles.title}>Configuración</Text>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Modo Oscuro</Text>

                        <TouchableOpacity
                            style={[styles.option, themeMode === "auto" && styles.active]}
                            onPress={() => setThemeMode("auto")}
                        >
                            <MaterialIcons name="brightness-auto" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Automático</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, themeMode === "light" && styles.active]}
                            onPress={() => setThemeMode("light")}
                        >
                            <MaterialIcons name="light-mode" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Claro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, themeMode === "dark" && styles.active]}
                            onPress={() => setThemeMode("dark")}
                        >
                            <MaterialIcons name="dark-mode" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Oscuro</Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Idioma</Text>

                        <TouchableOpacity
                            style={[styles.option, idioma === "Español" && styles.active]}
                            onPress={() => setIdioma("Español")}
                        >
                            <MaterialIcons name="language" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Español</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, idioma === "Inglés" && styles.active]}
                            onPress={() => setIdioma("Inglés")}
                        >
                            <MaterialIcons name="language" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Inglés</Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Notificaciones</Text>

                        <View style={styles.switchRow}>
                            <View style={styles.switchLeft}>
                                <MaterialIcons name="notifications" size={22} color="#e6007e" />
                                <Text style={styles.optionText}>Activar notificaciones</Text>
                            </View>

                            <Switch
                                value={notificaciones}
                                onValueChange={setNotificaciones}
                                trackColor={{ false: "#ccc", true: "#e6007e" }}
                                thumbColor={"#fff"}
                            />
                        </View>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Unidades de longitud</Text>

                        <TouchableOpacity
                            style={[styles.option, unidad === "Kilómetros" && styles.active]}
                            onPress={() => setUnidad("Kilómetros")}
                        >
                            <MaterialIcons name="straighten" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Kilómetros</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, unidad === "Millas" && styles.active]}
                            onPress={() => setUnidad("Millas")}
                        >
                            <MaterialIcons name="straighten" size={22} color="#e6007e" />
                            <Text style={styles.optionText}>Millas</Text>
                        </TouchableOpacity>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Historial</Text>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleBorrarHistorial}
                        >
                            <MaterialIcons name="delete" size={22} color="#fff" />
                            <Text style={styles.deleteText}>Borrar historial</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </View>
    );
};

export default Ajustes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
    },

    webWrapper: {
        width: "100%",
        maxWidth: Platform.OS === "web" ? 650 : "100%",
    },

    scrollContainer: {
        paddingBottom: 40,
    },

    backButton: {
        position: "absolute",
        top: Platform.OS === "web" ? 15 : 45,
        left: 0,
        zIndex: 10,
        padding: 5,
    },

    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "center",
        marginTop: Platform.OS === "web" ? 15 : 45,
        marginBottom: 20,
    },

    card: {
        borderWidth: 1,
        borderColor: "#e6007e",
        borderRadius: 15,
        padding: 18,
        marginBottom: 18,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#e6007e",
        marginBottom: 15,
        textAlign: "center",
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 8,
    },

    optionText: {
        fontSize: 15,
        color: "#e6007e",
        fontWeight: "bold",
    },

    active: {
        backgroundColor: "rgba(230,0,126,0.2)",
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },

    switchLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#e6007e",
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 10,
    },

    deleteText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});