import React, { useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

const Perfil = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);

    const userData = {
        nombre: "Miguel",
        apellidoPaterno: "Godoy",
        apellidoMaterno: "Rivera",
        fechaNacimiento: "09/04/2000",
        codigoPostal: "09790",
        nacionalidad: "Mexicana",
        localidad: "CDMX",
        genero: "Masculino",
        telefono: "55 0000 0000",
        usuario: "miguel123",
        correo: "miguel@gmail.com",
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
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
                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Datos personales</Text>

                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.value}>{userData.nombre}</Text>

                        <Text style={styles.label}>Apellido Paterno:</Text>
                        <Text style={styles.value}>{userData.apellidoPaterno}</Text>

                        <Text style={styles.label}>Apellido Materno:</Text>
                        <Text style={styles.value}>{userData.apellidoMaterno}</Text>

                        <Text style={styles.label}>Fecha de nacimiento:</Text>
                        <Text style={styles.value}>{userData.fechaNacimiento}</Text>

                        <Text style={styles.label}>Género:</Text>
                        <Text style={styles.value}>{userData.genero}</Text>

                        <Text style={styles.label}>Teléfono:</Text>
                        <Text style={styles.value}>{userData.telefono}</Text>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Ubicación</Text>

                        <Text style={styles.label}>Código Postal:</Text>
                        <Text style={styles.value}>{userData.codigoPostal}</Text>

                        <Text style={styles.label}>Localidad:</Text>
                        <Text style={styles.value}>{userData.localidad}</Text>

                        <Text style={styles.label}>Nacionalidad:</Text>
                        <Text style={styles.value}>{userData.nacionalidad}</Text>
                    </View>

                    <View
                        style={[
                            styles.card,
                            { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                        ]}
                    >
                        <Text style={styles.sectionTitle}>Cuenta</Text>

                        <Text style={styles.label}>Usuario:</Text>
                        <Text style={styles.value}>{userData.usuario}</Text>

                        <Text style={styles.label}>Correo:</Text>
                        <Text style={styles.value}>{userData.correo}</Text>
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
        alignItems: "center",
    },

    webWrapper: {
        width: "100%",
        maxWidth: Platform.OS === "web" ? 650 : "100%",
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