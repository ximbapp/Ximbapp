import React, { useEffect, useState, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Pressable,
} from "react-native";

import * as Location from "expo-location";
import { Fontisto, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const Home = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);

    const [location, setLocation] = useState({
        latitude: 19.4326,
        longitude: -99.1332,
    });

    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permiso de ubicación denegado");
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        };

        getLocation();
    }, []);

    const centerLocation = async () => {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
    };

    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setMenuVisible(false));
    };

    const handleEventos = () => alert("Eventos (pendiente)");
    const handleBuscar = () => alert("Buscar (pendiente)");

    const handlePerfil = () => {
        closeMenu();
        navigation.navigate("Perfil");
    };

    const handleAjustes = () => {
        closeMenu();
        navigation.navigate("Ajustes");
    };

    const handleLogout = () => {
        closeMenu();
        navigation.replace("Login");
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
            {/* MAPA OSM */}
            <View style={styles.mapContainer}>
                <iframe
                    title="OpenStreetMap"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    style={{
                        border: "0px",
                    }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01}%2C${location.latitude - 0.01}%2C${location.longitude + 0.01}%2C${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
                ></iframe>
            </View>

            {/* BOTÓN CENTRAR UBICACIÓN */}
            <TouchableOpacity style={styles.locationButton} onPress={centerLocation}>
                <MaterialIcons name="my-location" size={24} color="#fff" />
            </TouchableOpacity>

            {/* BARRA INFERIOR */}
            <View
                style={[
                    styles.bottomBar,
                    { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" },
                ]}
            >
                <TouchableOpacity style={styles.sideButton} onPress={handleEventos}>
                    <Entypo name="calendar" size={26} color="#e6007e" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.searchButton} onPress={handleBuscar}>
                    <Fontisto name="search" size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.sideButton} onPress={openMenu}>
                    <Fontisto name="nav-icon" size={26} color="#e6007e" />
                </TouchableOpacity>
            </View>

            {/* MENÚ LATERAL */}
            {menuVisible && (
                <Pressable style={styles.overlay} onPress={closeMenu}>
                    <Animated.View
                        style={[
                            styles.drawer,
                            {
                                backgroundColor: isDark ? "#0a0a0a" : "#fff",
                                transform: [{ translateX: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.drawerTitle}>Menú</Text>

                        <TouchableOpacity style={styles.drawerItem} onPress={handlePerfil}>
                            <MaterialIcons name="person" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Perfil</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.drawerItem} onPress={handleAjustes}>
                            <MaterialIcons name="settings" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Ajustes</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Tema</Text>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === "auto" && styles.themeOptionActive,
                            ]}
                            onPress={() => setThemeMode("auto")}
                        >
                            <MaterialIcons name="brightness-auto" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Automático</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === "light" && styles.themeOptionActive,
                            ]}
                            onPress={() => setThemeMode("light")}
                        >
                            <MaterialIcons name="light-mode" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Claro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                themeMode === "dark" && styles.themeOptionActive,
                            ]}
                            onPress={() => setThemeMode("dark")}
                        >
                            <MaterialIcons name="dark-mode" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Oscuro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <MaterialIcons name="logout" size={22} color="#fff" />
                            <Text style={styles.logoutText}>Cerrar sesión</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Pressable>
            )}
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapContainer: {
        flex: 1,
        width: "100%",
    },

    locationButton: {
        position: "absolute",
        right: 20,
        bottom: 95,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e6007e",
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },

    bottomBar: {
        height: 70,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 25,
        borderTopWidth: 1,
        borderTopColor: "#e6007e",
    },

    sideButton: {
        width: 80,
        alignItems: "center",
        justifyContent: "center",
    },

    searchButton: {
        width: 65,
        height: 65,
        borderRadius: 35,
        backgroundColor: "#e6007e",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
        elevation: 5,
    },

    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    drawer: {
        width: 260,
        height: "100%",
        padding: 20,
        borderLeftWidth: 2,
        borderLeftColor: "#e6007e",
    },

    drawerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6007e",
        marginBottom: 20,
        textAlign: "center",
    },

    drawerItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
    },

    drawerText: {
        fontSize: 15,
        color: "#e6007e",
        fontWeight: "bold",
    },

    sectionTitle: {
        marginTop: 15,
        fontSize: 14,
        fontWeight: "bold",
        color: "#e6007e",
    },

    themeOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
        marginTop: 8,
    },

    themeOptionActive: {
        backgroundColor: "rgba(230,0,126,0.2)",
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 30,
        backgroundColor: "#e6007e",
        paddingVertical: 12,
        borderRadius: 10,
    },

    logoutText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});