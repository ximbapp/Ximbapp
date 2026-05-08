import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../context/ThemeContext";

const API_URL = "http://157.230.63.10:3000/api";
const { width } = Dimensions.get("window");

const DetalleLugar = ({ route, navigation }) => {
    const { lugar } = route.params;
    const { isDark } = useContext(ThemeContext);

    const [pestanaActiva, setPestanaActiva] = useState("info");
    const [comentarios, setComentarios] = useState([]);
    const [loadingComentarios, setLoadingComentarios] = useState(true);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [comentarioFotos, setComentarioFotos] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [fotoActiva, setFotoActiva] = useState(0);

    useEffect(() => {
        cargarComentarios();
    }, []);

    const cargarComentarios = async () => {
        try {
            setLoadingComentarios(true);
            const response = await fetch(`${API_URL}/comentarios/${lugar._id}`);
            const data = await response.json();
            setComentarios(data.comentarios || []);
        } catch (error) {
            console.log("Error cargando comentarios:", error);
        } finally {
            setLoadingComentarios(false);
        }
    };

    const seleccionarFotosComentario = async () => {
        if (comentarioFotos.length >= 2) {
            alert("Máximo 2 fotos por comentario");
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
            selectionLimit: 2 - comentarioFotos.length,
            quality: 0.7,
        });
        if (!result.canceled) {
            setComentarioFotos([...comentarioFotos, ...result.assets]);
        }
    };

    const enviarComentario = async () => {
        if (!nuevoComentario.trim()) {
            alert("Escribe un comentario");
            return;
        }
        try {
            setEnviando(true);
            const token = await AsyncStorage.getItem("token");

            const formData = new FormData();
            formData.append("lugar", lugar._id);
            formData.append("comentario", nuevoComentario.trim());

            comentarioFotos.forEach((foto, index) => {
                formData.append("fotos", {
                    uri: foto.uri,
                    type: "image/jpeg",
                    name: `foto_comentario_${index}.jpg`,
                });
            });

            const response = await fetch(`${API_URL}/comentarios`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setNuevoComentario("");
                setComentarioFotos([]);
                cargarComentarios();
            } else {
                alert(data.mensaje);
            }
        } catch (error) {
            alert("Error al enviar comentario");
        } finally {
            setEnviando(false);
        }
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{lugar.nombre}</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Carrusel de fotos */}
            {lugar.fotos && lugar.fotos.length > 0 ? (
                <View style={styles.carruselContainer}>
                    <FlatList
                        data={lugar.fotos}
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
                    {/* Indicadores */}
                    <View style={styles.indicadores}>
                        {lugar.fotos.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicador,
                                    { backgroundColor: index === fotoActiva ? "#e6007e" : "rgba(255,255,255,0.5)" }
                                ]}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <View style={styles.sinFotos}>
                    <MaterialIcons name="image-not-supported" size={50} color="#e6007e" />
                    <Text style={styles.sinFotosText}>Sin fotos</Text>
                </View>
            )}

            {/* Pestañas */}
            <View style={[styles.pestanas, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                <TouchableOpacity
                    style={[styles.pestana, pestanaActiva === "info" && styles.pestanaActiva]}
                    onPress={() => setPestanaActiva("info")}
                >
                    <Text style={[styles.pestanaText, pestanaActiva === "info" && styles.pestanaTextActiva]}>
                        Info
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pestana, pestanaActiva === "comentarios" && styles.pestanaActiva]}
                    onPress={() => setPestanaActiva("comentarios")}
                >
                    <Text style={[styles.pestanaText, pestanaActiva === "comentarios" && styles.pestanaTextActiva]}>
                        Comentarios ({comentarios.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Contenido */}
            {pestanaActiva === "info" ? (
                <ScrollView style={styles.contenido} showsVerticalScrollIndicator={false}>
                    <View style={[styles.infoCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="category" size={20} color="#e6007e" />
                            <Text style={styles.infoLabel}>Categoría:</Text>
                            <Text style={styles.infoValue}>{lugar.categoria}</Text>
                        </View>

                        {lugar.horario ? (
                            <View style={styles.infoRow}>
                                <MaterialIcons name="access-time" size={20} color="#e6007e" />
                                <Text style={styles.infoLabel}>Horario:</Text>
                                <Text style={styles.infoValue}>{lugar.horario}</Text>
                            </View>
                        ) : null}

                        <View style={styles.infoRow}>
                            <MaterialIcons name="place" size={20} color="#e6007e" />
                            <Text style={styles.infoLabel}>Localidad:</Text>
                            <Text style={styles.infoValue}>{lugar.localidad}</Text>
                        </View>

                        {lugar.descripcion ? (
                            <View style={styles.descripcionContainer}>
                                <Text style={styles.infoLabel}>Descripción:</Text>
                                <Text style={styles.descripcionText}>{lugar.descripcion}</Text>
                            </View>
                        ) : null}

                        <View style={styles.infoRow}>
                            <MaterialIcons name="person" size={20} color="#e6007e" />
                            <Text style={styles.infoLabel}>Agregado por:</Text>
                            <Text style={styles.infoValue}>{lugar.usuario?.nombre || "—"}</Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.contenido}>
                    {/* Lista de comentarios */}
                    {loadingComentarios ? (
                        <ActivityIndicator color="#e6007e" style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={comentarios}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Text style={styles.sinComentarios}>
                                    No hay comentarios aún. ¡Sé el primero!
                                </Text>
                            }
                            renderItem={({ item }) => (
                                <View style={[styles.comentarioCard, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                                    <View style={styles.comentarioHeader}>
                                        <MaterialIcons name="person" size={18} color="#e6007e" />
                                        <Text style={styles.comentarioUsuario}>{item.usuario?.nombre}</Text>
                                        <Text style={styles.comentarioFecha}>{formatFecha(item.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.comentarioTexto}>{item.comentario}</Text>
                                    {item.fotos && item.fotos.length > 0 && (
                                        <View style={styles.comentarioFotos}>
                                            {item.fotos.map((foto, index) => (
                                                <Image key={index} source={{ uri: foto }} style={styles.comentarioFoto} />
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                            ListFooterComponent={
                                <View style={[styles.nuevoComentario, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5" }]}>
                                    <Text style={styles.nuevoComentarioTitle}>Agregar comentario</Text>
                                    <TextInput
                                        style={[styles.comentarioInput, { backgroundColor: isDark ? "#3A3A46" : "#fff", color: "#e6007e" }]}
                                        placeholder="Escribe tu comentario..."
                                        placeholderTextColor="rgba(230,0,126,0.6)"
                                        value={nuevoComentario}
                                        onChangeText={setNuevoComentario}
                                        multiline
                                        numberOfLines={3}
                                    />

                                    {/* Fotos del comentario */}
                                    <TouchableOpacity
                                        style={styles.fotoComentarioBtn}
                                        onPress={seleccionarFotosComentario}
                                    >
                                        <MaterialIcons name="add-a-photo" size={18} color="#e6007e" />
                                        <Text style={styles.fotoComentarioBtnText}>
                                            Fotos ({comentarioFotos.length}/2)
                                        </Text>
                                    </TouchableOpacity>

                                    {comentarioFotos.length > 0 && (
                                        <View style={styles.fotosComentarioPreview}>
                                            {comentarioFotos.map((foto, index) => (
                                                <View key={index} style={{ position: "relative" }}>
                                                    <Image source={{ uri: foto.uri }} style={styles.fotoComentarioPreview} />
                                                    <TouchableOpacity
                                                        style={styles.fotoDelete}
                                                        onPress={() => {
                                                            setComentarioFotos(comentarioFotos.filter((_, i) => i !== index));
                                                        }}
                                                    >
                                                        <MaterialIcons name="close" size={14} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.enviarBtn, enviando && { opacity: 0.7 }]}
                                        onPress={enviarComentario}
                                        disabled={enviando}
                                    >
                                        <Text style={styles.enviarBtnText}>
                                            {enviando ? "Enviando..." : "Enviar comentario"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    )}
                </View>
            )}
        </View>
    );
};

export default DetalleLugar;

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
        borderBottomColor: "#e6007e",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#e6007e",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 10,
    },
    carruselContainer: {
        height: 220,
        position: "relative",
    },
    fotoCarrusel: {
        height: 220,
        resizeMode: "cover",
    },
    indicadores: {
        position: "absolute",
        bottom: 10,
        flexDirection: "row",
        alignSelf: "center",
        gap: 6,
    },
    indicador: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    sinFotos: {
        height: 150,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e6007e",
    },
    sinFotosText: {
        color: "#e6007e",
        marginTop: 8,
        fontSize: 14,
    },
    pestanas: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e6007e",
    },
    pestana: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    pestanaActiva: {
        borderBottomWidth: 3,
        borderBottomColor: "#e6007e",
    },
    pestanaText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "rgba(230,0,126,0.5)",
    },
    pestanaTextActiva: {
        color: "#e6007e",
    },
    contenido: {
        flex: 1,
        padding: 16,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#e6007e",
    },
    infoValue: {
        fontSize: 14,
        color: "#e6007e",
        flex: 1,
    },
    descripcionContainer: {
        marginBottom: 12,
    },
    descripcionText: {
        fontSize: 14,
        color: "#e6007e",
        marginTop: 6,
        lineHeight: 20,
    },
    sinComentarios: {
        textAlign: "center",
        color: "#e6007e",
        marginTop: 20,
        fontWeight: "bold",
    },
    comentarioCard: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
        marginBottom: 10,
    },
    comentarioHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    comentarioUsuario: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#e6007e",
        flex: 1,
    },
    comentarioFecha: {
        fontSize: 11,
        color: "rgba(230,0,126,0.6)",
    },
    comentarioTexto: {
        fontSize: 14,
        color: "#e6007e",
        lineHeight: 20,
    },
    comentarioFotos: {
        flexDirection: "row",
        gap: 8,
        marginTop: 10,
    },
    comentarioFoto: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
    },
    nuevoComentario: {
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "rgba(230,0,126,0.3)",
        marginTop: 10,
        marginBottom: 30,
    },
    nuevoComentarioTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#e6007e",
        marginBottom: 10,
    },
    comentarioInput: {
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#e6007e",
        marginBottom: 10,
        textAlignVertical: "top",
        minHeight: 80,
    },
    fotoComentarioBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    fotoComentarioBtnText: {
        color: "#e6007e",
        fontWeight: "bold",
        fontSize: 13,
    },
    fotosComentarioPreview: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    fotoComentarioPreview: {
        width: 70,
        height: 70,
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
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    enviarBtn: {
        backgroundColor: "#e6007e",
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    enviarBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});