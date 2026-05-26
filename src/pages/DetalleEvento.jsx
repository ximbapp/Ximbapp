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
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
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

const DetalleEvento = ({ route, navigation }) => {
    const { evento: eventoInicial, miUsuarioId } = route.params;
    const { isDark } = useContext(ThemeContext);
    const [evento, setEvento] = useState(eventoInicial);
    const [fotoActiva, setFotoActiva] = useState(0);
    const [pestanaActiva, setPestanaActiva] = useState("info");

    // Estados comentarios
    const [comentarios, setComentarios] = useState([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [comentarioFotos, setComentarioFotos] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [fotoComentarioZoom, setFotoComentarioZoom] = useState(null);
    const [miAvatarId, setMiAvatarId] = useState("colibri");
    const [miColorAvatar, setMiColorAvatar] = useState(COLORS.avatarMorado);

    // Estados edición comentario
    const [editComentarioModal, setEditComentarioModal] = useState(false);
    const [comentarioEditando, setComentarioEditando] = useState(null);
    const [textoEditandoComentario, setTextoEditandoComentario] = useState("");
    const [guardandoComentario, setGuardandoComentario] = useState(false);

    // Estados edición evento
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editNombre, setEditNombre] = useState("");
    const [editDescripcion, setEditDescripcion] = useState("");
    const [editCostos, setEditCostos] = useState("");
    const [editFechaInicio, setEditFechaInicio] = useState(new Date());
    const [editFechaFinal, setEditFechaFinal] = useState(new Date());
    const [editHoraInicio, setEditHoraInicio] = useState(new Date());
    const [editHoraFin, setEditHoraFin] = useState(new Date());
    const [showPickerFechaInicio, setShowPickerFechaInicio] = useState(false);
    const [showPickerFechaFinal, setShowPickerFechaFinal] = useState(false);
    const [showPickerHoraInicio, setShowPickerHoraInicio] = useState(false);
    const [showPickerHoraFin, setShowPickerHoraFin] = useState(false);
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);

    const flatListRef = useRef(null);

    const esMiEvento = miUsuarioId && evento.usuario?._id && evento.usuario._id === miUsuarioId;

    useEffect(() => {
        cargarComentarios();
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

    const cargarComentarios = async () => {
        try {
            setLoadingComentarios(true);
            const response = await fetch(`${API_URL}/comentarios/evento/${evento._id}`);
            const data = await response.json();
            setComentarios(data.comentarios || []);
        } catch (error) { console.log("Error cargando comentarios:", error); }
        finally { setLoadingComentarios(false); }
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
            formData.append("evento", evento._id);
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

    const abrirEditarComentario = (item) => {
        setComentarioEditando(item);
        setTextoEditandoComentario(item.comentario);
        setEditComentarioModal(true);
    };

    const handleGuardarComentario = async () => {
        if (!textoEditandoComentario.trim()) { Alert.alert("Error", "El comentario no puede estar vacío"); return; }
        try {
            setGuardandoComentario(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/comentarios/${comentarioEditando._id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ comentario: textoEditandoComentario.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setEditComentarioModal(false);
                await cargarComentarios();
                Alert.alert("Comentario actualizado");
            } else Alert.alert("Error", data.mensaje);
        } catch (error) { Alert.alert("Error", "No se pudo actualizar el comentario"); }
        finally { setGuardandoComentario(false); }
    };

    const handleEliminarComentario = (item) => {
        Alert.alert("Eliminar comentario", "¿Estás seguro que deseas eliminar este comentario?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar", style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        const response = await fetch(`${API_URL}/comentarios/${item._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                        if (response.ok) await cargarComentarios();
                        else { const data = await response.json(); Alert.alert("Error", data.mensaje); }
                    } catch (error) { Alert.alert("Error", "No se pudo eliminar el comentario"); }
                }
            }
        ]);
    };

    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    const formatFechaDate = (date) => date.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" });
    const formatHora = (date) => date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
    const formatFechaCorta = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

    const abrirEdicion = () => {
        setEditNombre(evento.nombre || "");
        setEditDescripcion(evento.descripcion || "");
        setEditCostos(evento.costos?.toString() || "0");
        setEditFechaInicio(new Date(evento.fechaInicio));
        setEditFechaFinal(new Date(evento.fechaFinal));
        setEditHoraInicio(new Date());
        setEditHoraFin(new Date());
        setEditModalVisible(true);
    };

    const handleGuardarEdicion = async () => {
        if (!editNombre.trim()) { Alert.alert("Error", "El nombre es obligatorio"); return; }
        try {
            setGuardandoEdicion(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/eventos/${evento._id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: editNombre, descripcion: editDescripcion,
                    costos: editCostos ? parseFloat(editCostos) : 0,
                    fechaInicio: editFechaInicio.toISOString(),
                    fechaFinal: editFechaFinal.toISOString(),
                    horario: `${formatHora(editHoraInicio)} - ${formatHora(editHoraFin)}`,
                }),
            });
            const data = await response.json();
            if (response.ok) { setEvento(data.evento); setEditModalVisible(false); Alert.alert("Evento actualizado correctamente"); }
            else Alert.alert("Error", data.mensaje);
        } catch (error) { Alert.alert("Error", "No se pudo actualizar el evento"); }
        finally { setGuardandoEdicion(false); }
    };

    const handleEliminar = () => {
        Alert.alert("Eliminar evento", `¿Estás seguro que deseas eliminar "${evento.nombre}"? Esta acción no se puede deshacer.`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar", style: "destructive",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        const response = await fetch(`${API_URL}/eventos/${evento._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                        if (response.ok) { Alert.alert("Evento eliminado correctamente"); navigation.goBack(); }
                        else { const data = await response.json(); Alert.alert("Error", data.mensaje); }
                    } catch (error) { Alert.alert("Error", "No se pudo eliminar el evento"); }
                }
            }
        ]);
    };

    const handleComoLlegar = () => {
        const lat = evento.coordenadas?.latitud || evento.lugar?.coordenadas?.latitud;
        const lng = evento.coordenadas?.longitud || evento.lugar?.coordenadas?.longitud;
        if (!lat || !lng) { Alert.alert("Aviso", "Este evento no tiene ubicación registrada"); return; }
        if (Platform.OS === "web") { Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`); return; }
        Alert.alert("¿Cómo quieres llegar?", "Selecciona una aplicación de navegación", [
            { text: "Waze", onPress: () => Linking.openURL(`waze://?ll=${lat},${lng}&navigate=yes`).catch(() => Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`)) },
            { text: "Google Maps", onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`) },
            { text: "Apple Maps", onPress: () => Linking.openURL(`maps://?daddr=${lat},${lng}`), ...(Platform.OS !== "ios" && { style: "destructive" }) },
            { text: "Cancelar", style: "cancel" },
        ], { cancelable: true });
    };

    const handleCompartir = async () => {
        try {
            await Share.share({ 
                message: `${evento.nombre}\n${formatFecha(evento.fechaInicio)}${evento.fechaFinal ? ` - ${formatFecha(evento.fechaFinal)}` : ''}\n\nDescubierto en Ximbapp\nhttps://ximbapp.com`, 
                title: evento.nombre 
            });
        } catch (error) { console.log(error); }
    };

    const AvatarComentario = ({ avatarId, color }) => (
        <View style={[styles.avatarComentario, { backgroundColor: color || COLORS.avatarMorado }]}>
            <Image source={getAvatarSource(avatarId || "colibri")} style={styles.avatarComentarioImg} resizeMode="contain" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color={COLORS.evento} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{evento.nombre}</Text>
                <View style={{ width: 28 }} />
            </View>

            {evento.fotos && evento.fotos.length > 0 ? (
                <View style={styles.carruselContainer}>
                    <FlatList
                        data={evento.fotos} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onScroll={(e) => setFotoActiva(Math.round(e.nativeEvent.contentOffset.x / width))}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => <Image source={{ uri: item }} style={[styles.fotoCarrusel, { width }]} />}
                    />
                    <View style={styles.indicadores}>
                        {evento.fotos.map((_, index) => (
                            <View key={index} style={[styles.indicador, { backgroundColor: index === fotoActiva ? COLORS.evento : "rgba(255,255,255,0.5)" }]} />
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.sinFotos}>
                    <MaterialIcons name="image-not-supported" size={50} color={COLORS.evento} />
                    <Text style={styles.sinFotosText}>Sin fotos</Text>
                </View>
            )}

            {/* Pestañas */}
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.contenido}>
                        <View style={[styles.infoCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                            <View style={globalStyles.infoRow}>
                                <MaterialIcons name="event" size={20} color={COLORS.evento} />
                                <Text style={styles.infoLabel}>Inicio:</Text>
                                <Text style={styles.infoValue}>{formatFecha(evento.fechaInicio)}</Text>
                            </View>
                            <View style={globalStyles.infoRow}>
                                <MaterialIcons name="event" size={20} color={COLORS.evento} />
                                <Text style={styles.infoLabel}>Final:</Text>
                                <Text style={styles.infoValue}>{evento.fechaFinal ? formatFecha(evento.fechaFinal) : "No especificado"}</Text>
                            </View>
                            {evento.horario ? (
                                <View style={globalStyles.infoRow}>
                                    <MaterialIcons name="access-time" size={20} color={COLORS.evento} />
                                    <Text style={styles.infoLabel}>Horario:</Text>
                                    <Text style={styles.infoValue}>{evento.horario}</Text>
                                </View>
                            ) : null}
                            <View style={globalStyles.infoRow}>
                                <MaterialIcons name="attach-money" size={20} color={COLORS.evento} />
                                <Text style={styles.infoLabel}>Costo:</Text>
                                <Text style={styles.infoValue}>{evento.costos > 0 ? `$${evento.costos}` : "Gratis"}</Text>
                            </View>
                            {evento.lugar ? (
                                <View style={globalStyles.infoRow}>
                                    <MaterialIcons name="place" size={20} color={COLORS.evento} />
                                    <Text style={styles.infoLabel}>Lugar:</Text>
                                    <Text style={styles.infoValue}>{evento.lugar.nombre}</Text>
                                </View>
                            ) : null}
                            {evento.descripcion ? (
                                <View style={styles.descripcionContainer}>
                                    <Text style={styles.infoLabel}>Descripción:</Text>
                                    <Text style={styles.descripcionText}>{evento.descripcion}</Text>
                                </View>
                            ) : null}
                            {evento.usuario ? (
                                <View style={globalStyles.infoRow}>
                                    <MaterialIcons name="person" size={20} color={COLORS.evento} />
                                    <Text style={styles.infoLabel}>Publicado por:</Text>
                                    <Text style={styles.infoValue}>{evento.usuario.nombre}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.botonesContainer}>
                            <TouchableOpacity style={[styles.boton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, borderColor: COLORS.evento }]} onPress={handleCompartir}>
                                <MaterialIcons name="share" size={22} color={COLORS.evento} />
                                <Text style={[styles.botonText, { color: COLORS.evento }]}>Compartir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.boton, { backgroundColor: COLORS.evento }]} onPress={handleComoLlegar}>
                                <MaterialIcons name="directions" size={22} color={COLORS.blanco} />
                                <Text style={[styles.botonText, { color: COLORS.blanco }]}>Cómo llegar</Text>
                            </TouchableOpacity>
                        </View>

                        {esMiEvento && (
                            <View style={styles.botonesContainer}>
                                <TouchableOpacity style={[styles.boton, { backgroundColor: COLORS.azul }]} onPress={abrirEdicion}>
                                    <MaterialIcons name="edit" size={22} color={COLORS.blanco} />
                                    <Text style={[styles.botonText, { color: COLORS.blanco }]}>Editar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.boton, { backgroundColor: COLORS.rojo }]} onPress={handleEliminar}>
                                    <MaterialIcons name="delete" size={22} color={COLORS.blanco} />
                                    <Text style={[styles.botonText, { color: COLORS.blanco }]}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.contenidoComentarios}>
                    {loadingComentarios ? (
                        <ActivityIndicator color={COLORS.evento} style={{ marginTop: 20 }} />
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
                                        style={[styles.comentarioInput, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, color: COLORS.evento }]}
                                        placeholder="Escribe tu comentario..."
                                        placeholderTextColor={COLORS.eventoMedium}
                                        value={nuevoComentario}
                                        onChangeText={setNuevoComentario}
                                        multiline numberOfLines={3}
                                    />
                                    <TouchableOpacity style={styles.fotoComentarioBtn} onPress={seleccionarFotosComentario}>
                                        <MaterialIcons name="add-a-photo" size={18} color={COLORS.evento} />
                                        <Text style={styles.fotoComentarioBtnText}>Fotos ({comentarioFotos.length}/2)</Text>
                                    </TouchableOpacity>
                                    {comentarioFotos.length > 0 && (
                                        <View style={styles.fotosComentarioPreview}>
                                            {comentarioFotos.map((foto, index) => (
                                                <View key={index} style={{ position: "relative" }}>
                                                    <Image source={{ uri: foto.uri }} style={styles.fotoComentarioPreview} />
                                                    <TouchableOpacity style={styles.fotoDelete} onPress={() => setComentarioFotos(comentarioFotos.filter((_, i) => i !== index))}>
                                                        <MaterialIcons name="close" size={14} color={COLORS.blanco} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                    <TouchableOpacity style={[styles.enviarBtn, enviando && { opacity: 0.7 }]} onPress={enviarComentario} disabled={enviando}>
                                        <Text style={styles.enviarBtnText}>{enviando ? "Enviando..." : "Enviar comentario"}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                            ListEmptyComponent={<Text style={styles.sinComentarios}>No hay comentarios aún. Se el primero.</Text>}
                            renderItem={({ item }) => {
                                const esMiComentario = miUsuarioId && item.usuario?._id && item.usuario._id === miUsuarioId;
                                return (
                                    <View style={[styles.comentarioCard, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]}>
                                        <View style={styles.comentarioHeader}>
                                            <AvatarComentario avatarId={item.usuario?.avatarId} color={item.usuario?.colorAvatar} />
                                            <Text style={styles.comentarioUsuario}>{item.usuario?.nombre}</Text>
                                            <Text style={styles.comentarioFecha}>{formatFechaCorta(item.createdAt)}</Text>
                                            {esMiComentario && (
                                                <View style={styles.comentarioBotones}>
                                                    <TouchableOpacity onPress={() => abrirEditarComentario(item)} style={styles.btnComentarioAccion}>
                                                        <MaterialIcons name="edit" size={16} color={COLORS.azul} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleEliminarComentario(item)} style={styles.btnComentarioAccion}>
                                                        <MaterialIcons name="delete" size={16} color={COLORS.rojo} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
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
                                );
                            }}
                            ListFooterComponent={<View style={{ height: 30 }} />}
                        />
                    )}
                </View>
            )}

            {/* MODAL EDITAR COMENTARIO */}
            <Modal visible={editComentarioModal} transparent animationType="slide" onRequestClose={() => setEditComentarioModal(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[globalStyles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar comentario</Text>
                            <TouchableOpacity onPress={() => setEditComentarioModal(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.evento} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.comentarioInput, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.evento, marginTop: 8 }]}
                            value={textoEditandoComentario}
                            onChangeText={setTextoEditandoComentario}
                            multiline numberOfLines={4}
                            placeholderTextColor={COLORS.eventoMedium}
                        />
                        <TouchableOpacity style={[styles.enviarBtn, guardandoComentario && { opacity: 0.7 }]} onPress={handleGuardarComentario} disabled={guardandoComentario}>
                            <Text style={styles.enviarBtnText}>{guardandoComentario ? "Guardando..." : "Guardar cambios"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL EDITAR EVENTO */}
            <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <View style={globalStyles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <View style={globalStyles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Evento</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color={COLORS.evento} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput style={[styles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.evento }]} placeholder="Nombre del evento" placeholderTextColor={COLORS.eventoMedium} value={editNombre} onChangeText={setEditNombre} />
                            <Text style={styles.modalSubtitle}>Fecha de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerFechaInicio(true)}>
                                <MaterialIcons name="event" size={20} color={COLORS.evento} />
                                <Text style={styles.dateButtonText}>{formatFechaDate(editFechaInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerFechaInicio && (<DateTimePicker value={editFechaInicio} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerFechaInicio(false); if (date) setEditFechaInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Fecha final</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerFechaFinal(true)}>
                                <MaterialIcons name="event" size={20} color={COLORS.evento} />
                                <Text style={styles.dateButtonText}>{formatFechaDate(editFechaFinal)}</Text>
                            </TouchableOpacity>
                            {showPickerFechaFinal && (<DateTimePicker value={editFechaFinal} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={editFechaInicio} onChange={(e, date) => { setShowPickerFechaFinal(false); if (date) setEditFechaFinal(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraInicio(true)}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.evento} />
                                <Text style={styles.dateButtonText}>{formatHora(editHoraInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraInicio && (<DateTimePicker value={editHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraInicio(false); if (date) setEditHoraInicio(date); }} />)}
                            <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard }]} onPress={() => setShowPickerHoraFin(true)}>
                                <MaterialIcons name="access-time" size={20} color={COLORS.evento} />
                                <Text style={styles.dateButtonText}>{formatHora(editHoraFin)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraFin && (<DateTimePicker value={editHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraFin(false); if (date) setEditHoraFin(date); }} />)}
                            <TextInput style={[styles.input, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.evento }]} placeholder="Costo (0 si es gratis)" placeholderTextColor={COLORS.eventoMedium} value={editCostos} onChangeText={setEditCostos} keyboardType="numeric" />
                            <TextInput style={[styles.input, globalStyles.inputMultiline, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightCard, color: COLORS.evento }]} placeholder="Descripción" placeholderTextColor={COLORS.eventoMedium} value={editDescripcion} onChangeText={setEditDescripcion} multiline numberOfLines={3} />
                            <TouchableOpacity style={[styles.saveButton, guardandoEdicion && { opacity: 0.7 }]} onPress={handleGuardarEdicion} disabled={guardandoEdicion}>
                                <Text style={styles.enviarBtnText}>{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
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

export default DetalleEvento;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 50 : 40, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.evento },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.evento, flex: 1, textAlign: "center", marginHorizontal: 10 },
    carruselContainer: { height: 220, position: "relative" },
    fotoCarrusel: { height: 220, resizeMode: "cover" },
    indicadores: { position: "absolute", bottom: 10, flexDirection: "row", alignSelf: "center", gap: 6 },
    indicador: { width: 8, height: 8, borderRadius: 4 },
    sinFotos: { height: 150, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: COLORS.evento },
    sinFotosText: { color: COLORS.evento, marginTop: 8, fontSize: 14 },
    pestanas: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.evento },
    pestana: { flex: 1, paddingVertical: 12, alignItems: "center" },
    pestanaActiva: { borderBottomWidth: 3, borderBottomColor: COLORS.evento },
    pestanaText: { fontSize: 14, fontWeight: "bold", color: COLORS.eventoMedium },
    pestanaTextActiva: { color: COLORS.evento },
    contenido: { padding: 16 },
    contenidoComentarios: { flex: 1, padding: 16 },
    infoCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.eventoMedium, marginBottom: 16 },
    infoLabel: { fontSize: 13, fontWeight: "bold", color: COLORS.evento },
    infoValue: { fontSize: 14, color: COLORS.evento, flex: 1 },
    descripcionContainer: { marginBottom: 12 },
    descripcionText: { fontSize: 14, color: COLORS.evento, marginTop: 6, lineHeight: 20 },
    botonesContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
    boton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "transparent" },
    botonText: { fontWeight: "bold", fontSize: 14 },
    sinComentarios: { textAlign: "center", color: COLORS.evento, marginTop: 20, fontWeight: "bold" },
    comentarioCard: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.eventoMedium, marginBottom: 10 },
    comentarioHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    comentarioUsuario: { fontSize: 13, fontWeight: "bold", color: COLORS.evento, flex: 1 },
    comentarioFecha: { fontSize: 11, color: COLORS.eventoMedium },
    comentarioBotones: { flexDirection: "row", gap: 4 },
    btnComentarioAccion: { padding: 4 },
    comentarioTexto: { fontSize: 14, color: COLORS.evento, lineHeight: 20 },
    comentarioFotos: { flexDirection: "row", gap: 8, marginTop: 10 },
    comentarioFoto: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: COLORS.eventoMedium },
    nuevoComentario: { borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.eventoMedium, marginBottom: 16 },
    miAvatarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    nuevoComentarioTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.evento },
    comentarioInput: { borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: COLORS.evento, marginBottom: 10, textAlignVertical: "top", minHeight: 80 },
    fotoComentarioBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
    fotoComentarioBtnText: { color: COLORS.evento, fontWeight: "bold", fontSize: 13 },
    fotosComentarioPreview: { flexDirection: "row", gap: 8, marginBottom: 10 },
    fotoComentarioPreview: { width: 70, height: 70, borderRadius: 8, borderWidth: 1, borderColor: COLORS.evento },
    fotoDelete: { position: "absolute", top: -6, right: -6, backgroundColor: COLORS.evento, borderRadius: 10, width: 18, height: 18, alignItems: "center", justifyContent: "center" },
    enviarBtn: { backgroundColor: COLORS.evento, padding: 12, borderRadius: 10, alignItems: "center" },
    enviarBtnText: { color: COLORS.blanco, fontWeight: "bold", fontSize: 14 },
    avatarComentario: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: COLORS.evento },
    avatarComentarioImg: { width: 24, height: 24 },
    modalContent: { width: "100%", borderRadius: 15, borderWidth: 1, borderColor: COLORS.evento, padding: 18, maxHeight: "85%" },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.evento },
    modalSubtitle: { marginTop: 4, fontSize: 13, fontWeight: "bold", color: COLORS.evento, marginBottom: 6 },
    input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: COLORS.evento, marginBottom: 12 },
    dateButton: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.evento, marginBottom: 12 },
    dateButtonText: { color: COLORS.evento, fontSize: 15, fontWeight: "bold" },
    saveButton: { backgroundColor: COLORS.evento, padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
    modalZoom: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
    modalCerrar: { position: "absolute", top: Platform.OS === "ios" ? 55 : 40, right: 20, zIndex: 10 },
    fotoZoom: { width: width, height: "80%" },
});