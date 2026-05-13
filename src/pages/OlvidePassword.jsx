import React, { useState, useContext } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView,
    TouchableWithoutFeedback, Keyboard, Alert
} from "react-native";
import FloatingInput from "../components/FloatingInput";
import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

const API_URL = "http://ximbapp.com:3000/api";

const OlvidePassword = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);
    const [correo, setCorreo] = useState("");
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState("");

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEnviar = async () => {
        if (!correo.trim()) {
            setError("El correo es obligatorio");
            return;
        }
        if (!validarEmail(correo.trim())) {
            setError("Formato inválido (ejemplo@correo.com)");
            return;
        }
        setError("");
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/olvide-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: correo.trim() }),
            });
            const data = await response.json();
            if (response.ok) {
                setEnviado(true);
            } else {
                setError(data.mensaje || "Error al enviar el correo");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={[styles.container, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}
                    keyboardShouldPersistTaps="always"
                >
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={28} color="#e6007e" />
                    </TouchableOpacity>

                    <MaterialIcons name="lock-reset" size={70} color="#e6007e" style={styles.icon} />
                    <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

                    {!enviado ? (
                        <View style={[styles.form, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                            <Text style={[styles.formTitle, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                                Recuperar contraseña
                            </Text>
                            <Text style={styles.descripcion}>
                                Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
                            </Text>
                            <FloatingInput
                                label="Correo electrónico"
                                value={correo}
                                onChangeText={(text) => { setCorreo(text); setError(""); }}
                                isDark={isDark}
                                error={error}
                                keyboardType="email-address"
                            />
                            <TouchableOpacity
                                style={[styles.button, loading && { opacity: 0.7 }]}
                                onPress={handleEnviar}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Enviando..." : "Enviar enlace"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.link}>Volver al inicio de sesión</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.form, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                            <Text style={[styles.formTitle, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                                ¡Correo enviado!
                            </Text>
                            <MaterialIcons name="mark-email-read" size={60} color="#e6007e" style={{ alignSelf: "center", marginVertical: 16 }} />
                            <Text style={styles.descripcion}>
                                Revisa tu bandeja de entrada en{" "}
                                <Text style={{ fontWeight: "bold", color: "#e6007e" }}>{correo}</Text>
                                {" "}y sigue las instrucciones para restablecer tu contraseña.
                            </Text>
                            <Text style={[styles.descripcion, { marginTop: 8, opacity: 0.7 }]}>
                                El enlace expira en 1 hora.
                            </Text>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.buttonText}>Volver al inicio de sesión</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setEnviado(false); setCorreo(""); }}>
                                <Text style={styles.link}>Intentar con otro correo</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default OlvidePassword;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 30,
    },
    backBtn: {
        position: "absolute",
        top: Platform.OS === "ios" ? 55 : 40,
        left: 20,
    },
    icon: {
        alignSelf: "center",
        marginBottom: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 22,
    },
    form: {
        borderColor: "#e6007e",
        borderWidth: 1,
        padding: 20,
        borderRadius: 15,
        position: "relative",
    },
    formTitle: {
        position: "absolute",
        top: -12,
        alignSelf: "center",
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: "bold",
        color: "#e6007e",
    },
    descripcion: {
        fontSize: 14,
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
        marginTop: 10,
    },
    button: {
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    link: {
        marginTop: 16,
        textAlign: "center",
        color: "#e6007e",
        fontSize: 14,
    },
});