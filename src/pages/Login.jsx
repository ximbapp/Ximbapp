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
} from "react-native";

import FloatingInput from "../components/FloatingInput";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const Login = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const clearError = (campo) => {
        setErrors((prev) => ({ ...prev, [campo]: "" }));
    };

    const handleLogin = () => {
        let newErrors = {};

        if (email.trim() === "") {
            newErrors.email = "El correo es obligatorio";
        } else if (!validarEmail(email.trim())) {
            newErrors.email = "Ingresa un correo válido (ejemplo@correo.com)";
        }

        if (password.trim() === "") {
            newErrors.password = "La contraseña es obligatoria";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const usuarioCorrecto = "miguel@gmail.com";
        const passwordCorrecto = "Miguel123!";

        if (email.trim() !== usuarioCorrecto || password !== passwordCorrecto) {
            setErrors({
                email: "Correo o contraseña incorrectos",
                password: "Correo o contraseña incorrectos",
            });
            return;
        }

        navigation.replace("Home");
    };

    const handleGoogleLogin = () => {
        alert("Login con Google (pendiente)");
    };

    const handleFacebookLogin = () => {
        alert("Login con Facebook (pendiente)");
    };

    const content = (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: isDark ? "#000" : "#fff" },
            ]}
            keyboardShouldPersistTaps="always"
        >
            <Image
                source={require("../../assets/images/Ximbapp.png")}
                style={styles.logo}
            />

            <Text style={styles.title}>Tu lugar perfecto a un click de distancia</Text>

            <View style={styles.form}>
                <Text
                    style={[
                        styles.formTitle,
                        { backgroundColor: isDark ? "#000" : "#fff" },
                    ]}
                >
                    Iniciar Sesión
                </Text>

                <FloatingInput
                    label="Email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        clearError("email");
                    }}
                    isDark={isDark}
                    error={errors.email}
                    keyboardType="email-address"
                />

                <FloatingInput
                    label="Contraseña"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        clearError("password");
                    }}
                    secureTextEntry
                    isDark={isDark}
                    error={errors.password}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
                    <Text style={styles.link}>Crear cuenta</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleGoogleLogin}
                    >
                        <Ionicons name="logo-google" size={35} color="#DB4437" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleFacebookLogin}
                    >
                        <Ionicons name="logo-facebook" size={40} color="#4267B2" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {Platform.OS === "web" ? (
                content
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {content}
                </TouchableWithoutFeedback>
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
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#e6007e",
    },
    form: {
        borderColor: "#e6007e",
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
        color: "#e6007e",
    },
    button: {
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 10,
        marginTop: 35,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    link: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
        color: "#e6007e",
    },
    logo: {
        width: 160,
        height: 160,
        alignSelf: "center",
        marginBottom: 20,
        resizeMode: "contain",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e6007e",
        opacity: 0.5,
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#e6007e",
        fontSize: 14,
        fontWeight: "bold",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        gap: 20,
    },
    socialButton: {
        width: 55,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e6007e",
        justifyContent: "center",
        alignItems: "center",
    },
});