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
    Platform,
} from "react-native";

import MapView, { UrlTile, Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Fontisto, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = "https://ximbapp.com/api";

const Home = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);
    const mapRef = useRef(null);
    const insets = useSafeAreaInsets();

    const [location, setLocation] = useState(null);
    const [locationReady, setLocationReady] = useState(false);

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

    // Filtro de categorías en mapa
    const [filtroMapa, setFiltroMapa] = useState("");

    // Formulario lugar
    const [lugarNombre, setLugarNombre] = useState("");
    const [lugarLocalidad, setLugarLocalidad] = useState("");
    const [lugarCategoria, setLugarCategoria] = useState("");
    const [lugarHoraInicio, setLugarHoraInicio] = useState(new Date());
    const [lugarHoraFin, setLugarHoraFin] = useState(new Date());
    const [lugarSiempreAbierto, setLugarSiempreAbierto] = useState(false);
    const [showPickerLugarHoraInicio, setShowPickerLugarHoraInicio] = useState(false);
    const [showPickerLugarHoraFin, setShowPickerLugarHoraFin] = useState(false);
    const [lugarDescripcion, setLugarDescripcion] = useState("");
    const [lugarFotos, setLugarFotos] = useState([]);
    const [savingLugar, setSavingLugar] = useState(false);

    // Formulario evento
    const [eventoNombre, setEventoNombre] = useState("");
    const [eventoFechaInicio, setEventoFechaInicio] = useState(new Date());
    const [eventoFechaFinal, setEventoFechaFinal] = useState(new Date());
    const [eventoHoraInicio, setEventoHoraInicio] = useState(new Date());
    const [eventoHoraFin, setEventoHoraFin] = useState(new Date());
    const [eventoCostos, setEventoCostos] = useState("");
    const [eventoDescripcion, setEventoDescripcion] = useState("");
    const [eventoFotos, setEventoFotos] = useState([]);
    const [savingEvento, setSavingEvento] = useState(false);

    const [showPickerInicio, setShowPickerInicio] = useState(false);
    const [showPickerFinal, setShowPickerFinal] = useState(false);
    const [showPickerHoraInicio, setShowPickerHoraInicio] = useState(false);
    const [showPickerHoraFin, setShowPickerHoraFin] = useState(false);

    const categorias = [
        "Historia/Cultura",
        "Religioso",
        "Centros Recreativos",
        "Eventos",
        "Gastronomía",
        "Aventura",
    ];

    const formatFecha = (date) => {
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatHora = (date) => {
        return date.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

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
                setLocation({ latitude: 19.4326, longitude: -99.1332 });
                setLocationReady(true);
                return;
            }
            // Obtener ubicación inicial inmediatamente
            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const coords = {
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
            };
            setLocation(coords);
            setLocationReady(true);
            // Centrar el mapa en la ubicación real
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        ...coords,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }, 600);
                }
            }, 500);
            // Seguir actualizando
            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
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
        setLugarNombre("");
        setLugarLocalidad("");
        setLugarCategoria("");
        setLugarHoraInicio(new Date());
        setLugarHoraFin(new Date());
        setLugarSiempreAbierto(false);
        setLugarDescripcion("");
        setLugarFotos([]);
        setEventoNombre("");
        setEventoFechaInicio(new Date());
        setEventoFechaFinal(new Date());
        setEventoHoraInicio(new Date());
        setEventoHoraFin(new Date());
        setEventoCostos("");
        setEventoDescripcion("");
        setEventoFotos([]);
        setAddModalVisible(true);
    };

    const centerLocation = () => {
        if (mapRef.current && location) {
            mapRef.current.animateToRegion(
                { ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 },
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
        const lat = event.coordenadas?.latitud || event.lugar?.coordenadas?.latitud;
        const lng = event.coordenadas?.longitud || event.lugar?.coordenadas?.longitud;
        if (lat && lng) {
            setSelectedPlace({
                nombre: event.nombre,
                descripcion: event.descripcion,
                coordenadas: { latitud: lat, longitud: lng },
            });
            if (mapRef.current) {
                mapRef.current.animateToRegion(
                    { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                    600
                );
            }
        }
        setEventModalVisible(false);
        navigation.navigate("DetalleEvento", { evento: event });
    };

    const seleccionarFotos = async () => {
        if (lugarFotos.length >= 3) { alert("Máximo 3 fotos"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { alert("Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3 - lugarFotos.length,
            quality: 0.7,
        });
        if (!result.canceled) setLugarFotos([...lugarFotos, ...result.assets]);
    };

    const seleccionarFotosEvento = async () => {
        if (eventoFotos.length >= 3) { alert("Máximo 3 fotos"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { alert("Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3 - eventoFotos.length,
            quality: 0.7,
        });
        if (!result.canceled) setEventoFotos([...eventoFotos, ...result.assets]);
    };

    const handleGuardarLugar = async () => {
        if (!lugarNombre || !lugarLocalidad || !lugarCategoria) {
            alert("Nombre, localidad y categoría son obligatorios");
            return;
        }
        try {
            setSavingLugar(true);
            const token = await AsyncStorage.getItem("token");
            const horario = lugarSiempreAbierto
                ? "Siempre abierto"
                : `${formatHora(lugarHoraInicio)} - ${formatHora(lugarHoraFin)}`;
            const formData = new FormData();
            formData.append("nombre", lugarNombre);
            formData.append("localidad", lugarLocalidad);
            formData.append("categoria", lugarCategoria);
            formData.append("horario", horario);
            formData.append("descripcion", lugarDescripcion);
            formData.append("coordenadas", JSON.stringify({
                latitud: coordsSeleccionadas.latitude,
                longitud: coordsSeleccionadas.longitude,
            }));
            lugarFotos.forEach((foto, index) => {
                formData.append("fotos", { uri: foto.uri, type: "image/jpeg", name: `foto_${index}.jpg` });
            });
            const response = await fetch(`${API_URL}/lugares`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                alert("¡Lugar creado correctamente!");
                setAddLugarModalVisible(false);
                setLugarNombre(""); setLugarLocalidad(""); setLugarCategoria("");
                setLugarHoraInicio(new Date()); setLugarHoraFin(new Date());
                setLugarSiempreAbierto(false); setLugarDescripcion(""); setLugarFotos([]);
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
        if (!eventoNombre) { alert("El nombre es obligatorio"); return; }
        if (!coordsSeleccionadas) { alert("Haz longPress en el mapa para marcar la ubicación del evento"); return; }
        if (eventoFechaFinal < eventoFechaInicio) { alert("La fecha final no puede ser menor a la fecha de inicio"); return; }
        try {
            setSavingEvento(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/eventos`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: eventoNombre,
                    fechaInicio: eventoFechaInicio.toISOString(),
                    fechaFinal: eventoFechaFinal.toISOString(),
                    costos: eventoCostos ? parseFloat(eventoCostos) : 0,
                    descripcion: eventoDescripcion,
                    horario: `${formatHora(eventoHoraInicio)} - ${formatHora(eventoHoraFin)}`,
                    coordenadas: { latitud: coordsSeleccionadas.latitude, longitud: coordsSeleccionadas.longitude },
                }),
            });
            const data = await response.json();
            if (response.ok) {
                alert("¡Evento creado correctamente!");
                setAddEventoModalVisible(false);
                setEventoNombre(""); setEventoFechaInicio(new Date()); setEventoFechaFinal(new Date());
                setEventoHoraInicio(new Date()); setEventoHoraFin(new Date());
                setEventoCostos(""); setEventoDescripcion(""); setEventoFotos([]);
                cargarDatos();
            } else {
                alert(data.mensaje || "Error al crear el evento");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setSavingEvento(false);
        }
    };

    const openMenu = () => {
        setMenuVisible(true);
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false));
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("usuario");
        closeMenu();
        navigation.replace("Login");
    };

    const resultadosFiltrados = lugares.filter((lugar) => {
        const coincideTexto = searchText.trim() === "" || lugar.nombre.toLowerCase().includes(searchText.toLowerCase());
        const coincideCategoria = selectedCategory === "" || lugar.categoria === selectedCategory;
        return coincideTexto && coincideCategoria;
    });

    const lugaresFiltrados = filtroMapa === "" ? lugares : lugares.filter(l => l.categoria === filtroMapa);

    const eventosOrdenados = eventos
        .filter((e) => e.coordenadas?.latitud || e.lugar?.coordenadas?.latitud)
        .map((evento) => {
            const lat = evento.coordenadas?.latitud || evento.lugar?.coordenadas?.latitud;
            const lng = evento.coordenadas?.longitud || evento.lugar?.coordenadas?.longitud;
            const distancia = location ? calcularDistanciaKm(location.latitude, location.longitude, lat, lng) : 0;
            return { ...evento, distancia };
        })
        .sort((a, b) => a.distancia - b.distancia);

    if (!locationReady) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#3A3A46" : "#fff" }}>
                <ActivityIndicator size="large" color="#e6007e" />
                <Text style={{ color: "#e6007e", marginTop: 12, fontWeight: "bold" }}>Obteniendo ubicación...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                mapType="none"
                showsUserLocation={true}
                showsMyLocationButton={false}
                onLongPress={handleLongPress}
                showsPointsOfInterest={false}
                legalLabelInsets={{ bottom: -100, right: -100 }}
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
                {lugaresFiltrados.map((lugar) => (
                    <Marker
                        key={lugar._id}
                        coordinate={{ latitude: lugar.coordenadas.latitud, longitude: lugar.coordenadas.longitud }}
                        title={lugar.nombre}
                        description={lugar.descripcion}
                        pinColor="#e6007e"
                        onPress={() => navigation.navigate("DetalleLugar", { lugar })}
                    />
                ))}
                {selectedPlace && (
                    <Marker
                        coordinate={{ latitude: selectedPlace.coordenadas.latitud, longitude: selectedPlace.coordenadas.longitud }}
                        title={selectedPlace.nombre}
                        description={selectedPlace.descripcion}
                    />
                )}
                {coordsSeleccionadas && (
                    <Marker coordinate={coordsSeleccionadas} pinColor="#ff6600" title="Nueva ubicación" />
                )}
            </MapView>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtroContainer}
                contentContainerStyle={styles.filtroContent}
            >
                <TouchableOpacity
                    style={[styles.filtroChip, filtroMapa === "" && styles.filtroChipActivo]}
                    onPress={() => setFiltroMapa("")}
                >
                    <Text style={[styles.filtroChipText, filtroMapa === "" && styles.filtroChipTextActivo]}>Todos</Text>
                </TouchableOpacity>
                {categorias.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.filtroChip, filtroMapa === cat && styles.filtroChipActivo]}
                        onPress={() => setFiltroMapa(cat)}
                    >
                        <Text style={[styles.filtroChipText, filtroMapa === cat && styles.filtroChipTextActivo]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.locationButton} onPress={centerLocation}>
                <MaterialIcons name="my-location" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={[styles.bottomBar, { backgroundColor: isDark ? "#3A3A46" : "#ffffff", paddingBottom: insets.bottom }]}>
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
                        <TouchableOpacity style={styles.addOptionButton} onPress={() => { setAddModalVisible(false); setAddLugarModalVisible(true); }}>
                            <MaterialIcons name="place" size={24} color="#fff" />
                            <Text style={styles.addOptionText}>Agregar Lugar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addOptionButton, { backgroundColor: "#ff6600" }]} onPress={() => { setAddModalVisible(false); setAddEventoModalVisible(true); }}>
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
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Nombre del lugar" placeholderTextColor="rgba(230,0,126,0.6)" value={lugarNombre} onChangeText={setLugarNombre} />
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Localidad" placeholderTextColor="rgba(230,0,126,0.6)" value={lugarLocalidad} onChangeText={setLugarLocalidad} />
                            <View style={[styles.selectContainer, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                                <Picker selectedValue={lugarCategoria} onValueChange={setLugarCategoria} style={{ color: "#e6007e" }} dropdownIconColor="#e6007e">
                                    <Picker.Item label="Selecciona categoría" value="" />
                                    {categorias.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
                                </Picker>
                            </View>

                            <Text style={styles.modalSubtitle}>Horario</Text>
                            <TouchableOpacity
                                style={[styles.checkRow]}
                                onPress={() => setLugarSiempreAbierto(!lugarSiempreAbierto)}
                            >
                                <View style={[styles.checkbox, lugarSiempreAbierto && styles.checkboxActivo]}>
                                    {lugarSiempreAbierto && <MaterialIcons name="check" size={14} color="#fff" />}
                                </View>
                                <Text style={styles.checkLabel}>Siempre abierto / Sin horario</Text>
                            </TouchableOpacity>

                            {!lugarSiempreAbierto && (
                                <>
                                    <Text style={styles.modalSubtitle}>Hora de apertura</Text>
                                    <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerLugarHoraInicio(true)}>
                                        <MaterialIcons name="access-time" size={20} color="#e6007e" />
                                        <Text style={styles.dateButtonText}>{formatHora(lugarHoraInicio)}</Text>
                                    </TouchableOpacity>
                                    {showPickerLugarHoraInicio && (
                                        <DateTimePicker value={lugarHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerLugarHoraInicio(false); if (date) setLugarHoraInicio(date); }} />
                                    )}
                                    <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                                    <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerLugarHoraFin(true)}>
                                        <MaterialIcons name="access-time" size={20} color="#e6007e" />
                                        <Text style={styles.dateButtonText}>{formatHora(lugarHoraFin)}</Text>
                                    </TouchableOpacity>
                                    {showPickerLugarHoraFin && (
                                        <DateTimePicker value={lugarHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerLugarHoraFin(false); if (date) setLugarHoraFin(date); }} />
                                    )}
                                </>
                            )}

                            <TextInput style={[styles.input, styles.inputMultiline, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Descripción" placeholderTextColor="rgba(230,0,126,0.6)" value={lugarDescripcion} onChangeText={setLugarDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={[styles.fotoButton, { borderColor: "#e6007e" }]} onPress={seleccionarFotos}>
                                <MaterialIcons name="add-a-photo" size={22} color="#e6007e" />
                                <Text style={styles.fotoButtonText}>Agregar fotos ({lugarFotos.length}/3)</Text>
                            </TouchableOpacity>
                            {lugarFotos.length > 0 && (
                                <View style={styles.fotosPreview}>
                                    {lugarFotos.map((foto, index) => (
                                        <View key={index} style={styles.fotoContainer}>
                                            <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
                                            <TouchableOpacity style={styles.fotoDelete} onPress={() => setLugarFotos(lugarFotos.filter((_, i) => i !== index))}>
                                                <MaterialIcons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[styles.saveButton, savingLugar && { opacity: 0.7 }]} onPress={handleGuardarLugar} disabled={savingLugar}>
                                <Text style={styles.saveButtonText}>{savingLugar ? "Guardando..." : "Guardar Lugar"}</Text>
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
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Nombre del evento" placeholderTextColor="rgba(230,0,126,0.6)" value={eventoNombre} onChangeText={setEventoNombre} />
                            <Text style={styles.modalSubtitle}>Fecha de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerInicio(true)}>
                                <MaterialIcons name="event" size={20} color="#e6007e" />
                                <Text style={styles.dateButtonText}>{formatFecha(eventoFechaInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerInicio && (<DateTimePicker value={eventoFechaInicio} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={new Date()} onChange={(event, date) => { setShowPickerInicio(false); if (date) setEventoFechaInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Fecha final</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerFinal(true)}>
                                <MaterialIcons name="event" size={20} color="#e6007e" />
                                <Text style={styles.dateButtonText}>{formatFecha(eventoFechaFinal)}</Text>
                            </TouchableOpacity>
                            {showPickerFinal && (<DateTimePicker value={eventoFechaFinal} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={eventoFechaInicio} onChange={(event, date) => { setShowPickerFinal(false); if (date) setEventoFechaFinal(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerHoraInicio(true)}>
                                <MaterialIcons name="access-time" size={20} color="#e6007e" />
                                <Text style={styles.dateButtonText}>{formatHora(eventoHoraInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraInicio && (<DateTimePicker value={eventoHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowPickerHoraInicio(false); if (date) setEventoHoraInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerHoraFin(true)}>
                                <MaterialIcons name="access-time" size={20} color="#e6007e" />
                                <Text style={styles.dateButtonText}>{formatHora(eventoHoraFin)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraFin && (<DateTimePicker value={eventoHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowPickerHoraFin(false); if (date) setEventoHoraFin(date); }} />)}
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Costo (0 si es gratis)" placeholderTextColor="rgba(230,0,126,0.6)" value={eventoCostos} onChangeText={setEventoCostos} keyboardType="numeric" />
                            <TextInput style={[styles.input, styles.inputMultiline, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Descripción" placeholderTextColor="rgba(230,0,126,0.6)" value={eventoDescripcion} onChangeText={setEventoDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={[styles.fotoButton, { borderColor: "#ff6600" }]} onPress={seleccionarFotosEvento}>
                                <MaterialIcons name="add-a-photo" size={22} color="#ff6600" />
                                <Text style={[styles.fotoButtonText, { color: "#ff6600" }]}>Agregar fotos ({eventoFotos.length}/3)</Text>
                            </TouchableOpacity>
                            {eventoFotos.length > 0 && (
                                <View style={styles.fotosPreview}>
                                    {eventoFotos.map((foto, index) => (
                                        <View key={index} style={styles.fotoContainer}>
                                            <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
                                            <TouchableOpacity style={styles.fotoDelete} onPress={() => setEventoFotos(eventoFotos.filter((_, i) => i !== index))}>
                                                <MaterialIcons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: "#ff6600" }, savingEvento && { opacity: 0.7 }]} onPress={handleGuardarEvento} disabled={savingEvento}>
                                <Text style={styles.saveButtonText}>{savingEvento ? "Guardando..." : "Guardar Evento"}</Text>
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
                            <TextInput style={[styles.searchInput, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#e6007e" }]} placeholder="Escribe lo que buscas..." placeholderTextColor="rgba(230,0,126,0.6)" value={searchText} onChangeText={setSearchText} />
                            {searchText.trim() !== "" && (
                                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText("")}>
                                    <MaterialIcons name="close" size={20} color="#e6007e" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.modalSubtitle}>Categoría</Text>
                        <View style={[styles.selectContainer, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                            <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={{ color: "#e6007e" }} dropdownIconColor="#e6007e">
                                <Picker.Item label="Todas las categorías" value="" />
                                {categorias.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
                            </Picker>
                        </View>
                        <Text style={styles.modalSubtitle}>Resultados</Text>
                        <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                            {loadingLugares ? (<ActivityIndicator color="#e6007e" />) : resultadosFiltrados.length === 0 ? (
                                <Text style={styles.noResults}>No se encontraron resultados</Text>
                            ) : (
                                resultadosFiltrados.map((lugar) => (
                                    <TouchableOpacity key={lugar._id} style={[styles.resultCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => centerToPlace(lugar)}>
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
                                    <TouchableOpacity key={evento._id} style={[styles.resultCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => centerToEvent(evento)}>
                                        <Text style={styles.resultTitle}>{evento.nombre}</Text>
                                        <Text style={styles.resultCategory}>{new Date(evento.fechaInicio).toLocaleDateString()} - {new Date(evento.fechaFinal).toLocaleDateString()}</Text>
                                        <Text style={styles.resultDesc}>{evento.descripcion}</Text>
                                        <Text style={styles.distanceText}>Aprox. {evento.distancia.toFixed(2)} km</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MENÚ LATERAL */}
            {menuVisible && (
                <Pressable style={styles.overlay} onPress={closeMenu}>
                    <Animated.View style={[styles.drawer, { backgroundColor: isDark ? "#3A3A46" : "#fff", transform: [{ translateX: slideAnim }] }]}>
                        <Text style={styles.drawerTitle}>Menú</Text>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Perfil"); }}>
                            <MaterialIcons name="person" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Perfil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Ajustes"); }}>
                            <MaterialIcons name="settings" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Ajustes</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>Mi contenido</Text>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("MisLugares"); }}>
                            <MaterialIcons name="place" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Mis Lugares</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("MisComentarios"); }}>
                            <MaterialIcons name="chat-bubble-outline" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Mis Comentarios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Favoritos"); }}>
                            <MaterialIcons name="favorite-border" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Favoritos</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>Tema</Text>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "auto" && styles.themeOptionActive]} onPress={() => setThemeMode("auto")}>
                            <MaterialIcons name="brightness-auto" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Automático</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "light" && styles.themeOptionActive]} onPress={() => setThemeMode("light")}>
                            <MaterialIcons name="light-mode" size={22} color="#e6007e" />
                            <Text style={styles.drawerText}>Claro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "dark" && styles.themeOptionActive]} onPress={() => setThemeMode("dark")}>
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
    filtroContainer: {
        position: "absolute",
        top: Platform.OS === "ios" ? 55 : 40,
        left: 0,
        right: 0,
    },
    filtroContent: {
        paddingHorizontal: 12,
        gap: 8,
        paddingVertical: 6,
    },
    filtroChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
        borderColor: "#e6007e",
    },
    filtroChipActivo: {
        backgroundColor: "#e6007e",
    },
    filtroChipText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#e6007e",
    },
    filtroChipTextActivo: {
        color: "#fff",
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
    sideButton: { width: 80, alignItems: "center", justifyContent: "center" },
    searchButton: {
        width: 65, height: 65, borderRadius: 35,
        backgroundColor: "#e6007e", alignItems: "center",
        justifyContent: "center", marginBottom: 30, elevation: 5,
    },
    overlay: {
        position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: "rgba(0,0,0,0.35)", flexDirection: "row", justifyContent: "flex-end",
    },
    drawer: { width: 260, height: "100%", padding: 20, borderLeftWidth: 2, borderLeftColor: "#e6007e" },
    drawerTitle: { fontSize: 18, fontWeight: "bold", color: "#e6007e", marginBottom: 20, textAlign: "center" },
    drawerItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
    drawerText: { fontSize: 15, color: "#e6007e", fontWeight: "bold" },
    sectionTitle: { marginTop: 15, fontSize: 14, fontWeight: "bold", color: "#e6007e" },
    themeOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, marginTop: 8 },
    themeOptionActive: { backgroundColor: "rgba(230,0,126,0.2)" },
    logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 30, backgroundColor: "#e6007e", paddingVertical: 12, borderRadius: 10 },
    logoutText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { width: "100%", borderRadius: 15, borderWidth: 1, borderColor: "#e6007e", padding: 18, maxHeight: "85%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#e6007e" },
    modalSubtitle: { marginTop: 8, fontSize: 13, fontWeight: "bold", color: "#e6007e", marginBottom: 6 },
    coordsText: { fontSize: 12, color: "#e6007e", textAlign: "center", marginBottom: 15, opacity: 0.8 },
    addOptionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#e6007e", padding: 15, borderRadius: 12, marginBottom: 12 },
    addOptionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: "#e6007e", marginBottom: 12 },
    inputMultiline: { height: 80, textAlignVertical: "top" },
    dateButton: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: "#e6007e", marginBottom: 12 },
    dateButtonText: { color: "#e6007e", fontSize: 15, fontWeight: "bold" },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: "#e6007e", alignItems: "center", justifyContent: "center" },
    checkboxActivo: { backgroundColor: "#e6007e" },
    checkLabel: { fontSize: 13, color: "#e6007e", fontWeight: "bold" },
    saveButton: { backgroundColor: "#e6007e", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
    saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    inputWrapper: { position: "relative" },
    searchInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: "#e6007e", paddingRight: 40 },
    clearButton: { position: "absolute", right: 10, top: 12 },
    selectContainer: { borderRadius: 10, borderWidth: 1, borderColor: "#e6007e", overflow: "hidden", marginBottom: 12 },
    resultCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "rgba(230,0,126,0.5)", marginBottom: 10 },
    resultTitle: { fontSize: 15, fontWeight: "bold", color: "#e6007e" },
    resultCategory: { fontSize: 12, fontWeight: "bold", color: "rgba(230,0,126,0.8)", marginTop: 3 },
    resultDesc: { fontSize: 13, color: "#e6007e", marginTop: 6 },
    noResults: { textAlign: "center", marginTop: 20, color: "#e6007e", fontWeight: "bold" },
    distanceText: { marginTop: 10, fontSize: 12, fontWeight: "bold", color: "#e6007e", textAlign: "right" },
    fotoButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
    fotoButtonText: { color: "#e6007e", fontWeight: "bold", fontSize: 14 },
    fotosPreview: { flexDirection: "row", gap: 8, marginBottom: 12 },
    fotoContainer: { position: "relative" },
    fotoPreview: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#e6007e" },
    fotoDelete: { position: "absolute", top: -6, right: -6, backgroundColor: "#e6007e", borderRadius: 10, width: 20, height: 20, alignItems: "center", justifyContent: "center" },
});