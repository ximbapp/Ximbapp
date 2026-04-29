import React, { useEffect, useState, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Pressable,
    Modal,
    TextInput,
    ScrollView,
} from "react-native";

import MapView, { UrlTile, Marker } from "react-native-maps";
import * as Location from "expo-location";

import { Fontisto, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";

const Home = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);

    const mapRef = useRef(null);

    const [location, setLocation] = useState({
        latitude: 19.4326,
        longitude: -99.1332,
    });

    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [eventModalVisible, setEventModalVisible] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [selectedPlace, setSelectedPlace] = useState(null);

    const categorias = [
        "Historia/Cultura",
        "Religioso",
        "Centros Recreativos",
        "Eventos",
        "Gastronomía",
        "Aventura",
    ];

    const lugaresEjemplo = [
        {
            id: 1,
            nombre: "Museo Nacional",
            categoria: "Historia/Cultura",
            descripcion: "Museo con exposiciones históricas.",
            latitude: 19.4352,
            longitude: -99.1412,
        },
        {
            id: 2,
            nombre: "Catedral Metropolitana",
            categoria: "Religioso",
            descripcion: "Uno de los lugares más icónicos.",
            latitude: 19.4331,
            longitude: -99.1339,
        },
        {
            id: 3,
            nombre: "Parque Chapultepec",
            categoria: "Centros Recreativos",
            descripcion: "Un parque enorme para caminar y pasear.",
            latitude: 19.4204,
            longitude: -99.1819,
        },
        {
            id: 4,
            nombre: "Festival Cultural",
            categoria: "Eventos",
            descripcion: "Evento cultural con música y arte.",
            latitude: 19.4285,
            longitude: -99.135,
        },
        {
            id: 5,
            nombre: "Tacos El Güero",
            categoria: "Gastronomía",
            descripcion: "Tacos tradicionales mexicanos.",
            latitude: 19.4347,
            longitude: -99.1298,
        },
        {
            id: 6,
            nombre: "Sendero Bosque",
            categoria: "Aventura",
            descripcion: "Ruta ideal para senderismo y aventura.",
            latitude: 19.4108,
            longitude: -99.2,
        },
    ];

    // EVENTOS DE EJEMPLO (IMPORTANTE: deben tener lat/lng)
    const eventosEjemplo = [
        {
            id: 1,
            nombre: "Concierto en el Zócalo",
            descripcion: "Evento musical gratuito en el centro.",
            fecha: "28/04/2026 - 8:00 PM",
            latitude: 19.4329,
            longitude: -99.1333,
        },
        {
            id: 2,
            nombre: "Expo Cultura",
            descripcion: "Exposición cultural y artesanal.",
            fecha: "30/04/2026 - 12:00 PM",
            latitude: 19.4255,
            longitude: -99.1452,
        },
        {
            id: 3,
            nombre: "Feria Gastronómica",
            descripcion: "Comida típica mexicana y bebidas.",
            fecha: "02/05/2026 - 2:00 PM",
            latitude: 19.4172,
            longitude: -99.167,
        },
        {
            id: 4,
            nombre: "Carrera Recreativa",
            descripcion: "Evento deportivo en Chapultepec.",
            fecha: "03/05/2026 - 7:00 AM",
            latitude: 19.4204,
            longitude: -99.1819,
        },
    ];

    // FUNCIÓN PARA CALCULAR DISTANCIA EN KM (Haversine)
    const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // radio tierra km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        let subscription;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Permiso de ubicación denegado");
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 2,
                },
                (loc) => {
                    setLocation({
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    });
                }
            );
        };

        startTracking();

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    const centerLocation = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
    };

    const centerToPlace = (place) => {
        setSelectedPlace(place);

        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: place.latitude,
                    longitude: place.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }

        setSearchModalVisible(false);
    };

    const centerToEvent = (event) => {
        setSelectedPlace(event);

        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: event.latitude,
                    longitude: event.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }

        setEventModalVisible(false);
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

    const handleEventos = () => {
        setEventModalVisible(true);
    };

    const handleBuscar = () => {
        setSearchModalVisible(true);
    };

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

    const resultadosFiltrados = lugaresEjemplo.filter((lugar) => {
        const coincideTexto =
            searchText.trim() === "" ||
            lugar.nombre.toLowerCase().includes(searchText.toLowerCase());

        const coincideCategoria =
            selectedCategory === "" || lugar.categoria === selectedCategory;

        return coincideTexto && coincideCategoria;
    });

    const eventosOrdenados = eventosEjemplo
        .map((evento) => {
            const distancia = calcularDistanciaKm(
                location.latitude,
                location.longitude,
                evento.latitude,
                evento.longitude
            );

            return {
                ...evento,
                distancia,
            };
        })
        .sort((a, b) => a.distancia - b.distancia);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType="none"
                showsUserLocation={true}
                showsMyLocationButton={false}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <UrlTile
                    urlTemplate={
                        isDark
                            ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                            : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    }
                    maximumZ={19}
                />

                {selectedPlace ? (
                    <Marker
                        coordinate={{
                            latitude: selectedPlace.latitude,
                            longitude: selectedPlace.longitude,
                        }}
                        title={selectedPlace.nombre}
                        description={selectedPlace.descripcion}
                    />
                ) : null}
            </MapView>

            <TouchableOpacity style={styles.locationButton} onPress={centerLocation}>
                <MaterialIcons name="my-location" size={24} color="#fff" />
            </TouchableOpacity>

            <View
                style={[
                    styles.bottomBar,
                    { backgroundColor: isDark ? "#3A3A46" : "#ffffff" },
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

            {/* MODAL BUSCAR */}
            <Modal
                visible={searchModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setSearchModalVisible(false)}
                >
                    <Pressable
                        style={[
                            styles.modalContent,
                            { backgroundColor: isDark ? "#3A3A46" : "#fff" },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Buscar</Text>

                            <TouchableOpacity
                                onPress={() => setSearchModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[
                                    styles.searchInput,
                                    {
                                        backgroundColor: isDark
                                            ? "#2C2C36"
                                            : "#f5f5f5",
                                        color: "#e6007e",
                                    },
                                ]}
                                placeholder="Escribe lo que buscas..."
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={searchText}
                                onChangeText={setSearchText}
                            />

                            {searchText.trim() !== "" ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setSearchText("")}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={20}
                                        color="#e6007e"
                                    />
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <Text style={styles.modalSubtitle}>Categoría</Text>

                        <View
                            style={[
                                styles.selectContainer,
                                { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" },
                            ]}
                        >
                            <Picker
                                selectedValue={selectedCategory}
                                onValueChange={(itemValue) =>
                                    setSelectedCategory(itemValue)
                                }
                                style={{ color: "#e6007e" }}
                                dropdownIconColor="#e6007e"
                            >
                                <Picker.Item label="Todas las categorías" value="" />
                                {categorias.map((cat) => (
                                    <Picker.Item key={cat} label={cat} value={cat} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.modalSubtitle}>Resultados</Text>

                        <ScrollView
                            style={{ maxHeight: 260 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {resultadosFiltrados.length === 0 ? (
                                <Text style={styles.noResults}>
                                    No se encontraron resultados
                                </Text>
                            ) : (
                                resultadosFiltrados.map((lugar) => (
                                    <TouchableOpacity
                                        key={lugar.id}
                                        style={[
                                            styles.resultCard,
                                            {
                                                backgroundColor: isDark
                                                    ? "#2C2C36"
                                                    : "#f5f5f5",
                                            },
                                        ]}
                                        onPress={() => centerToPlace(lugar)}
                                    >
                                        <Text style={styles.resultTitle}>
                                            {lugar.nombre}
                                        </Text>
                                        <Text style={styles.resultCategory}>
                                            {lugar.categoria}
                                        </Text>
                                        <Text style={styles.resultDesc}>
                                            {lugar.descripcion}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL EVENTOS CERCANOS */}
            <Modal
                visible={eventModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEventModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setEventModalVisible(false)}
                >
                    <Pressable
                        style={[
                            styles.modalContent,
                            { backgroundColor: isDark ? "#3A3A46" : "#fff" },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Eventos cercanos</Text>

                            <TouchableOpacity
                                onPress={() => setEventModalVisible(false)}
                            >
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ maxHeight: 330 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {eventosOrdenados.map((evento) => (
                                <TouchableOpacity
                                    key={evento.id}
                                    style={[
                                        styles.resultCard,
                                        {
                                            backgroundColor: isDark
                                                ? "#2C2C36"
                                                : "#f5f5f5",
                                        },
                                    ]}
                                    onPress={() => centerToEvent(evento)}
                                >
                                    <Text style={styles.resultTitle}>
                                        {evento.nombre}
                                    </Text>

                                    <Text style={styles.resultCategory}>
                                        {evento.fecha}
                                    </Text>

                                    <Text style={styles.resultDesc}>
                                        {evento.descripcion}
                                    </Text>

                                    <Text style={styles.distanceText}>
                                        Aprox. {evento.distancia.toFixed(2)} km
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MENÚ */}
            {menuVisible && (
                <Pressable style={styles.overlay} onPress={closeMenu}>
                    <Animated.View
                        style={[
                            styles.drawer,
                            {
                                backgroundColor: isDark ? "#3A3A46" : "#fff",
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
    map: {
        flex: 1,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#e6007e",
        padding: 18,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6007e",
    },
    modalSubtitle: {
        marginTop: 15,
        fontSize: 14,
        fontWeight: "bold",
        color: "#e6007e",
        marginBottom: 8,
    },
    inputWrapper: {
        position: "relative",
    },
    searchInput: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#e6007e",
        paddingRight: 40,
    },
    clearButton: {
        position: "absolute",
        right: 10,
        top: 12,
    },
    selectContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e6007e",
        overflow: "hidden",
    },
    resultCard: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.5)",
        marginBottom: 10,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#e6007e",
    },
    resultCategory: {
        fontSize: 12,
        fontWeight: "bold",
        color: "rgba(230,0,126,0.8)",
        marginTop: 3,
    },
    resultDesc: {
        fontSize: 13,
        color: "#e6007e",
        marginTop: 6,
    },
    noResults: {
        textAlign: "center",
        marginTop: 20,
        color: "#e6007e",
        fontWeight: "bold",
    },
    distanceText: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "right",
    },
});