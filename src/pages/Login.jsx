import React, { useState, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Linking,
} from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingInput from "../components/FloatingInput";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { globalStyles, COLORS } from "../theme/styles";

const DOWNLOAD_URL = "https://expo.dev";

const Login = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const clearError = (campo) => setErrors((prev) => ({ ...prev, [campo]: "" }));

    const handleLogin = async () => {
        let newErrors = {};
        if (email.trim() === "") newErrors.email = "El correo es obligatorio";
        else if (!validarEmail(email.trim())) newErrors.email = "Ingresa un correo válido (ejemplo@correo.com)";
        if (password.trim() === "") newErrors.password = "La contraseña es obligatoria";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);
            const response = await fetch('https://ximbapp.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password })
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('usuario', JSON.stringify(data.usuario));
                navigation.replace("Home");
            } else {
                setErrors({ email: data.mensaje, password: data.mensaje });
            }
        } catch (error) {
            setErrors({ email: "Error de conexión con el servidor" });
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}
            keyboardShouldPersistTaps="always"
        >
            <Image source={require("../../assets/images/Ximbapp.png")} style={styles.logo} />

            <Text style={styles.title}>Tu lugar perfecto a un click de distancia</Text>

            <View style={[styles.form, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                <Text style={[styles.formTitle, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                    Iniciar Sesión
                </Text>

                <FloatingInput
                    label="Email" value={email}
                    onChangeText={(text) => { setEmail(text); clearError("email"); }}
                    isDark={isDark} error={errors.email} keyboardType="email-address"
                />
                <FloatingInput
                    label="Contraseña" value={password}
                    onChangeText={(text) => { setPassword(text); clearError("password"); }}
                    secureTextEntry isDark={isDark} error={errors.password}
                />

                <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 35 }, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                    <Text style={globalStyles.btnPrimaryText}>{loading ? "Entrando..." : "Entrar"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("OlvidePassword")}>
                    <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
                    <Text style={styles.link}>Crear cuenta</Text>
                </TouchableOpacity>
            </View>

            {Platform.OS === "web" && (
                <TouchableOpacity style={styles.downloadButton} onPress={() => Linking.openURL(DOWNLOAD_URL)}>
                    <Ionicons name="download-outline" size={22} color={COLORS.blanco} />
                    <Text style={styles.downloadButtonText}>Descargar la app</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {Platform.OS === "web" ? content : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{content}</TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 25,
        maxWidth: 480,
        width: "100%",
        alignSelf: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: COLORS.primary,
    },
    form: {
        borderColor: COLORS.primary,
        borderWidth: 1,
        padding: 20,
        borderRadius: 15,
        position: "relative",
        marginTop: 10,
    },
    formTitle: {
        position: "absolute",
        top: -12,
        alignSelf: "center",
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    link: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
        color: COLORS.primary,
    },
    logo: {
        width: 160,
        height: 160,
        alignSelf: "center",
        marginBottom: 20,
        resizeMode: "contain",
    },
    downloadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginBottom: 20,
        alignSelf: "center",
        elevation: 3,
        marginTop: 15,
    },
    downloadButtonText: {
        color: COLORS.blanco,
        fontSize: 16,
        fontWeight: "bold",
    },
});