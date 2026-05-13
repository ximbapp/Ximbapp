import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
} from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Perfil = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            
            const response = await fetch('http://ximbapp.com:3000/api/auth/perfil', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setUsuario(data.usuario);
            }
        } catch (error) {
            console.log('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
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
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? "#3A3A46" : "#fff",
                    alignItems: Platform.OS === "web" ? "center" : "stretch",
                },
            ]}
        >
            <View style={styles.webWrapper}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                </TouchableOpacity>

                <Text style={styles.title}>Perfil</Text>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Datos personales</Text>

                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.value}>{usuario?.nombre || "—"}</Text>

                        <Text style={styles.label}>Apellido Paterno:</Text>
                        <Text style={styles.value}>{usuario?.apellidoP || "—"}</Text>

                        <Text style={styles.label}>Apellido Materno:</Text>
                        <Text style={styles.value}>{usuario?.apellidoM || "—"}</Text>

                        <Text style={styles.label}>Fecha de nacimiento:</Text>
                        <Text style={styles.value}>{formatFecha(usuario?.fechaNacimiento)}</Text>

                        <Text style={styles.label}>Género:</Text>
                        <Text style={styles.value}>{usuario?.genero || "—"}</Text>

                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>{usuario?.telefono || "—"}</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Ubicación</Text>

                        <Text style={styles.label}>Código Postal:</Text>
                        <Text style={styles.value}>{usuario?.codigoPostal || "—"}</Text>

                        <Text style={styles.label}>Localidad:</Text>
                        <Text style={styles.value}>{usuario?.alcaldiaMunicipio || "—"}</Text>

                        <Text style={styles.label}>Nacionalidad:</Text>
                        <Text style={styles.value}>{usuario?.nacionalidad || "—"}</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <Text style={styles.sectionTitle}>Cuenta</Text>

                        <Text style={styles.label}>Correo:</Text>
                        <Text style={styles.value}>{usuario?.email || "—"}</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default Perfil;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    webWrapper: {
        width: "100%",
        maxWidth: Platform.OS === "web" ? 650 : "100%",
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
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
    label: {
        fontSize: 13,
        color: "#e6007e",
        marginTop: 10,
        fontWeight: "bold",
    },
    value: {
        fontSize: 15,
        color: "#e6007e",
        marginTop: 2,
    },
});