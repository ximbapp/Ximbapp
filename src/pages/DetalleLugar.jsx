import React, { useState, useEffect, useContext, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Platform,
    Modal,
    Linking,
    Share,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../context/ThemeContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { globalStyles, COLORS } from "../theme/styles";

const API_URL = "https://ximbapp.com/api";
const { width } = Dimensions.get("window");

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

const categorias = [
    "Historia/Cultura", "Religioso", "Centros Recreativos",
    "Eventos", "Gastronomía", "Aventura",
];

const DetalleLugar = ({ route, navigation }) => {
    const { lugar: lugarInicial, miUsuarioId } = route.params;
    const { isDark } = useContext(ThemeContext);

    const [lugar, setLugar] = useState(lugarInicial);
    const [pestanaActiva, setPestanaActiva] = useState("info");
    const [comentarios, setComentarios] = useState([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [comentarioFotos, setComentarioFotos] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [fotoActiva, setFotoActiva] = useState(0);
    const [esFavorito, setEsFavorito] = useState(false);
    const [zoomVisible, setZoomVisible] = useState(false);
    const [zoomIndex, setZoomIndex] = useState(0);
    const [zoomFotos, setZoomFotos] = useState([]);
    const [fotoComentarioZoom, setFotoComentarioZoom] = useState(null);
    const [miAvatarId, setMiAvatarId] = useState("colibri");
    const [miColorAvatar, setMiColorAvatar] = useState(COLORS.avatarMorado);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editNombre, setEditNombre] = useState("");
    const [editLocalidad, setEditLocalidad] = useState("");
    const [editCategoria, setEditCategoria] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [editHoraInicio, setEditHoraInicio] = useState(new Date());
    const [editHoraFin, setEditHoraFin] = useState(new Date());
    const [editSiempreAbierto, setEditSiempreAbierto] = useState(false);
    const [editFotos, setEditFotos] = useState([]);
    const [showPickerHoraInicio, setShowPickerHoraInicio] = useState(false);
    const [showPickerHoraFin, setShowPickerHoraFin] = useState(false);
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const flatListRef = useRef(null);
    const zoomRef = useRef(null);

    const esMiLugar = miUsuarioId && lugar.usuario?._id && lugar.usuario._id === miUsuarioId;

    const formatHora = (date) => date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

    useEffect(() => {
        cargarComentarios();
        verificarFavorito();
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

    const verificarFavorito = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;
            const response = await fetch(`${API_URL}/auth/favoritos`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (response.ok) {
                const ids = (data.favoritos || []).map((f) => f._id);
                setEsFavorito(ids.includes(lugar._id));
            }
        } catch (error) { console.log("Error verificando favorito:", error); }
    };

    const toggleFavorito = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) { Alert.alert("Aviso", "Debes iniciar sesión para guardar favoritos"); return; }
            const response = await fetch(`${API_URL}/auth/favoritos/${lugar._id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            if (response.ok) setEsFavorito(!esFavorito);
        } catch (error) { console.log("Error toggle favorito:", error); }
    };

    const cargarComentarios = async () => {
        try {
            setLoadingComentarios(true);
            const response = await fetch(`${API_URL}/comentarios/${lugar._id}`);
            const data = await response.json();
            setComentarios(data.comentarios || []);
        } catch (error) { console.log("Error cargando comentarios:", error); }
        finally { setLoadingComentarios(false); }
    };

    const abrirEdicion = () => {
        setEditNombre(lugar.nombre || "");
        setEditLocalidad(lugar.localidad || "");
        setEditCategoria(lugar.categoria || "");
        setEditDescripcion(lugar.descripcion || "");
        setEditSiempreAbierto(lugar.horario === "Siempre abierto");
        if (lugar.horario && lugar.horario !== "Siempre abierto") {
            try {
                const partes = lugar.horario.split(" - ");
                if (partes.length === 2) {
                    const parseHora = (horaStr) => {
                        const date = new Date();
                        const [time, period] = horaStr.trim().split(" ");
                        let [hours, minutes] = time.split(":").map(Number);
                        if (period?.toLowerCase() === "pm" && hours !== 12) hours += 12;
                        if (period?.toLowerCase() === "am" && hours === 12) hours = 0;
                        date.setHours(hours, minutes || 0, 0, 0);
                        return date;
                    };
                    setEditHoraInicio(parseHora(partes[0]));
                    setEditHoraFin(parseHora(partes[1]));
                }
            } catch (e) { setEditHoraInicio(new Date()); setEditHoraFin(new Date()); }
        }
        setEditFotos([]);
        setEditModalVisible(true);
    };

    const seleccionarFotosEdicion = async () => {
        if (editFotos.length >= 3) { Alert.alert("Límite", "Máximo 3 fotos"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { Alert.alert("Permiso", "Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 3 - editFotos.length, quality: 0.7 });
        if (!result.canceled) setEditFotos([...editFotos, ...result.assets]);
    };

    const handleGuardarEdicion = async () => {
        if (!editNombre.trim() || !editLocalidad.trim() || !editCategoria) { Alert.alert("Error", "Nombre, localidad y categoría son obligatorios"); return; }
        try {
            setGuardandoEdicion(true);
            const token = await AsyncStorage.getItem("token");
            const horario = editSiempreAbierto ? "Siempre abierto" : `${formatHora(editHoraInicio)} - ${formatHora(editHoraFin)}`;
            const formData = new FormData();
            formData.append("nombre", editNombre);
            formData.append("localidad", editLocalidad);
            formData.append("categoria", editCategoria);
            formData.append("horario", horario);
            formData.append("descripcion", editDescripcion);
            editFotos.forEach((foto, index) => formData.append("fotos", { uri: foto.uri, type: "image/jpeg", name: `foto_edit_${index}.jpg` }));
            const response = await fetch(`${API_URL}/lugares/${lugar._id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, body: formData });
            const data = await response.json();
            if (response.ok) { setLugar(data.lugar); setEditModalVisible(false); Alert.alert("✅", "Lugar actualizado correctamente"); }
            else Alert.alert("Error", data.mensaje);
        } catch (error) { Alert.alert("Error", "No se pudo actualizar el lugar"); }
        finally { setGuardandoEdicion(false); }
    };

    const handleEliminar = () => {
        Alert.alert("Eliminar lugar", `¿Estás seguro que deseas eliminar "${lugar.nombre}"? Esta acción no se puede deshacer.`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar", style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        const response = await fetch(`${API_URL}/lugares/${lugar._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                        if (response.ok) { Alert.alert("✅", "Lugar eliminado correctamente"); navigation.goBack(); }
                        else { const data = await response.json(); Alert.alert("Error", data.mensaje); }
                    } catch (error) { Alert.alert("Error", "No se pudo eliminar el lugar"); }
                }
            }
        ]);
    };

    const seleccionarFotosComentario = async () => {
        if (comentarioFotos.length >= 2) { Alert.alert("Límite", "Máximo 2 fotos por comentario"); return; }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { Alert.alert("Permiso", "Necesitamos permiso para acceder a tus fotos"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, selectionLimit: 2 - comentarioFotos.length, quality: 0.7 });
        if (!result.canceled) setComentarioFotos([...comentarioFotos, ...result.assets]);
    };

    const enviarComentario = async () => {
        if (!nuevoComentario.trim()) { Alert.alert("Aviso", "Escribe un comentario"); return; }
        try {
            setEnviando(true);
            const token = await AsyncStorage.getItem("token");
            const formData = new FormData();
            formData.append("lugar", lugar._id);
            formData.append("comentario", nuevoComentario.trim());
            comentarioFotos.forEach((foto, index) => formData.append("fotos", { uri: foto.uri, type: "image/jpeg", name: `foto_comentario_${index}.jpg` }));
            const response = await fetch(`${API_URL}/comentarios`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }, body: formData });
            const data = await response.json();
            if (response.ok) {
                setNuevoComentario(""); setComentarioFotos([]);
                await cargarComentarios();
                setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 300);
            } else Alert.alert("Error", data.mensaje);
        } catch (error) { Alert.alert("Error", "No se pudo enviar el comentario"); }
        finally { setEnviando(false); }
    };

    const abrirNavegacion = () => {
        const lat = lugar.coordenadas?.latitud;
        const lng = lugar.coordenadas?.longitud;
        Alert.alert("¿Cómo quieres llegar?", "Selecciona una aplicación de navegación", [
            { text: "Waze", onPress: () => Linking.openURL(`waze://?ll=${lat},${lng}&navigate=yes`).catch(() => Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`)) },
            { text: "Google Maps", onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`) },
            { text: "Apple Maps", onPress: () => Linking.openURL(`maps://?daddr=${lat},${lng}`), ...(Platform.OS !== "ios" && { style: "destructive" }) },
            { text: "Cancelar", style: "cancel" },
        ], { cancelable: true });
    };

    const compartirLugar = async () => {
        try { await Share.share({ message: `Visita ${lugar.nombre} en Ximbapp!\nhttps://ximbapp.com`, url: `https://ximbapp.com`, title: lugar.nombre }); }
        catch (error) { console.log("Error compartiendo:", error); }
    };

    const abrirZoom = (fotos, index) => {
        setZoomFotos(fotos); setZoomIndex(index); setZoomVisible(true);
        setTimeout(() => zoomRef.current?.scrollToIndex({ index, animated: false }), 100);
    };

    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

    const AvatarComentario = ({ avatarId, color }) => (
        <View style={[styles.avatarComentario, { backgroundColor: color || COLORS.avatarMorado }]}>
            <Image source={getAvatarSource(avatarId || "colibri")} style={styles.avatarComentarioImg} resizeMode="contain" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{lugar.nombre}</Text>
                <TouchableOpacity onPress={toggleFavorito}>
                    <MaterialIcons name={esFavorito ? "favorite" : "favorite-border"} size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {lugar.fotos && lugar.fotos.length > 0 ? (
                <View style={styles.carruselContainer}>
                    <FlatList
                        data={lugar.fotos} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onScroll={(e) => setFotoActiva(Math.round(e.nativeEvent.contentOffset.x / width))}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={() => abrirZoom(lugar.fotos, index)} activeOpacity={0.9}>
                                <Image source={{ uri: item }} style={[styles.fotoCarrusel, { width }]} />
                            </TouchableOpacity>
                        )}
                    />
                    <View style={styles.indicadores}>
                        {lugar.fotos.map((_, index) => (
                            <View key={index} style={[styles.indicador, { backgroundColor: index === fotoActiva ? COLORS.primary : "rgba(255,255,255,0.5)" }]} />
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.sinFotos}>
                    <MaterialIcons name="image-not-supported" size={50} color={COLORS.primary} />
                    <Text style={styles.sinFotosText}>Sin fotos</Text>
                </View>
            )}

            <View style={[styles.pestanas, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                <TouchableOpacity style={[styles.pestana, pestanaActiva === "info" && styles.pestanaActiva]} onPress={() => setPestanaActiva("info")}>
                    <Text style={[styles.pestanaText, pestanaActiva === "info" && styles.pestanaTextActiva]}>Info</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pestana, pestanaActiva === "comentarios" && styles.pestanaActiva]} onPress={() => setPestanaActiva("comentarios")}>
                    <Text style={[styles.pestanaText, pestanaActiva === "comentarios" && styles.pestanaTextActiva]}>
                        Comentarios ({comentarios.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {pestanaActiva === "info" ? (
                <ScrollView style={styles.contenido} showsVerticalScrollIndicator={false}>
                    <View style={[styles.infoCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                        <View style={globalStyles.infoRow}>
                            <MaterialIcons name="category" size={20} color={COLORS.primary} />
                            <Text style={globalStyles.infoLabel}>Categoría:</Text>
                            <Text style={globalStyles.infoValue}>{lugar.categoria}</Text>
                        </View>
                        {lugar.horario ? (
                            <View style={globalStyles.infoRow}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                <Text style={globalStyles.infoLabel}>Horario:</Text>
                                <Text style={globalStyles.infoValue}>{lugar.horario}</Text>
                            </View>
                        ) : null}
                        <View style={globalStyles.infoRow}>
                            <MaterialIcons name="place" size={20} color={COLORS.primary} />
                            <Text style={globalStyles.infoLabel}>Localidad:</Text>
                            <Text style={globalStyles.infoValue}>{lugar.localidad}</Text>
                        </View>
                        {lugar.descripcion ? (
                            <View style={styles.descripcionContainer}>
                                <Text style={globalStyles.infoLabel}>Descripción:</Text>
                                <Text style={styles.descripcionText}>{lugar.descripcion}</Text>
                            </View>
                        ) : null}
                        <View style={globalStyles.infoRow}>
                            <MaterialIcons name="person" size={20} color={COLORS.primary} />
                            <Text style={globalStyles.infoLabel}>Agregado por:</Text>
                            <Text style={globalStyles.infoValue}>{lugar.usuario?.nombre || "—"}</Text>
                        </View>
                    </View>

                    <View style={globalStyles.botonesAccion}>
                        <TouchableOpacity style={globalStyles.btnPrimary} onPress={compartirLugar}>
                            <MaterialIcons name="share" size={20} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Compartir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.btnOutline} onPress={abrirNavegacion}>
                            <MaterialIcons name="directions" size={20} color={COLORS.primary} />
                            <Text style={globalStyles.btnOutlineText}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>

                    {esMiLugar && (
                        <View style={globalStyles.botonesAccion}>
                            <TouchableOpacity style={globalStyles.btnAzul} onPress={abrirEdicion}>
                                <MaterialIcons name="edit" size={20} color={COLORS.blanco} />
                                <Text style={globalStyles.btnText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={globalStyles.btnRojo} onPress={handleEliminar}>
                                <MaterialIcons name="delete" size={20} color={COLORS.blanco} />
                                <Text style={globalStyles.btnText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            ) : (
                <View style={styles.contenido}>
                    {loadingComentarios ? (
                        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={comentarios}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <View style={[styles.nuevoComentario, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                                    <View style={styles.miAvatarRow}>
                                        <AvatarComentario avatarId={miAvatarId} color={miColorAvatar} />
                                        <Text style={styles.nuevoComentarioTitle}>Agregar comentario</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.comentarioInput, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, color: COLORS.primary }]}
                                        placeholder="Escribe tu comentario..."
                                        placeholderTextColor={COLORS.primaryFade}
                                        value={nuevoComentario}
                                        onChangeText={setNuevoComentario}
                                        multiline numberOfLines={3}
                                    />
                                    <TouchableOpacity style={styles.fotoComentarioBtn} onPress={seleccionarFotosComentario}>
                                        <MaterialIcons name="add-a-photo" size={18} color={COLORS.primary} />
                                        <Text style={styles.fotoComentarioBtnText}>Fotos ({comentarioFotos.length}/2)</Text>
                                    </TouchableOpacity>
                                    {comentarioFotos.length > 0 && (
                                        <View style={styles.fotosComentarioPreview}>
                                            {comentarioFotos.map((foto, index) => (
                                                <View key={index} style={{ position: "relative" }}>
                                                    <Image source={{ uri: foto.uri }} style={styles.fotoComentarioPreview} />
                                                    <TouchableOpacity style={globalStyles.fotoDelete} onPress={() => setComentarioFotos(comentarioFotos.filter((_, i) => i !== index))}>
                                                        <MaterialIcons name="close" size={14} color={COLORS.blanco} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    <TouchableOpacity style={[globalStyles.btnPrimary, enviando && { opacity: 0.7 }]} onPress={enviarComentario} disabled={enviando}>
                                        <Text style={globalStyles.btnPrimaryText}>{enviando ? "Enviando..." : "Enviar comentario"}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={<Text style={styles.sinComentarios}>No hay comentarios aún. ¡Sé el primero!</Text>}
                            renderItem={({ item }) => (
                                <View style={[styles.comentarioCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                                    <View style={styles.comentarioHeader}>
                                        <AvatarComentario avatarId={item.usuario?.avatarId} color={item.usuario?.colorAvatar} />
                                        <Text style={styles.comentarioUsuario}>{item.usuario?.nombre}</Text>
                                        <Text style={styles.comentarioFecha}>{formatFecha(item.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.comentarioTexto}>{item.comentario}</Text>
                                    {item.fotos && item.fotos.length > 0 && (
                                        <View style={styles.comentarioFotos}>
                                            {item.fotos.map((foto, index) => (
                                                <TouchableOpacity key={index} onPress={() => setFotoComentarioZoom(foto)}>
                                                    <Image source={{ uri: foto }} style={styles.comentarioFoto} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                            ListFooterComponent={<View style={{ height: 30 }} />}
                        />
                    )}
                </View>
            )}

            {/* MODAL EDITAR LUGAR */}
            <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={globalStyles.modalTitle}>Editar Lugar</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Nombre del lugar" placeholderTextColor={COLORS.primaryMedium} value={editNombre} onChangeText={setEditNombre} />
                            <TextInput style={[globalStyles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Localidad" placeholderTextColor={COLORS.primaryMedium} value={editLocalidad} onChangeText={setEditLocalidad} />
                            <View style={[styles.selectContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                                <Picker selectedValue={editCategoria} onValueChange={setEditCategoria} style={{ color: COLORS.primary }} dropdownIconColor={COLORS.primary}>
                                    <Picker.Item label="Selecciona categoría" value="" />
                                    {categorias.map((cat) => (<Picker.Item key={cat} label={cat} value={cat} />))}
                                </Picker>
                            </View>
                            <TouchableOpacity style={globalStyles.checkRow} onPress={() => setEditSiempreAbierto(!editSiempreAbierto)}>
                                <View style={[globalStyles.checkbox, editSiempreAbierto && globalStyles.checkboxActivo]}>
                                    {editSiempreAbierto && <MaterialIcons name="check" size={14} color={COLORS.blanco} />}
                                </View>
                                <Text style={globalStyles.checkLabel}>Siempre abierto / Sin horario</Text>
                            </TouchableOpacity>
                            {!editSiempreAbierto && (
                                <>
                                    <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraInicio(true)}>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                        <Text style={globalStyles.dateButtonText}>Apertura: {formatHora(editHoraInicio)}</Text>
                                    </TouchableOpacity>
                                    {showPickerHoraInicio && (
                                        <DateTimePicker value={editHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraInicio(false); if (date) setEditHoraInicio(date); }} />
                                    )}
                                    <TouchableOpacity style={[globalStyles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraFin(true)}>
                                        <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                                        <Text style={globalStyles.dateButtonText}>Cierre: {formatHora(editHoraFin)}</Text>
                                    </TouchableOpacity>
                                    {showPickerHoraFin && (
                                        <DateTimePicker value={editHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraFin(false); if (date) setEditHoraFin(date); }} />
                                    )}
                                </>
                            )}
                            <TextInput style={[globalStyles.input, globalStyles.inputMultiline, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.primary }]} placeholder="Descripción" placeholderTextColor={COLORS.primaryMedium} value={editDescripcion} onChangeText={setEditDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={styles.fotoButton} onPress={seleccionarFotosEdicion}>
                                <MaterialIcons name="add-a-photo" size={22} color={COLORS.primary} />
                                <Text style={styles.fotoButtonText}>Agregar fotos ({editFotos.length}/3)</Text>
                            </TouchableOpacity>
                            {editFotos.length > 0 && (
                                <View style={globalStyles.fotosPreview}>
                                    {editFotos.map((foto, index) => (
                                        <View key={index} style={{ position: "relative" }}>
                                            <Image source={{ uri: foto.uri }} style={globalStyles.fotoPreview} />
                                            <TouchableOpacity style={globalStyles.fotoDelete} onPress={() => setEditFotos(editFotos.filter((_, i) => i !== index))}>
                                                <MaterialIcons name="close" size={14} color={COLORS.blanco} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                            <TouchableOpacity style={[globalStyles.saveButton, guardandoEdicion && { opacity: 0.7 }]} onPress={handleGuardarEdicion} disabled={guardandoEdicion}>
                                <Text style={globalStyles.saveButtonText}>{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal zoom fotos del lugar */}
            <Modal visible={zoomVisible} transparent animationType="fade" onRequestClose={() => setZoomVisible(false)}>
                <View style={styles.modalZoom}>
                    <TouchableOpacity style={styles.modalCerrar} onPress={() => setZoomVisible(false)}>
                        <MaterialIcons name="close" size={30} color={COLORS.blanco} />
                    </TouchableOpacity>
                    <FlatList
                        ref={zoomRef} data={zoomFotos} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, i) => i.toString()} initialScrollIndex={zoomIndex}
                        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                        onScrollToIndexFailed={() => {}}
                        renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: "80%" }} resizeMode="contain" />}
                    />
                    <Text style={styles.zoomContador}>{zoomFotos.length > 1 ? "Desliza para ver más fotos" : ""}</Text>
                </View>
            </Modal>

            {/* Modal zoom fotos de comentario */}
            <Modal visible={!!fotoComentarioZoom} transparent animationType="fade" onRequestClose={() => setFotoComentarioZoom(null)}>
                <View style={styles.modalZoom}>
                    <TouchableOpacity style={styles.modalCerrar} onPress={() => setFotoComentarioZoom(null)}>
                        <MaterialIcons name="close" size={30} color={COLORS.blanco} />
                    </TouchableOpacity>
                    {fotoComentarioZoom && <Image source={{ uri: fotoComentarioZoom }} style={styles.fotoZoom} resizeMode="contain" />}
                </View>
            </Modal>
        </View>
    );
};

export default DetalleLugar;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 50 : 40, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.primary },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.primary, flex: 1, textAlign: "center", marginHorizontal: 10 },
    carruselContainer: { height: 220, position: "relative" },
    fotoCarrusel: { height: 220, resizeMode: "cover" },
    indicadores: { position: "absolute", bottom: 10, flexDirection: "row", alignSelf: "center", gap: 6 },
    indicador: { width: 8, height: 8, borderRadius: 4 },
    sinFotos: { height: 150, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: COLORS.primary },
    sinFotosText: { color: COLORS.primary, marginTop: 8, fontSize: 14 },
    pestanas: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.primary },
    pestana: { flex: 1, paddingVertical: 12, alignItems: "center" },
    pestanaActiva: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
    pestanaText: { fontSize: 14, fontWeight: "bold", color: COLORS.primaryFade },
    pestanaTextActiva: { color: COLORS.primary },
    contenido: { flex: 1, padding: 16 },
    infoCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.primaryMedium },
    descripcionContainer: { marginBottom: 12 },
    descripcionText: { fontSize: 14, color: COLORS.primary, marginTop: 6, lineHeight: 20 },
    sinComentarios: { textAlign: "center", color: COLORS.primary, marginTop: 20, fontWeight: "bold" },
    comentarioCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.primaryMedium, marginBottom: 10 },
    comentarioHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    comentarioUsuario: { fontSize: 13, fontWeight: "bold", color: COLORS.primary, flex: 1 },
    comentarioFecha: { fontSize: 11, color: COLORS.primaryFade },
    comentarioTexto: { fontSize: 14, color: COLORS.primary, lineHeight: 20 },
    comentarioFotos: { flexDirection: "row", gap: 8, marginTop: 10 },
    comentarioFoto: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primaryMedium },
    nuevoComentario: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.primaryMedium, marginBottom: 16 },
    miAvatarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    nuevoComentarioTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.primary },
    comentarioInput: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: COLORS.primary, marginBottom: 10, textAlignVertical: "top", minHeight: 80 },
    fotoComentarioBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
    fotoComentarioBtnText: { color: COLORS.primary, fontWeight: "bold", fontSize: 13 },
    fotosComentarioPreview: { flexDirection: "row", gap: 8, marginBottom: 10 },
    fotoComentarioPreview: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
    avatarComentario: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: COLORS.primary },
    avatarComentarioImg: { width: 24, height: 24 },
    modalZoom: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
    modalCerrar: { position: "absolute", top: Platform.OS === "ios" ? 55 : 40, right: 20, zIndex: 10 },
    fotoZoom: { width: width, height: "80%" },
    zoomContador: { position: "absolute", bottom: 40, color: "rgba(255,255,255,0.7)", fontSize: 13 },
    selectContainer: { borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, overflow: "hidden", marginBottom: 12 },
    fotoButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10, padding: 12, marginBottom: 12 },
    fotoButtonText: { color: COLORS.primary, fontWeight: "bold", fontSize: 14 },
});