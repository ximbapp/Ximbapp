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
    Alert,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Fontisto, Entypo, MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles, COLORS } from "../theme/styles";

const API_URL = "https://ximbapp.com/api";

const iconosPorCategoria = {
    "Historia/Cultura": COLORS.historiaColor,
    "Religioso": COLORS.religiosoColor,
    "Centros Recreativos": COLORS.recreativoColor,
    "Gastronomía": COLORS.gastronomiaColor,
    "Aventura": COLORS.aventuraColor,
    "Eventos": COLORS.eventosColor,
};

const MarkerPersonalizado = ({ categoria, coordinate, titulo, descripcion, onPress }) => {
    const color = iconosPorCategoria[categoria] || COLORS.primary;
    return (
        <Marker coordinate={coordinate} title={titulo} description={descripcion} onPress={onPress} pinColor={color} />
    );
};

const Home = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);
    const mapRef = useRef(null);
    const insets = useSafeAreaInsets();

    const [location, setLocation] = useState(null);
    const [locationReady, setLocationReady] = useState(false);
    const [miUsuarioId, setMiUsuarioId] = useState(null);
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
    const [filtroMapa, setFiltroMapa] = useState("");

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

    const categorias = ["Historia/Cultura", "Religioso", "Centros Recreativos", "Eventos", "Gastronomía", "Aventura"];

    const formatFecha = (date) => date.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    const formatHora = (date) => date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

    const cargarDatos = async () => {
        try {
            setLoadingLugares(true);
            const [resLugares, resEventos] = await Promise.all([fetch(`${API_URL}/lugares`), fetch(`${API_URL}/eventos`)]);
            const dataLugares = await resLugares.json();
            const dataEventos = await resEventos.json();
            setLugares(dataLugares.lugares || []);
            setEventos(dataEventos.eventos || []);
        } catch (error) { console.log("Error cargando datos:", error); }
        finally { setLoadingLugares(false); }
    };

    const cargarMiId = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;
            const response = await fetch(`${API_URL}/auth/perfil`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) setMiUsuarioId(data.usuario._id);
        } catch (e) {}
    };

    useEffect(() => { cargarDatos(); cargarMiId(); }, []);

    const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
            const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
            setLocation(coords);
            setLocationReady(true);
            setTimeout(() => { if (mapRef.current) mapRef.current.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600); }, 500);
            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
                (loc) => setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
            );
        };
        startTracking();
        return () => { if (subscription) subscription.remove(); };
    }, []);

    const handleLongPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCoordsSeleccionadas({ latitude, longitude });
        setLugarNombre(""); setLugarLocalidad(""); setLugarCategoria("");
        setLugarHoraInicio(new Date()); setLugarHoraFin(new Date());
        setLugarSiempreAbierto(false); setLugarDescripcion(""); setLugarFotos([]);
        setEventoNombre(""); setEventoFechaInicio(new Date()); setEventoFechaFinal(new Date());
        setEventoHoraInicio(new Date()); setEventoHoraFin(new Date());
        setEventoCostos(""); setEventoDescripcion(""); setEventoFotos([]);
        setAddModalVisible(true);
    };

    const centerLocation = () => {
        if (mapRef.current && location) mapRef.current.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    };

    const centerToPlace = (place) => {
        setSelectedPlace(place);
        if (mapRef.current) mapRef.current.animateToRegion({ latitude: place.coordenadas.latitud, longitude: place.coordenadas.longitud, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
        setSearchModalVisible(false);
        navigation.navigate("DetalleLugar", { lugar: place, miUsuarioId });
    };

    const centerToEvent = (event) => {
        const lat = event.coordenadas?.latitud || event.lugar?.coordenadas?.latitud;
        const lng = event.coordenadas?.longitud || event.lugar?.coordenadas?.longitud;
        if (lat && lng) {
            setSelectedPlace({ nombre: event.nombre, descripcion: event.descripcion, coordenadas: { latitud: lat, longitud: lng } });
            if (mapRef.current) mapRef.current.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
        }
        setEventModalVisible(false);
        navigation.navigate("DetalleEvento", { evento: event, miUsuarioId });
    };

    const seleccionarFotos = async () => {
        if (lugarFotos.length >= 3) { alert("Máximo 3 fotos"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { alert("Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 3 - lugarFotos.length, quality: 0.7 });
        if (!result.canceled) setLugarFotos([...lugarFotos, ...result.assets]);
    };

    const seleccionarFotosEvento = async () => {
        if (eventoFotos.length >= 3) { alert("Máximo 3 fotos"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { alert("Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 3 - eventoFotos.length, quality: 0.7 });
        if (!result.canceled) setEventoFotos([...eventoFotos, ...result.assets]);
    };

    const handleGuardarLugar = async () => {
        if (!lugarNombre || !lugarLocalidad || !lugarCategoria) { alert("Nombre, localidad y categoría son obligatorios"); return; }
        try {
            setSavingLugar(true);
            const token = await AsyncStorage.getItem("token");
            const horario = lugarSiempreAbierto ? "Siempre abierto" : `${formatHora(lugarHoraInicio)} - ${formatHora(lugarHoraFin)}`;
            const formData = new FormData();
            formData.append("nombre", lugarNombre); formData.append("localidad", lugarLocalidad);
            formData.append("categoria", lugarCategoria); formData.append("horario", horario);
            formData.append("descripcion", lugarDescripcion);
            formData.append("coordenadas", JSON.stringify({ latitud: coordsSeleccionadas.latitude, longitud: coordsSeleccionadas.longitude }));
            lugarFotos.forEach((foto, index) => formData.append("fotos", { uri: foto.uri, type: "image/jpeg", name: `foto_${index}.jpg` }));
            const response = await fetch(`${API_URL}/lugares`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, body: formData });
            const data = await response.json();
            if (response.ok) {
                alert("¡Lugar creado correctamente!");
                setAddLugarModalVisible(false);
                setLugarNombre(""); setLugarLocalidad(""); setLugarCategoria("");
                setLugarHoraInicio(new Date()); setLugarHoraFin(new Date());
                setLugarSiempreAbierto(false); setLugarDescripcion(""); setLugarFotos([]);
                cargarDatos();
            } else alert(data.mensaje);
        } catch (error) { alert("Error de conexión"); }
        finally { setSavingLugar(false); }
    };

    const handleGuardarEvento = async () => {
        if (!eventoNombre) { alert("El nombre es obligatorio"); return; }
        if (!coordsSeleccionadas) { alert("Haz longPress en el mapa para marcar la ubicación del evento"); return; }
        if (eventoFechaFinal < eventoFechaInicio) { alert("La fecha final no puede ser menor a la fecha de inicio"); return; }
        try {
            setSavingEvento(true);
            const token = await AsyncStorage.getItem("token");
            const formData = new FormData();
            formData.append("nombre", eventoNombre);
            formData.append("fechaInicio", eventoFechaInicio.toISOString());
            formData.append("fechaFinal", eventoFechaFinal.toISOString());
            formData.append("costos", eventoCostos ? parseFloat(eventoCostos) : 0);
            formData.append("descripcion", eventoDescripcion);
            formData.append("horario", `${formatHora(eventoHoraInicio)} - ${formatHora(eventoHoraFin)}`);
            formData.append("coordenadas", JSON.stringify({ latitud: coordsSeleccionadas.latitude, longitud: coordsSeleccionadas.longitude }));
            eventoFotos.forEach((foto, index) => formData.append("fotos", { uri: foto.uri, type: "image/jpeg", name: `foto_evento_${index}.jpg` }));
            const response = await fetch(`${API_URL}/eventos`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, body: formData });
            const data = await response.json();
            if (response.ok) {
                alert("¡Evento creado correctamente!");
                setAddEventoModalVisible(false);
                setEventoNombre(""); setEventoFechaInicio(new Date()); setEventoFechaFinal(new Date());
                setEventoHoraInicio(new Date()); setEventoHoraFin(new Date());
                setEventoCostos(""); setEventoDescripcion(""); setEventoFotos([]);
                cargarDatos();
            } else alert(data.mensaje || "Error al crear el evento");
        } catch (error) { alert("Error de conexión"); }
        finally { setSavingEvento(false); }
    };

    const openMenu = () => { setMenuVisible(true); Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(); };
    const closeMenu = () => { Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => setMenuVisible(false)); };

    const handleLogout = async () => {
        Alert.alert("Cerrar sesión", "¿Estás seguro que deseas cerrar sesión?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Cerrar sesión", style: "destructive", onPress: async () => { await AsyncStorage.removeItem("token"); await AsyncStorage.removeItem("usuario"); closeMenu(); navigation.replace("Login"); } }
        ]);
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
            <View style={[globalStyles.centered, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, marginTop: 12, fontWeight: "bold" }}>Obteniendo ubicación...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef} style={styles.map} mapType="standard"
                showsUserLocation={true} showsMyLocationButton={false}
                onLongPress={handleLongPress} showsPointsOfInterest={false}
                legalLabelInsets={{ bottom: -100, right: -100 }}
                customMapStyle={isDark ? [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                    { featureType: "poi", stylers: [{ visibility: "off" }] },
                    { featureType: "transit", stylers: [{ visibility: "off" }] }
                ] : [
                    { featureType: "poi", stylers: [{ visibility: "off" }] },
                    { featureType: "transit", stylers: [{ visibility: "off" }] }
                ]}
                initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            >
                {lugaresFiltrados.map((lugar) => (
                    <MarkerPersonalizado key={lugar._id} categoria={lugar.categoria}
                        coordinate={{ latitude: lugar.coordenadas.latitud, longitude: lugar.coordenadas.longitud }}
                        titulo={lugar.nombre} descripcion={lugar.descripcion}
                        onPress={() => navigation.navigate("DetalleLugar", { lugar, miUsuarioId })}
                    />
                ))}
                {selectedPlace && (
                    <Marker coordinate={{ latitude: selectedPlace.coordenadas.latitud, longitude: selectedPlace.coordenadas.longitud }} title={selectedPlace.nombre} description={selectedPlace.descripcion} />
                )}
                {coordsSeleccionadas && <Marker coordinate={coordsSeleccionadas} pinColor={COLORS.evento} title="Nueva ubicación" />}
            </MapView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroContainer} contentContainerStyle={styles.filtroContent}>
                <TouchableOpacity style={[globalStyles.filtroChip, filtroMapa === "" && globalStyles.filtroChipActivo]} onPress={() => setFiltroMapa("")}>
                    <Text style={[globalStyles.filtroChipText, filtroMapa === "" && globalStyles.filtroChipTextActivo]}>Todos</Text>
                </TouchableOpacity>
                {categorias.map((cat) => (
                    <TouchableOpacity key={cat} style={[globalStyles.filtroChip, filtroMapa === cat && globalStyles.filtroChipActivo]} onPress={() => setFiltroMapa(cat)}>
                        <Text style={[globalStyles.filtroChipText, filtroMapa === cat && globalStyles.filtroChipTextActivo]}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.locationButton} onPress={centerLocation}>
                <MaterialIcons name="my-location" size={24} color={COLORS.blanco} />
            </TouchableOpacity>

            <View style={[styles.bottomBar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, paddingBottom: insets.bottom }]}>
                <TouchableOpacity style={styles.sideButton} onPress={() => setEventModalVisible(true)}>
                    <Entypo name="calendar" size={26} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchButton} onPress={() => setSearchModalVisible(true)}>
                    <Fontisto name="search" size={26} color={COLORS.blanco} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideButton} onPress={openMenu}>
                    <Fontisto name="nav-icon" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* MODAL — Elegir Lugar o Evento */}
            <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
                <Pressable style={globalStyles.modalOverlay} onPress={() => setAddModalVisible(false)}>
                    <Pressable style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <Text style={globalStyles.modalTitle}>¿Qué deseas agregar?</Text>
                        <Text style={styles.coordsText}>📍 {coordsSeleccionadas?.latitude.toFixed(5)}, {coordsSeleccionadas?.longitude.toFixed(5)}</Text>
                        <TouchableOpacity style={[globalStyles.btnPrimary, { marginBottom: 12 }]} onPress={() => { setAddModalVisible(false); setAddLugarModalVisible(true); }}>
                            <MaterialIcons name="place" size={24} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Agregar Lugar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.btnPrimary, { backgroundColor: COLORS.evento }]} onPress={() => { setAddModalVisible(false); setAddEventoModalVisible(true); }}>
                            <Entypo name="calendar" size={24} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Agregar Evento</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL — Formulario Lugar */}
            <Modal visible={addLugarModalVisible} transparent animationType="slide" onRequestClose={() => setAddLugarModalVisible(false)}>
                <Pressable style={globalStyles.modalOverlay}>
                    <Pressable style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={globalStyles.modalTitle}>Nuevo Lugar</Text>
                            <TouchableOpacity onPress={() => setAddLugarModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Nombre del lugar" placeholderTextColor={COLORS.primaryMedium} value={lugarNombre} onChangeText={setLugarNombre} />
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Localidad" placeholderTextColor={COLORS.primaryMedium} value={lugarLocalidad} onChangeText={setLugarLocalidad} />
                            <View style={[styles.selectContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                                <Picker selectedValue={lugarCategoria} onValueChange={setLugarCategoria} style={{ color: COLORS.primary }} dropdownIconColor={COLORS.primary}>
                                    <Picker.Item label="Selecciona categoría" value="" />
                                    {categorias.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
                                </Picker>
                            </View>
                            <Text style={styles.modalSubtitle}>Horario</Text>
                            <TouchableOpacity style={globalStyles.checkRow} onPress={() => setLugarSiempreAbierto(!lugarSiempreAbierto)}>
                                <View style={[globalStyles.checkbox, lugarSiempreAbierto && globalStyles.checkboxActivo]}>
                                    {lugarSiempreAbierto && <MaterialIcons name="check" size={14} color={COLORS.blanco} />}
                                </View>
                                <Text style={globalStyles.checkLabel}>Siempre abierto / Sin horario</Text>
                            </TouchableOpacity>
                            {!lugarSiempreAbierto && (
                                <>
                                    <Text style={styles.modalSubtitle}>Hora de apertura</Text>
                                    <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerLugarHoraInicio(true)}>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                        <Text style={globalStyles.dateButtonText}>{formatHora(lugarHoraInicio)}</Text>
                                    </TouchableOpacity>
                                    {showPickerLugarHoraInicio && (<DateTimePicker value={lugarHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerLugarHoraInicio(false); if (date) setLugarHoraInicio(date); }} />)}
                                    <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                                    <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerLugarHoraFin(true)}>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                        <Text style={globalStyles.dateButtonText}>{formatHora(lugarHoraFin)}</Text>
                                    </TouchableOpacity>
                                    {showPickerLugarHoraFin && (<DateTimePicker value={lugarHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerLugarHoraFin(false); if (date) setLugarHoraFin(date); }} />)}
                                </>
                            )}
                            <TextInput style={[globalStyles.input, globalStyles.inputMultiline, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Descripción" placeholderTextColor={COLORS.primaryMedium} value={lugarDescripcion} onChangeText={setLugarDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={styles.fotoButton} onPress={seleccionarFotos}>
                                <MaterialIcons name="add-a-photo" size={22} color={COLORS.primary} />
                                <Text style={styles.fotoButtonText}>Agregar fotos ({lugarFotos.length}/3)</Text>
                            </TouchableOpacity>
                            {lugarFotos.length > 0 && (
                                <View style={globalStyles.fotosPreview}>
                                    {lugarFotos.map((foto, index) => (
                                        <View key={index} style={{ position: "relative" }}>
                                            <Image source={{ uri: foto.uri }} style={globalStyles.fotoPreview} />
                                            <TouchableOpacity style={globalStyles.fotoDelete} onPress={() => setLugarFotos(lugarFotos.filter((_, i) => i !== index))}>
                                                <MaterialIcons name="close" size={16} color={COLORS.blanco} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[globalStyles.saveButton, savingLugar && { opacity: 0.7 }]} onPress={handleGuardarLugar} disabled={savingLugar}>
                                <Text style={globalStyles.saveButtonText}>{savingLugar ? "Guardando..." : "Guardar Lugar"}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL — Formulario Evento */}
            <Modal visible={addEventoModalVisible} transparent animationType="slide" onRequestClose={() => setAddEventoModalVisible(false)}>
                <Pressable style={globalStyles.modalOverlay}>
                    <Pressable style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={globalStyles.modalTitle}>Nuevo Evento</Text>
                            <TouchableOpacity onPress={() => setAddEventoModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Nombre del evento" placeholderTextColor={COLORS.primaryMedium} value={eventoNombre} onChangeText={setEventoNombre} />
                            <Text style={styles.modalSubtitle}>Fecha de inicio</Text>
                            <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerInicio(true)}>
                                <MaterialIcons name="event" size={20} color={COLORS.primary} />
                                <Text style={globalStyles.dateButtonText}>{formatFecha(eventoFechaInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerInicio && (<DateTimePicker value={eventoFechaInicio} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={new Date()} onChange={(event, date) => { setShowPickerInicio(false); if (date) setEventoFechaInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Fecha final</Text>
                            <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerFinal(true)}>
                                <MaterialIcons name="event" size={20} color={COLORS.primary} />
                                <Text style={globalStyles.dateButtonText}>{formatFecha(eventoFechaFinal)}</Text>
                            </TouchableOpacity>
                            {showPickerFinal && (<DateTimePicker value={eventoFechaFinal} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={eventoFechaInicio} onChange={(event, date) => { setShowPickerFinal(false); if (date) setEventoFechaFinal(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de inicio</Text>
                            <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraInicio(true)}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                <Text style={globalStyles.dateButtonText}>{formatHora(eventoHoraInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraInicio && (<DateTimePicker value={eventoHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowPickerHoraInicio(false); if (date) setEventoHoraInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                            <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraFin(true)}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                <Text style={globalStyles.dateButtonText}>{formatHora(eventoHoraFin)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraFin && (<DateTimePicker value={eventoHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(event, date) => { setShowPickerHoraFin(false); if (date) setEventoHoraFin(date); }} />)}
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Costo (0 si es gratis)" placeholderTextColor={COLORS.primaryMedium} value={eventoCostos} onChangeText={setEventoCostos} keyboardType="numeric" />
                            <TextInput style={[globalStyles.input, globalStyles.inputMultiline, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Descripción" placeholderTextColor={COLORS.primaryMedium} value={eventoDescripcion} onChangeText={setEventoDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={[styles.fotoButton, { borderColor: COLORS.evento }]} onPress={seleccionarFotosEvento}>
                                <MaterialIcons name="add-a-photo" size={22} color={COLORS.evento} />
                                <Text style={[styles.fotoButtonText, { color: COLORS.evento }]}>Agregar fotos ({eventoFotos.length}/3)</Text>
                            </TouchableOpacity>
                            {eventoFotos.length > 0 && (
                                <View style={globalStyles.fotosPreview}>
                                    {eventoFotos.map((foto, index) => (
                                        <View key={index} style={{ position: "relative" }}>
                                            <Image source={{ uri: foto.uri }} style={globalStyles.fotoPreview} />
                                            <TouchableOpacity style={globalStyles.fotoDelete} onPress={() => setEventoFotos(eventoFotos.filter((_, i) => i !== index))}>
                                                <MaterialIcons name="close" size={16} color={COLORS.blanco} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[globalStyles.saveButton, { backgroundColor: COLORS.evento }, savingEvento && { opacity: 0.7 }]} onPress={handleGuardarEvento} disabled={savingEvento}>
                                <Text style={globalStyles.saveButtonText}>{savingEvento ? "Guardando..." : "Guardar Evento"}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL BUSCAR */}
            <Modal visible={searchModalVisible} transparent animationType="fade" onRequestClose={() => setSearchModalVisible(false)}>
                <Pressable style={globalStyles.modalOverlay} onPress={() => setSearchModalVisible(false)}>
                    <Pressable style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={globalStyles.modalTitle}>Buscar</Text>
                            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput style={[styles.searchInput, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Escribe lo que buscas..." placeholderTextColor={COLORS.primaryMedium} value={searchText} onChangeText={setSearchText} />
                            {searchText.trim() !== "" && (
                                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText("")}>
                                    <MaterialIcons name="close" size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.modalSubtitle}>Categoría</Text>
                        <View style={[styles.selectContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                            <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={{ color: COLORS.primary }} dropdownIconColor={COLORS.primary}>
                                <Picker.Item label="Todas las categorías" value="" />
                                {categorias.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
                            </Picker>
                        </View>
                        <Text style={styles.modalSubtitle}>Resultados</Text>
                        <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                            {loadingLugares ? (<ActivityIndicator color={COLORS.primary} />) : resultadosFiltrados.length === 0 ? (
                                <Text style={styles.noResults}>No se encontraron resultados</Text>
                            ) : (
                                resultadosFiltrados.map((lugar) => (
                                    <TouchableOpacity key={lugar._id} style={[globalStyles.resultCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => centerToPlace(lugar)}>
                                        <Text style={globalStyles.resultTitle}>{lugar.nombre}</Text>
                                        <Text style={globalStyles.resultCategory}>{lugar.categoria}</Text>
                                        <Text style={globalStyles.resultDesc}>{lugar.descripcion}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* MODAL EVENTOS CERCANOS */}
            <Modal visible={eventModalVisible} transparent animationType="fade" onRequestClose={() => setEventModalVisible(false)}>
                <Pressable style={globalStyles.modalOverlay} onPress={() => setEventModalVisible(false)}>
                    <Pressable style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={globalStyles.modalTitle}>Eventos cercanos</Text>
                            <TouchableOpacity onPress={() => setEventModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 330 }} showsVerticalScrollIndicator={false}>
                            {eventosOrdenados.length === 0 ? (
                                <Text style={styles.noResults}>No hay eventos disponibles</Text>
                            ) : (
                                eventosOrdenados.map((evento) => (
                                    <TouchableOpacity key={evento._id} style={[globalStyles.resultCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => centerToEvent(evento)}>
                                        <Text style={globalStyles.resultTitle}>{evento.nombre}</Text>
                                        <Text style={globalStyles.resultCategory}>{new Date(evento.fechaInicio).toLocaleDateString()} - {new Date(evento.fechaFinal).toLocaleDateString()}</Text>
                                        <Text style={globalStyles.resultDesc}>{evento.descripcion}</Text>
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
                    <Animated.View style={[styles.drawer, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, transform: [{ translateX: slideAnim }] }]}>
                        <Text style={styles.drawerTitle}>Menú</Text>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Perfil"); }}>
                            <MaterialIcons name="person" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Perfil</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Ajustes"); }}>
                            <MaterialIcons name="settings" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Ajustes</Text>
                        </TouchableOpacity>
                        <Text style={styles.drawerSectionTitle}>Mi contenido</Text>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("MisLugares"); }}>
                            <MaterialIcons name="place" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Mis Lugares</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("MisComentarios"); }}>
                            <MaterialIcons name="chat-bubble-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Mis Comentarios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => { closeMenu(); navigation.navigate("Favoritos"); }}>
                            <MaterialIcons name="favorite-border" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Favoritos</Text>
                        </TouchableOpacity>
                        <Text style={styles.drawerSectionTitle}>Tema</Text>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "auto" && styles.themeOptionActive]} onPress={() => setThemeMode("auto")}>
                            <MaterialIcons name="brightness-auto" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Automático</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "light" && styles.themeOptionActive]} onPress={() => setThemeMode("light")}>
                            <MaterialIcons name="light-mode" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Claro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.themeOption, themeMode === "dark" && styles.themeOptionActive]} onPress={() => setThemeMode("dark")}>
                            <MaterialIcons name="dark-mode" size={22} color={COLORS.primary} />
                            <Text style={styles.drawerText}>Oscuro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 30 }]} onPress={handleLogout}>
                            <MaterialIcons name="logout" size={22} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Cerrar sesión</Text>
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
    filtroContainer: { position: "absolute", top: Platform.OS === "ios" ? 55 : 40, left: 0, right: 0 },
    filtroContent: { paddingHorizontal: 12, gap: 8, paddingVertical: 6 },
    locationButton: { position: "absolute", right: 20, bottom: 95, width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", elevation: 5 },
    bottomBar: { height: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 25, borderTopWidth: 1, borderTopColor: COLORS.primary },
    sideButton: { width: 80, alignItems: "center", justifyContent: "center" },
    searchButton: { width: 65, height: 65, borderRadius: 35, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", marginBottom: 30, elevation: 5 },
    overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.35)", flexDirection: "row", justifyContent: "flex-end" },
    drawer: { width: 260, height: "100%", padding: 20, borderLeftWidth: 2, borderLeftColor: COLORS.primary },
    drawerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.primary, marginBottom: 20, textAlign: "center" },
    drawerItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
    drawerText: { fontSize: 15, color: COLORS.primary, fontWeight: "bold" },
    drawerSectionTitle: { marginTop: 15, fontSize: 14, fontWeight: "bold", color: COLORS.primary },
    themeOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, marginTop: 8 },
    themeOptionActive: { backgroundColor: COLORS.primaryLight },
    coordsText: { fontSize: 12, color: COLORS.primary, textAlign: "center", marginBottom: 15, opacity: 0.8 },
    modalSubtitle: { marginTop: 8, fontSize: 13, fontWeight: "bold", color: COLORS.primary, marginBottom: 6 },
    inputWrapper: { position: "relative" },
    searchInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: COLORS.primary, paddingRight: 40 },
    clearButton: { position: "absolute", right: 10, top: 12 },
    selectContainer: { borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, overflow: "hidden", marginBottom: 12 },
    noResults: { textAlign: "center", marginTop: 20, color: COLORS.primary, fontWeight: "bold" },
    distanceText: { marginTop: 10, fontSize: 12, fontWeight: "bold", color: COLORS.primary, textAlign: "right" },
    fotoButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, padding: 12, marginBottom: 12 },
    fotoButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },
});