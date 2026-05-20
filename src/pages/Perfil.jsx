import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    TextInput,
    Alert,
    Image,
    Modal,
} from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const COLORES_AVATAR = [
    "#FFB3D1",
    "#C9B3FF",
    "#B3D9FF",
    "#B3FFD1",
    "#FFF5B3",
    "#FFD9B3",
    "#FFB3B3",
    "#E0E0E0",
];

const Perfil = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [avatarSeleccionado, setAvatarSeleccionado] = useState("colibri");
    const [colorAvatar, setColorAvatar] = useState("#C9B3FF");
    const [modalAvatar, setModalAvatar] = useState(false);

    const [nombre, setNombre] = useState("");
    const [apellidoP, setApellidoP] = useState("");
    const [apellidoM, setApellidoM] = useState("");
    const [telefono, setTelefono] = useState("");
    const [genero, setGenero] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [alcaldiaMunicipio, setAlcaldiaMunicipio] = useState("");
    const [nacionalidad, setNacionalidad] = useState("");

    useEffect(() => {
        cargarPerfil();
        cargarAvatar();
    }, []);

    const cargarAvatar = async () => {
        try {
            const avatar = await AsyncStorage.getItem('avatarSeleccionado');
            const color = await AsyncStorage.getItem('colorAvatar');
            if (avatar) setAvatarSeleccionado(avatar);
            if (color) setColorAvatar(color);
        } catch (e) {}
    };

    const guardarAvatarEnBD = async (avatarId, color) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API_URL}/auth/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatarId, colorAvatar: color })
            });
        } catch (e) {}
    };

    const seleccionarAvatar = async (id) => {
        setAvatarSeleccionado(id);
        await AsyncStorage.setItem('avatarSeleccionado', id);
        await guardarAvatarEnBD(id, colorAvatar);
    };

    const seleccionarColor = async (color) => {
        setColorAvatar(color);
        await AsyncStorage.setItem('colorAvatar', color);
        await guardarAvatarEnBD(avatarSeleccionado, color);
    };

    const getAvatarSource = () => {
        const av = AVATARES.find(a => a.id === avatarSeleccionado);
        return av ? av.source : AVATARES[1].source;
    };

    const cargarPerfil = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/perfil`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsuario(data.usuario);
                setNombre(data.usuario.nombre || "");
                setApellidoP(data.usuario.apellidoP || "");
                setApellidoM(data.usuario.apellidoM || "");
                setTelefono(data.usuario.telefono || "");
                setGenero(data.usuario.genero || "");
                setCodigoPostal(data.usuario.codigoPostal || "");
                setAlcaldiaMunicipio(data.usuario.alcaldiaMunicipio || "");
                setNacionalidad(data.usuario.nacionalidad || "");
                // Cargar avatar desde BD si existe
                if (data.usuario.avatarId) {
                    setAvatarSeleccionado(data.usuario.avatarId);
                    await AsyncStorage.setItem('avatarSeleccionado', data.usuario.avatarId);
                }
                if (data.usuario.colorAvatar) {
                    setColorAvatar(data.usuario.colorAvatar);
                    await AsyncStorage.setItem('colorAvatar', data.usuario.colorAvatar);
                }
            }
        } catch (error) {
            console.log('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardar = async () => {
        if (!nombre.trim() || !apellidoP.trim()) {
            Alert.alert("Error", "Nombre y apellido paterno son obligatorios");
            return;
        }
        try {
            setGuardando(true);
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre, apellidoP, apellidoM, telefono,
                    genero, codigoPostal, alcaldiaMunicipio, nacionalidad
                })
            });
            const data = await response.json();
            if (response.ok) {
                setUsuario(data.usuario);
                setEditando(false);
                Alert.alert("Perfil actualizado correctamente");
            } else {
                Alert.alert("Error", data.mensaje);
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo actualizar el perfil");
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelar = () => {
        setNombre(usuario?.nombre || "");
        setApellidoP(usuario?.apellidoP || "");
        setApellidoM(usuario?.apellidoM || "");
        setTelefono(usuario?.telefono || "");
        setGenero(usuario?.genero || "");
        setCodigoPostal(usuario?.codigoPostal || "");
        setAlcaldiaMunicipio(usuario?.alcaldiaMunicipio || "");
        setNacionalidad(usuario?.nacionalidad || "");
        setEditando(false);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const anio = date.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                <ActivityIndicator size="large" color="#e6007e" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff", alignItems: Platform.OS === "web" ? "center" : "stretch" }]}>
            <View style={styles.webWrapper}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>

                <Text style={styles.title}>Perfil</Text>

                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* AVATAR */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={() => setModalAvatar(true)} style={[styles.avatarWrapper, { backgroundColor: colorAvatar }]}>
                            <Image source={getAvatarSource()} style={styles.avatarImage} resizeMode="contain" />
                            <View style={styles.avatarEditBadge}>
                                <MaterialIcons name="edit" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarNombre}>{usuario?.nombre} {usuario?.apellidoP}</Text>
                        <Text style={styles.avatarEmail}>{usuario?.email}</Text>
                    </View>

                    {/* MODAL SELECCIÓN DE AVATAR Y COLOR */}
                    <Modal visible={modalAvatar} transparent animationType="slide" onRequestClose={() => setModalAvatar(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContainer, { backgroundColor: isDark ? "#2C2C36" : "#fff" }]}>
                                <Text style={styles.modalTitle}>Elige tu ícono</Text>
                                <View style={styles.avataresGrid}>
                                    {AVATARES.map((av) => (
                                        <TouchableOpacity
                                            key={av.id}
                                            onPress={() => seleccionarAvatar(av.id)}
                                            style={[
                                                styles.avatarOpcion,
                                                { backgroundColor: colorAvatar },
                                                avatarSeleccionado === av.id && styles.avatarOpcionSeleccionada
                                            ]}
                                        >
                                            <Image source={av.source} style={styles.avatarOpcionImage} resizeMode="contain" />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.modalTitle, { fontSize: 15, marginBottom: 12 }]}>Elige tu color</Text>
                                <View style={styles.coloresGrid}>
                                    {COLORES_AVATAR.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => seleccionarColor(color)}
                                            style={[
                                                styles.colorOpcion,
                                                { backgroundColor: color },
                                                colorAvatar === color && styles.colorOpcionSeleccionada
                                            ]}
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.btnCerrarModal} onPress={() => setModalAvatar(false)}>
                                    <Text style={styles.btnCerrarModalText}>Listo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <View style={[styles.card, { backgroundColor: isDark ? "#2C2C36" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Datos personales</Text>

                        <Text style={styles.label}>Nombre</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={nombre} onChangeText={setNombre} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.nombre || "—"}</Text>
                        )}

                        <Text style={styles.label}>Apellido Paterno</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={apellidoP} onChangeText={setApellidoP} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.apellidoP || "—"}</Text>
                        )}

                        <Text style={styles.label}>Apellido Materno</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={apellidoM} onChangeText={setApellidoM} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.apellidoM || "—"}</Text>
                        )}

                        <Text style={styles.label}>Fecha de nacimiento</Text>
                        <Text style={styles.value}>{formatFecha(usuario?.fechaNacimiento)}</Text>

                        <Text style={styles.label}>Género</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={genero} onChangeText={setGenero} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.genero || "—"}</Text>
                        )}

                        <Text style={styles.label}>Teléfono</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={telefono} onChangeText={setTelefono} keyboardType="numeric" maxLength={10} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.telefono || "—"}</Text>
                        )}
                    </View>

                    <View style={[styles.card, { backgroundColor: isDark ? "#2C2C36" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Ubicación</Text>

                        <Text style={styles.label}>Código Postal</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={codigoPostal} onChangeText={setCodigoPostal} keyboardType="numeric" maxLength={5} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.codigoPostal || "—"}</Text>
                        )}

                        <Text style={styles.label}>Localidad</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={alcaldiaMunicipio} onChangeText={setAlcaldiaMunicipio} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.alcaldiaMunicipio || "—"}</Text>
                        )}

                        <Text style={styles.label}>Nacionalidad</Text>
                        {editando ? (
                            <TextInput style={[styles.input, { backgroundColor: isDark ? "#3A3A46" : "#f5f5f5", color: "#e6007e" }]} value={nacionalidad} onChangeText={setNacionalidad} placeholderTextColor="rgba(230,0,126,0.5)" />
                        ) : (
                            <Text style={styles.value}>{usuario?.nacionalidad || "—"}</Text>
                        )}
                    </View>

                    <View style={[styles.card, { backgroundColor: isDark ? "#2C2C36" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Cuenta</Text>
                        <Text style={styles.label}>Correo</Text>
                        <Text style={styles.value}>{usuario?.email || "—"}</Text>
                    </View>

                    {!editando && (
                        <TouchableOpacity style={styles.editButton} onPress={() => setEditando(true)}>
                            <MaterialIcons name="edit" size={20} color="#fff" />
                            <Text style={styles.editButtonText}>Editar perfil</Text>
                        </TouchableOpacity>
                    )}

                    {editando && (
                        <View style={styles.botonesEdicion}>
                            <TouchableOpacity style={[styles.btnGuardar, guardando && { opacity: 0.7 }]} onPress={handleGuardar} disabled={guardando}>
                                <Text style={styles.btnGuardarText}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
                                <Text style={styles.btnCancelarText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </ScrollView>
            </View>
        </View>
    );
};

export default Perfil;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    webWrapper: {
        width: "100%",
        maxWidth: Platform.OS === "web" ? 650 : "100%",
        flex: 1,
    },
    scrollContainer: { paddingBottom: 40 },
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
    avatarContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: "#e6007e",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    avatarImage: { width: 80, height: 80 },
    avatarEditBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "#e6007e",
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarNombre: { fontSize: 18, fontWeight: "bold", color: "#e6007e" },
    avatarEmail: { fontSize: 13, color: "#e6007e", opacity: 0.7, marginTop: 2 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: "#e6007e",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 20,
    },
    avataresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 16,
        marginBottom: 20,
    },
    avatarOpcion: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "rgba(230,0,126,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarOpcionSeleccionada: {
        borderColor: "#e6007e",
        borderWidth: 3,
    },
    avatarOpcionImage: { width: 55, height: 55 },
    coloresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
        marginBottom: 20,
    },
    colorOpcion: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "transparent",
    },
    colorOpcionSeleccionada: {
        borderColor: "#e6007e",
        borderWidth: 3,
        transform: [{ scale: 1.2 }],
    },
    btnCerrarModal: {
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e6007e",
    },
    btnCerrarModalText: { color: "#e6007e", fontWeight: "bold", fontSize: 15 },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#e6007e",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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
    label: { fontSize: 13, color: "#e6007e", marginTop: 10, fontWeight: "bold" },
    value: { fontSize: 15, color: "#e6007e", marginTop: 2 },
    input: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#e6007e",
        marginTop: 4,
    },
    botonesEdicion: { gap: 12, marginBottom: 20 },
    btnGuardar: {
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    btnGuardarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    btnCancelar: {
        backgroundColor: "transparent",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e6007e",
    },
    btnCancelarText: { color: "#e6007e", fontWeight: "bold", fontSize: 16 },
});