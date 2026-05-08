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
    ActivityIndicator,
    Image,
} from "react-native";

import MapView, { UrlTile, Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Fontisto, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";

const API_URL = "http://157.230.63.10:3000/api";

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
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [addLugarModalVisible, setAddLugarModalVisible] = useState(false);
    const [addEventoModalVisible, setAddEventoModalVisible] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [coordsSeleccionadas, setCoordsSeleccionadas] = useState(null);

    const [lugares, setLugares] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loadingLugares, setLoadingLugares] = useState(true);

    // Formulario lugar
    const [lugarNombre, setLugarNombre] = useState("");
    const [lugarLocalidad, setLugarLocalidad] = useState("");
    const [lugarCategoria, setLugarCategoria] = useState("");
    const [lugarHorario, setLugarHorario] = useState("");
    const [lugarDescripcion, setLugarDescripcion] = useState("");
    const [lugarFotos, setLugarFotos] = useState([]);
    const [savingLugar, setSavingLugar] = useState(false);

    // Formulario evento
    const [eventoNombre, setEventoNombre] = useState("");
    const [eventoFechaInicio, setEventoFechaInicio] = useState("");
    const [eventoFechaFinal, setEventoFechaFinal] = useState("");
    const [eventoCostos, setEventoCostos] = useState("");
    const [eventoDescripcion, setEventoDescripcion] = useState("");
    const [eventoLugarId, setEventoLugarId] = useState("");
    const [savingEvento, setSavingEvento] = useState(false);

    const categorias = [
        "Historia/Cultura",
        "Religioso",
        "Centros Recreativos",
        "Eventos",
        "Gastronomía",
        "Aventura",
    ];

    const cargarDatos = async () => {
        try {
            setLoadingLugares(true);
            const [resLugares, resEventos] = await Promise.all([
                fetch(`${API_URL}/lugares`),
                fetch(`${API_URL}/eventos`),
            ]);
            const dataLugares = await resLugares.json();
            const dataEventos = await resEventos.json();
            setLugares(dataLugares.lugares || []);
            setEventos(dataEventos.eventos || []);
        } catch (error) {
            console.log("Error cargando datos:", error);
        } finally {
            setLoadingLugares(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
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
        return () => { if (subscription) subscription.remove(); };
    }, []);

    const handleLongPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoordsSeleccionadas({ latitude, longitude });
        setAddModalVisible(true);
    };

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
                    latitude: place.coordenadas.latitud,
                    longitude: place.coordenadas.longitud,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
        setSearchModalVisible(false);
    };

    const centerToEvent = (event) => {
        if (event.lugar?.coordenadas) {
            setSelectedPlace({
                nombre: event.nombre,
                descripcion: event.descripcion,
                coordenadas: event.lugar.coordenadas,
            });
            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    {
                        latitude: event.lugar.coordenadas.latitud,
                        longitude: event.lugar.coordenadas.longitud,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    600
                );
            }
        }
        setEventModalVisible(false);
    };

    const seleccionarFotos = async () => {
        if (lugarFotos.length >= 3) {
            alert("Máximo 3 fotos");
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Necesitamos permiso para acceder a tus fotos");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3 - lugarFotos.length,
            quality: 0.7,
        });
        if (!result.canceled) {
            setLugarFotos([...lugarFotos, ...result.assets]);
        }
    };

    const handleGuardarLugar = async () => {
        if (!lugarNombre || !lugarLocalidad || !lugarCategoria) {
            alert("Nombre, localidad y categoría son obligatorios");
            return;
        }
        try {
            setSavingLugar(true);
            const token = await AsyncStorage.getItem("token");

            const formData = new FormData();
            formData.append("nombre", lugarNombre);
            formData.append("localidad", lugarLocalidad);
            formData.append("categoria", lugarCategoria);
            formData.append("horario", lugarHorario);
            formData.append("descripcion", lugarDescripcion);
            formData.append("coordenadas", JSON.stringify({
                latitud: coordsSeleccionadas.latitude,
                longitud: coordsSeleccionadas.longitude,
            }));

            lugarFotos.forEach((foto, index) => {
                formData.append("fotos", {
                    uri: foto.uri,
                    type: "image/jpeg",
                    name: `foto_${index}.jpg`,
                });
            });

            const response = await fetch(`${API_URL}/lugares`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Lugar creado correctamente!");
                setAddLugarModalVisible(false);
                setLugarNombre("");
                setLugarLocalidad("");
                setLugarCategoria("");
                setLugarHorario("");
                setLugarDescripcion("");
                setLugarFotos([]);
                cargarDatos();
            } else {
                alert(data.mensaje);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setSavingLugar(false);
        }
    };

    const handleGuardarEvento = async () => {
        if (!eventoNombre || !eventoFechaInicio || !eventoFechaFinal || !eventoLugarId) {
            alert("Nombre, fechas y lugar son obligatorios");
            return;
        }
        try {
            setSavingEvento(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/eventos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre: eventoNombre,
                    fechaInicio: eventoFechaInicio,
                    fechaFinal: eventoFechaFinal,
                    costos: eventoCostos ? parseFloat(eventoCostos) : 0,
                    descripcion: eventoDescripcion,
                    lugar: eventoLugarId,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                alert("¡Evento creado correctamente!");
                setAddEventoModalVisible(false);
                setEventoNombre("");
                setEventoFechaInicio("");
                setEventoFechaFinal("");
                setEventoCostos("");
                setEventoDescripcion("");
                setEventoLugarId("");
                cargarDatos();
            } else {
                alert(data.mensaje);
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setSavingEvento(false);
        }
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

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("usuario");
        closeMenu();
        navigation.replace("Login");
    };

    const resultadosFiltrados = lugares.filter((lugar) => {
        const coincideTexto =
            searchText.trim() === "" ||
            lugar.nombre.toLowerCase().includes(searchText.toLowerCase());
        const coincideCategoria =
            selectedCategory === "" || lugar.categoria === selectedCategory;
        return coincideTexto && coincideCategoria;
    });

    const eventosOrdenados = eventos
        .filter((e) => e.lugar?.coordenadas)
        .map((evento) => {
            const distancia = calcularDistanciaKm(
                location.latitude,
                location.longitude,
                evento.lugar.coordenadas.latitud,
                evento.lugar.coordenadas.longitud
            );
            return { ...evento, distancia };
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
                onLongPress={handleLongPress}
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

                {/* ✅ MARKERS DE LUGARES — con onPress para navegar al detalle */}
                {lugares.map((lugar) => (
                    <Marker
                        key={lugar._id}
                        coordinate={{
                            latitude: lugar.coordenadas.latitud,
                            longitude: lugar.coordenadas.longitud,
                        }}
                        title={lugar.nombre}
                        description={lugar.descripcion}
                        pinColor="#e6007e"
                        onPress={() => navigation.navigate("DetalleLugar", { lugar })}
                    />
                ))}

                {selectedPlace && (
                    <Marker
                        coordinate={{
                            latitude: selectedPlace.coordenadas.latitud,
                            longitude: selectedPlace.coordenadas.longitud,
                        }}
                        title={selectedPlace.nombre}
                        description={selectedPlace.descripcion}
                    />
                )}

                {coordsSeleccionadas && (
                    <Marker
                        coordinate={coordsSeleccionadas}
                        pinColor="#ff6600"
                        title="Nueva ubicación"
                    />
                )}
            </MapView>

            <TouchableOpacity style={styles.locationButton} onPress={centerLocation}>
                <MaterialIcons name="my-location" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={[styles.bottomBar, { backgroundColor: isDark ? "#3A3A46" : "#ffffff" }]}>
                <TouchableOpacity style={styles.sideButton} onPress={() => setEventModalVisible(true)}>
                    <Entypo name="calendar" size={26} color="#e6007e" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchModalVisible(true)}>
                    <Fontisto name="search" size={26} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideButton} onPress={openMenu}>
                    <Fontisto name="nav-icon" size={26} color="#e6007e" />
                </TouchableOpacity>
            </View>

            {/* MODAL — Elegir Lugar o Evento */}
            <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setAddModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <Text style={styles.modalTitle}>¿Qué deseas agregar?</Text>
                        <Text style={styles.coordsText}>
                            📍 {coordsSeleccionadas?.latitude.toFixed(5)}, {coordsSeleccionadas?.longitude.toFixed(5)}
                        </Text>
                        <TouchableOpacity
                            style={styles.addOptionButton}
                            onPress={() => { setAddModalVisible(false); setAddLugarModalVisible(true); }}
                        >
                            <MaterialIcons name="place" size={24} color="#fff" />
                            <Text style={styles.addOptionText}>Agregar Lugar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.addOptionButton, { backgroundColor: "#ff6600" }]}
                            onPress={() => { setAddModalVisible(false); setAddEventoModalVisible(true); }}
                        >
                            <Entypo name="calendar" size={24} color="#fff" />
                            <Text style={styles.addOptionText}>Agregar Evento</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL — Formulario Lugar */}
            <Modal visible={addLugarModalVisible} transparent animationType="slide" onRequestClose={() => setAddLugarModalVisible(false)}>
                <Pressable style={styles.modalOverlay}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nuevo Lugar</Text>
                            <TouchableOpacity onPress={() => setAddLugarModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Nombre del lugar"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={lugarNombre}
                                onChangeText={setLugarNombre}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Localidad"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={lugarLocalidad}
                                onChangeText={setLugarLocalidad}
                            />
                            <View style={[styles.selectContainer, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                                <Picker
                                    selectedValue={lugarCategoria}
                                    onValueChange={setLugarCategoria}
                                    style={{ color: "#e6007e" }}
                                    dropdownIconColor="#e6007e"
                                >
                                    <Picker.Item label="Selecciona categoría" value="" />
                                    {categorias.map((cat) => (
                                        <Picker.Item key={cat} label={cat} value={cat} />
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Horario (ej: 8:00 AM - 8:00 PM)"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={lugarHorario}
                                onChangeText={setLugarHorario}
                            />
                            <TextInput
                                style={[styles.input, styles.inputMultiline, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Descripción"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={lugarDescripcion}
                                onChangeText={setLugarDescripcion}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity
                                style={[styles.fotoButton, { borderColor: "#e6007e" }]}
                                onPress={seleccionarFotos}
                            >
                                <MaterialIcons name="add-a-photo" size={22} color="#e6007e" />
                                <Text style={styles.fotoButtonText}>
                                    Agregar fotos ({lugarFotos.length}/3)
                                </Text>
                            </TouchableOpacity>
                            {lugarFotos.length > 0 && (
                                <View style={styles.fotosPreview}>
                                    {lugarFotos.map((foto, index) => (
                                        <View key={index} style={styles.fotoContainer}>
                                            <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
                                            <TouchableOpacity
                                                style={styles.fotoDelete}
                                                onPress={() => {
                                                    const nuevasFotos = lugarFotos.filter((_, i) => i !== index);
                                                    setLugarFotos(nuevasFotos);
                                                }}
                                            >
                                                <MaterialIcons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity
                                style={[styles.saveButton, savingLugar && { opacity: 0.7 }]}
                                onPress={handleGuardarLugar}
                                disabled={savingLugar}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingLugar ? "Guardando..." : "Guardar Lugar"}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL — Formulario Evento */}
            <Modal visible={addEventoModalVisible} transparent animationType="slide" onRequestClose={() => setAddEventoModalVisible(false)}>
                <Pressable style={styles.modalOverlay}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nuevo Evento</Text>
                            <TouchableOpacity onPress={() => setAddEventoModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Nombre del evento"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={eventoNombre}
                                onChangeText={setEventoNombre}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Fecha inicio (AAAA-MM-DD)"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={eventoFechaInicio}
                                onChangeText={setEventoFechaInicio}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Fecha final (AAAA-MM-DD)"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={eventoFechaFinal}
                                onChangeText={setEventoFechaFinal}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Costo (0 si es gratis)"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={eventoCostos}
                                onChangeText={setEventoCostos}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputMultiline, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Descripción"
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={eventoDescripcion}
                                onChangeText={setEventoDescripcion}
                                multiline
                                numberOfLines={3}
                            />
                            <Text style={styles.modalSubtitle}>Selecciona el lugar</Text>
                            <View style={[styles.selectContainer, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                                <Picker
                                    selectedValue={eventoLugarId}
                                    onValueChange={setEventoLugarId}
                                    style={{ color: "#e6007e" }}
                                    dropdownIconColor="#e6007e"
                                >
                                    <Picker.Item label="Selecciona un lugar" value="" />
                                    {lugares.map((lugar) => (
                                        <Picker.Item key={lugar._id} label={lugar.nombre} value={lugar._id} />
                                    ))}
                                </Picker>
                            </View>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#ff6600" }, savingEvento && { opacity: 0.7 }]}
                                onPress={handleGuardarEvento}
                                disabled={savingEvento}
                            >
                                <Text style={styles.saveButtonText}>
                                    {savingEvento ? "Guardando..." : "Guardar Evento"}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL BUSCAR */}
            <Modal visible={searchModalVisible} transparent animationType="fade" onRequestClose={() => setSearchModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setSearchModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Buscar</Text>
                            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.searchInput, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]}
                                placeholder="Escribe lo que buscas..."
                                placeholderTextColor="rgba(230,0,126,0.6)"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText.trim() !== "" && (
                                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText("")}>
                                    <MaterialIcons name="close" size={20} color="#e6007e" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.modalSubtitle}>Categoría</Text>
                        <View style={[styles.selectContainer, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                            <Picker
                                selectedValue={selectedCategory}
                                onValueChange={setSelectedCategory}
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
                        <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                            {loadingLugares ? (
                                <ActivityIndicator color="#e6007e" />
                            ) : resultadosFiltrados.length === 0 ? (
                                <Text style={styles.noResults}>No se encontraron resultados</Text>
                            ) : (
                                resultadosFiltrados.map((lugar) => (
                                    <TouchableOpacity
                                        key={lugar._id}
                                        style={[styles.resultCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}
                                        onPress={() => centerToPlace(lugar)}
                                    >
                                        <Text style={styles.resultTitle}>{lugar.nombre}</Text>
                                        <Text style={styles.resultCategory}>{lugar.categoria}</Text>
                                        <Text style={styles.resultDesc}>{lugar.descripcion}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL EVENTOS CERCANOS */}
            <Modal visible={eventModalVisible} transparent animationType="fade" onRequestClose={() => setEventModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setEventModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Eventos cercanos</Text>
                            <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 330 }} showsVerticalScrollIndicator={false}>
                            {eventosOrdenados.length === 0 ? (
                                <Text style={styles.noResults}>No hay eventos disponibles</Text>
                            ) : (
                                eventosOrdenados.map((evento) => (
                                    <TouchableOpacity
                                        key={evento._id}
                                        style={[styles.resultCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}
                                        onPress={() => centerToEvent(evento)}
                                    >
                                        <Text style={styles.resultTitle}>{evento.nombre}</Text>
                                        <Text style={styles.resultCategory}>
                                            {new Date(evento.fechaInicio).toLocaleDateString()} - {new Date(evento.fechaFinal).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.resultDesc}>{evento.descripcion}</Text>
                                        <Text style={styles.distanceText}>
                                            Aprox. {evento.distancia.toFixed(2)} km
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
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
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Perfil"); }}>
                            <MaterialIcons name="person" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Perfil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Ajustes"); }}>
                            <MaterialIcons name="settings" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Ajustes</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>Tema</Text>
                        <TouchableOpacity
                            style={[styles.themeOption, themeMode === "auto" && styles.themeOptionActive]}
                            onPress={() => setThemeMode("auto")}
                        >
                            <MaterialIcons name="brightness-auto" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Automático</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeOption, themeMode === "light" && styles.themeOptionActive]}
                            onPress={() => setThemeMode("light")}
                        >
                            <MaterialIcons name="light-mode" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Claro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeOption, themeMode === "dark" && styles.themeOptionActive]}
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
    container: { flex: 1 },
    map: { flex: 1 },
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
        top: 0, bottom: 0, left: 0, right: 0,
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
        maxHeight: "85%",
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
    coordsText: {
        fontSize: 12,
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 15,
        opacity: 0.8,
    },
    addOptionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    addOptionText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    input: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#e6007e",
        marginBottom: 12,
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    inputWrapper: { position: "relative" },
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
        marginBottom: 12,
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
    fotoButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    fotoButtonText: {
        color: "#e6007e",
        fontWeight: "bold",
        fontSize: 14,
    },
    fotosPreview: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    fotoContainer: {
        position: "relative",
    },
    fotoPreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e6007e",
    },
    fotoDelete: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#e6007e",
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});