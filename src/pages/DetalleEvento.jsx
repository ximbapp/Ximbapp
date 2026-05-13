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
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const DetalleEvento = ({ route, navigation }) => {
    const { evento } = route.params;
    const { isDark } = useContext(ThemeContext);
    const [fotoActiva, setFotoActiva] = useState(0);

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const handleComoLlegar = () => {
        if (!evento.lugar?.coordenadas) return;
        const { latitud, longitud } = evento.lugar.coordenadas;
        const nombre = encodeURIComponent(evento.nombre);

        if (Platform.OS === "web") {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`);
            return;
        }

        const opciones = [
            {
                nombre: "Google Maps",
                url: `google.navigation:q=${latitud},${longitud}`,
                fallback: `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`,
            },
            {
                nombre: "Waze",
                url: `waze://?ll=${latitud},${longitud}&navigate=yes`,
                fallback: `https://waze.com/ul?ll=${latitud},${longitud}&navigate=yes`,
            },
        ];

        opciones.forEach(async (op) => {
            const soportado = await Linking.canOpenURL(op.url);
            if (soportado) {
                Linking.openURL(op.url);
            } else {
                Linking.openURL(op.fallback);
            }
        });
    };

    const handleCompartir = async () => {
        const mensaje = `${evento.nombre}\n${formatFecha(evento.fechaInicio)} - ${formatFecha(evento.fechaFinal)}\n${evento.lugar?.nombre || ""}\n${evento.horario || ""}\n${evento.costos > 0 ? `$${evento.costos}` : "Gratis"}`;
        if (Platform.OS === "web") {
            navigator.clipboard?.writeText(mensaje);
            alert("Información copiada al portapapeles");
            return;
        }
        try {
            const { Share } = require("react-native");
            await Share.share({ message: mensaje });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#ff6600" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{evento.nombre}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Carrusel de fotos */}
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
                                <View
                                    key={index}
                                    style={[
                                        styles.indicador,
                                        { backgroundColor: index === fotoActiva ? "#ff6600" : "rgba(255,255,255,0.5)" }
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.sinFotos}>
                        <MaterialIcons name="image-not-supported" size={50} color="#ff6600" />
                        <Text style={styles.sinFotosText}>Sin fotos</Text>
                    </View>
                )}

                {/* Info del evento */}
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
                            <Text style={styles.infoValue}>
                                {evento.costos > 0 ? `$${evento.costos}` : "Gratis"}
                            </Text>
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

                    {/* Botones Compartir y Cómo llegar */}
                    <View style={styles.botonesContainer}>
                        <TouchableOpacity
                            style={[styles.boton, { backgroundColor: isDark ? "#2C2C36" : "#f5f5f5", borderColor: "#ff6600" }]}
                            onPress={handleCompartir}
                        >
                            <MaterialIcons name="share" size={22} color="#ff6600" />
                            <Text style={[styles.botonText, { color: "#ff6600" }]}>Compartir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.boton, { backgroundColor: "#ff6600" }]}
                            onPress={handleComoLlegar}
                        >
                            <MaterialIcons name="directions" size={22} color="#fff" />
                            <Text style={[styles.botonText, { color: "#fff" }]}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ff6600",
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
        borderBottomColor: "#ff6600",
    },
    sinFotosText: {
        color: "#ff6600",
        marginTop: 8,
        fontSize: 14,
    },
    contenido: {
        padding: 16,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,102,0,0.3)",
        marginBottom: 16,
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
        color: "#ff6600",
    },
    infoValue: {
        fontSize: 14,
        color: "#ff6600",
        flex: 1,
    },
    descripcionContainer: {
        marginBottom: 12,
    },
    descripcionText: {
        fontSize: 14,
        color: "#ff6600",
        marginTop: 6,
        lineHeight: 20,
    },
    botonesContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 30,
    },
    boton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    botonText: {
        fontWeight: "bold",
        fontSize: 14,
    },
});