import React, { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    Platform,
    Linking,
    Alert,
    Share,
    Modal,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

const DetalleEvento = ({ route, navigation }) => {
    const { evento: eventoInicial, miUsuarioId } = route.params;
    const { isDark } = useContext(ThemeContext);
    const [evento, setEvento] = useState(eventoInicial);
    const [fotoActiva, setFotoActiva] = useState(0);

    // Estados edición
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

    const esMiEvento = miUsuarioId && evento.usuario?._id && evento.usuario._id === miUsuarioId;

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatFechaDate = (date) => {
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
        if (!editNombre.trim()) {
            Alert.alert("Error", "El nombre es obligatorio");
            return;
        }
        try {
            setGuardandoEdicion(true);
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`https://ximbapp.com/api/eventos/${evento._id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: editNombre,
                    descripcion: editDescripcion,
                    costos: editCostos ? parseFloat(editCostos) : 0,
                    fechaInicio: editFechaInicio.toISOString(),
                    fechaFinal: editFechaFinal.toISOString(),
                    horario: `${formatHora(editHoraInicio)} - ${formatHora(editHoraFin)}`,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setEvento(data.evento);
                setEditModalVisible(false);
                Alert.alert("✅", "Evento actualizado correctamente");
            } else {
                Alert.alert("Error", data.mensaje);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el evento");
        } finally {
            setGuardandoEdicion(false);
        }
    };

    const handleEliminar = () => {
        Alert.alert(
            "Eliminar evento",
            `¿Estás seguro que deseas eliminar "${evento.nombre}"? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem("token");
                            const response = await fetch(`https://ximbapp.com/api/eventos/${evento._id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (response.ok) {
                                Alert.alert("✅", "Evento eliminado correctamente");
                                navigation.goBack();
                            } else {
                                const data = await response.json();
                                Alert.alert("Error", data.mensaje);
                            }
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar el evento");
                        }
                    }
                }
            ]
        );
    };

    const handleComoLlegar = () => {
        const lat = evento.coordenadas?.latitud || evento.lugar?.coordenadas?.latitud;
        const lng = evento.coordenadas?.longitud || evento.lugar?.coordenadas?.longitud;
        if (!lat || !lng) {
            Alert.alert("Aviso", "Este evento no tiene ubicación registrada");
            return;
        }
        if (Platform.OS === "web") {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
            return;
        }
        Alert.alert(
            "¿Cómo quieres llegar?",
            "Selecciona una aplicación de navegación",
            [
                { text: "Waze", onPress: () => Linking.openURL(`waze://?ll=${lat},${lng}&navigate=yes`).catch(() => Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`)) },
                { text: "Google Maps", onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`) },
                { text: "Apple Maps", onPress: () => Linking.openURL(`maps://?daddr=${lat},${lng}`), ...(Platform.OS !== "ios" && { style: "destructive" }) },
                { text: "Cancelar", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    const handleCompartir = async () => {
        try {
            await Share.share({
                message: `${evento.nombre}\n${formatFecha(evento.fechaInicio)} - ${formatFecha(evento.fechaFinal)}\n\nDescubierto en Ximbapp\nhttps://ximbapp.com`,
                title: evento.nombre,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#ff6600" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{evento.nombre}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {evento.fotos && evento.fotos.length > 0 ? (
                    <View style={styles.carruselContainer}>
                        <FlatList
                            data={evento.fotos}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setFotoActiva(index);
                            }}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={[styles.fotoCarrusel, { width }]} />
                            )}
                        />
                        <View style={styles.indicadores}>
                            {evento.fotos.map((_, index) => (
                                <View key={index} style={[styles.indicador, { backgroundColor: index === fotoActiva ? "#ff6600" : "rgba(255,255,255,0.5)" }]} />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.sinFotos}>
                        <MaterialIcons name="image-not-supported" size={50} color="#ff6600" />
                        <Text style={styles.sinFotosText}>Sin fotos</Text>
                    </View>
                )}

                <View style={styles.contenido}>
                    <View style={[styles.infoCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="event" size={20} color="#ff6600" />
                            <Text style={styles.infoLabel}>Inicio:</Text>
                            <Text style={styles.infoValue}>{formatFecha(evento.fechaInicio)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="event" size={20} color="#ff6600" />
                            <Text style={styles.infoLabel}>Final:</Text>
                            <Text style={styles.infoValue}>{formatFecha(evento.fechaFinal)}</Text>
                        </View>
                        {evento.horario ? (
                            <View style={styles.infoRow}>
                                <MaterialIcons name="access-time" size={20} color="#ff6600" />
                                <Text style={styles.infoLabel}>Horario:</Text>
                                <Text style={styles.infoValue}>{evento.horario}</Text>
                            </View>
                        ) : null}
                        <View style={styles.infoRow}>
                            <MaterialIcons name="attach-money" size={20} color="#ff6600" />
                            <Text style={styles.infoLabel}>Costo:</Text>
                            <Text style={styles.infoValue}>{evento.costos > 0 ? `$${evento.costos}` : "Gratis"}</Text>
                        </View>
                        {evento.lugar ? (
                            <View style={styles.infoRow}>
                                <MaterialIcons name="place" size={20} color="#ff6600" />
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
                            <View style={styles.infoRow}>
                                <MaterialIcons name="person" size={20} color="#ff6600" />
                                <Text style={styles.infoLabel}>Publicado por:</Text>
                                <Text style={styles.infoValue}>{evento.usuario.nombre}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.botonesContainer}>
                        <TouchableOpacity style={[styles.boton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", borderColor: "#ff6600" }]} onPress={handleCompartir}>
                            <MaterialIcons name="share" size={22} color="#ff6600" />
                            <Text style={[styles.botonText, { color: "#ff6600" }]}>Compartir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.boton, { backgroundColor: "#ff6600" }]} onPress={handleComoLlegar}>
                            <MaterialIcons name="directions" size={22} color="#fff" />
                            <Text style={[styles.botonText, { color: "#fff" }]}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botones editar/eliminar — solo si es mi evento */}
                    {esMiEvento && (
                        <View style={styles.botonesContainer}>
                            <TouchableOpacity style={[styles.boton, { backgroundColor: "#3A86FF" }]} onPress={abrirEdicion}>
                                <MaterialIcons name="edit" size={22} color="#fff" />
                                <Text style={[styles.botonText, { color: "#fff" }]}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.boton, { backgroundColor: "#FF3A3A" }]} onPress={handleEliminar}>
                                <MaterialIcons name="delete" size={22} color="#fff" />
                                <Text style={[styles.botonText, { color: "#fff" }]}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* MODAL EDITAR EVENTO */}
            <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Evento</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <MaterialIcons name="close" size={26} color="#ff6600" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#ff6600" }]}
                                placeholder="Nombre del evento"
                                placeholderTextColor="rgba(255,102,0,0.6)"
                                value={editNombre}
                                onChangeText={setEditNombre}
                            />

                            <Text style={styles.modalSubtitle}>Fecha de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerFechaInicio(true)}>
                                <MaterialIcons name="event" size={20} color="#ff6600" />
                                <Text style={styles.dateButtonText}>{formatFechaDate(editFechaInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerFechaInicio && (
                                <DateTimePicker value={editFechaInicio} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerFechaInicio(false); if (date) setEditFechaInicio(date); }} />
                            )}

                            <Text style={styles.modalSubtitle}>Fecha final</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerFechaFinal(true)}>
                                <MaterialIcons name="event" size={20} color="#ff6600" />
                                <Text style={styles.dateButtonText}>{formatFechaDate(editFechaFinal)}</Text>
                            </TouchableOpacity>
                            {showPickerFechaFinal && (
                                <DateTimePicker value={editFechaFinal} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={editFechaInicio} onChange={(e, date) => { setShowPickerFechaFinal(false); if (date) setEditFechaFinal(date); }} />
                            )}

                            <Text style={styles.modalSubtitle}>Hora de inicio</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerHoraInicio(true)}>
                                <MaterialIcons name="access-time" size={20} color="#ff6600" />
                                <Text style={styles.dateButtonText}>{formatHora(editHoraInicio)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraInicio && (
                                <DateTimePicker value={editHoraInicio} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraInicio(false); if (date) setEditHoraInicio(date); }} />
                            )}

                            <Text style={styles.modalSubtitle}>Hora de cierre</Text>
                            <TouchableOpacity style={[styles.dateButton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]} onPress={() => setShowPickerHoraFin(true)}>
                                <MaterialIcons name="access-time" size={20} color="#ff6600" />
                                <Text style={styles.dateButtonText}>{formatHora(editHoraFin)}</Text>
                            </TouchableOpacity>
                            {showPickerHoraFin && (
                                <DateTimePicker value={editHoraFin} mode="time" is24Hour={false} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(e, date) => { setShowPickerHoraFin(false); if (date) setEditHoraFin(date); }} />
                            )}

                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#ff6600" }]}
                                placeholder="Costo (0 si es gratis)"
                                placeholderTextColor="rgba(255,102,0,0.6)"
                                value={editCostos}
                                onChangeText={setEditCostos}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.inputMultiline, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", color: "#ff6600" }]}
                                placeholder="Descripción"
                                placeholderTextColor="rgba(255,102,0,0.6)"
                                value={editDescripcion}
                                onChangeText={setEditDescripcion}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity style={[styles.saveButton, guardandoEdicion && { opacity: 0.7 }]} onPress={handleGuardarEdicion} disabled={guardandoEdicion}>
                                <Text style={styles.saveButtonText}>{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default DetalleEvento;

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
        borderBottomColor: "#ff6600",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ff6600", flex: 1, textAlign: "center", marginHorizontal: 10 },
    carruselContainer: { height: 220, position: "relative" },
    fotoCarrusel: { height: 220, resizeMode: "cover" },
    indicadores: { position: "absolute", bottom: 10, flexDirection: "row", alignSelf: "center", gap: 6 },
    indicador: { width: 8, height: 8, borderRadius: 4 },
    sinFotos: { height: 150, alignItems: "center", justifyContent: "center", borderBottomWidth: 1, borderBottomColor: "#ff6600" },
    sinFotosText: { color: "#ff6600", marginTop: 8, fontSize: 14 },
    contenido: { padding: 16 },
    infoCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(255,102,0,0.3)", marginBottom: 16 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    infoLabel: { fontSize: 13, fontWeight: "bold", color: "#ff6600" },
    infoValue: { fontSize: 14, color: "#ff6600", flex: 1 },
    descripcionContainer: { marginBottom: 12 },
    descripcionText: { fontSize: 14, color: "#ff6600", marginTop: 6, lineHeight: 20 },
    botonesContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
    boton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "transparent" },
    botonText: { fontWeight: "bold", fontSize: 14 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { width: "100%", borderRadius: 15, borderWidth: 1, borderColor: "#ff6600", padding: 18, maxHeight: "85%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#ff6600" },
    modalSubtitle: { marginTop: 4, fontSize: 13, fontWeight: "bold", color: "#ff6600", marginBottom: 6 },
    input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: "#ff6600", marginBottom: 12 },
    inputMultiline: { height: 80, textAlignVertical: "top" },
    dateButton: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: "#ff6600", marginBottom: 12 },
    dateButtonText: { color: "#ff6600", fontSize: 15, fontWeight: "bold" },
    saveButton: { backgroundColor: "#ff6600", padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
    saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});