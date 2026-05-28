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
import { globalStyles, COLORS } from "../theme/styles";

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
    COLORS.avatarRosa, COLORS.avatarMorado, COLORS.avatarAzul, COLORS.avatarVerde,
    COLORS.avatarAmarillo, COLORS.avatarNaranja, COLORS.avatarRojo, COLORS.avatarGris,
];

const Perfil = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editando, setEditando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [avatarSeleccionado, setAvatarSeleccionado] = useState("colibri");
    const [colorAvatar, setColorAvatar] = useState(COLORS.avatarMorado);
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ nombre, apellidoP, apellidoM, telefono, genero, codigoPostal, alcaldiaMunicipio, nacionalidad })
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
            <View style={[globalStyles.centered, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={[globalStyles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, alignItems: Platform.OS === "web" ? "center" : "stretch" }]}>
            <View style={globalStyles.webWrapper}>
                <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>

                <Text style={globalStyles.screenTitlePerfil}>Perfil</Text>

                <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* AVATAR */}
                    <View style={styles.avatarContainer}>
                        <TouchableOpacity onPress={() => setModalAvatar(true)} style={[globalStyles.avatarWrapper, { backgroundColor: colorAvatar }]}>
                            <Image source={getAvatarSource()} style={globalStyles.avatarImage} resizeMode="contain" />
                            <View style={globalStyles.avatarEditBadge}>
                                <MaterialIcons name="edit" size={14} color={COLORS.blanco} />
                            </View>
                        </TouchableOpacity>
                        <Text style={globalStyles.avatarNombre}>{usuario?.nombre} {usuario?.apellidoP}</Text>
                        <Text style={globalStyles.avatarEmail}>{usuario?.email}</Text>
                    </View>

                    {/* MODAL SELECCIÓN DE AVATAR Y COLOR */}
                    <Modal visible={modalAvatar} transparent animationType="slide" onRequestClose={() => setModalAvatar(false)}>
                        <View style={globalStyles.modalBottomOverlay}>
                            <View style={[styles.modalContainer, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightBg }]}>
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
                                <TouchableOpacity style={globalStyles.btnOutlineIcono} onPress={() => setModalAvatar(false)}>
                                    <Text style={globalStyles.btnOutlineTextIcono}>Listo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* DATOS PERSONALES */}
                    <View style={[globalStyles.cardDatosPersonales, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleDatosPersonales}>Datos personales</Text>

                        <Text style={globalStyles.label}>Nombre</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={nombre} onChangeText={setNombre} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.nombre || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Apellido Paterno</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={apellidoP} onChangeText={setApellidoP} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.apellidoP || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Apellido Materno</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={apellidoM} onChangeText={setApellidoM} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.apellidoM || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Fecha de nacimiento</Text>
                        <Text style={globalStyles.value}>{formatFecha(usuario?.fechaNacimiento)}</Text>

                        <Text style={globalStyles.label}>Género</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={genero} onChangeText={setGenero} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.genero || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Teléfono</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={telefono} onChangeText={setTelefono} keyboardType="numeric" maxLength={10} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.telefono || "—"}</Text>
                        )}
                    </View>

                    {/* UBICACIÓN */}
                    <View style={[globalStyles.cardDatosPersonales, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleDatosPersonales}>Ubicación</Text>

                        <Text style={globalStyles.label}>Código Postal</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={codigoPostal} onChangeText={setCodigoPostal} keyboardType="numeric" maxLength={5} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.codigoPostal || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Localidad</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={alcaldiaMunicipio} onChangeText={setAlcaldiaMunicipio} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.alcaldiaMunicipio || "—"}</Text>
                        )}

                        <Text style={globalStyles.label}>Nacionalidad</Text>
                        {editando ? (
                            <TextInput style={[globalStyles.inputEditar, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightCard, color: COLORS.primaryUsuario }]} value={nacionalidad} onChangeText={setNacionalidad} placeholderTextColor={COLORS.primaryMedium} />
                        ) : (
                            <Text style={globalStyles.value}>{usuario?.nacionalidad || "—"}</Text>
                        )}
                    </View>

                    {/* CUENTA */}
                    <View style={[globalStyles.cardDatosPersonales, { backgroundColor: isDark ? COLORS.darkCard : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleDatosPersonales}>Cuenta</Text>
                        <Text style={globalStyles.label}>Correo</Text>
                        <Text style={globalStyles.value}>{usuario?.email || "—"}</Text>
                    </View>

                    {!editando && (
                        <TouchableOpacity style={globalStyles.btnPrimaryEditar} onPress={() => setEditando(true)}>
                            <MaterialIcons name="edit" size={20} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Editar perfil</Text>
                        </TouchableOpacity>
                    )}

                    {editando && (
                        <View style={styles.botonesEdicion}>
                            <TouchableOpacity style={[globalStyles.btnPrimaryEditar, guardando && { opacity: 0.7 }]} onPress={handleGuardar} disabled={guardando}>
                                <Text style={globalStyles.btnPrimaryText}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={globalStyles.btnOutlineCancelarEdit} onPress={handleCancelar}>
                                <Text style={globalStyles.btnOutlineTextCancelarEdit}>Cancelar</Text>
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
    avatarContainer: { alignItems: "center", marginBottom: 24 },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: COLORS.primaryContenidoDark,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.primaryContenidoLight, textAlign: "center", marginBottom: 20 },
    avataresGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 20 },
    avatarOpcion: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.primaryMedium, alignItems: "center", justifyContent: "center" },
    avatarOpcionSeleccionada: { borderColor: COLORS.primaryContenidoDark, borderWidth: 3 },
    avatarOpcionImage: { width: 55, height: 55 },
    coloresGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 20 },
    colorOpcion: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "transparent" },
    colorOpcionSeleccionada: { borderColor: COLORS.primaryContenidoDark, borderWidth: 3, transform: [{ scale: 1.2 }] },
    botonesEdicion: { gap: 12, marginBottom: 20 },
});