import React, { useState, useRef, useEffect } from "react";
import Main from "../assets/styles/Main";
import Imagenes from "../assets/img/Imagenes";
import FloatingInput from "../components/FloatingInput";

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

const styles = StyleSheet.create(Main);


const Login = () => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        if (usuario.trim() === "" || password.trim() === "") {
            alert("Completa todos los campos");
            return;
        }

        alert("Login correcto (simulado)");
    };

    const handleGoogleLogin = () => {
        alert("Login con Google (pendiente)");
    };

    const handleFacebookLogin = () => {
        alert("Login con Facebook (pendiente)");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        { backgroundColor: isDark ? "#808080" : "#fff" },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image
                        source={Imagenes.logo}
                        style={styles.logo}
                    />

                    <Text style={[styles.title, { color: "#e6007e" }]}>
                        Tu lugar perfecto a un click de distancia
                    </Text>

                    <View style={styles.form}>
                        <Text
                            style={[
                                styles.formTitle,
                                {
                                    backgroundColor: isDark ? "#808080" : "#fff",
                                    color: "#e6007e",
                                },
                            ]}
                        >
                            Iniciar Sesión
                        </Text>

                        <FloatingInput
                            label="Usuario"
                            value={usuario}
                            onChangeText={setUsuario}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            isDark={isDark}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Entrar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text style={[styles.link, { color: "#e6007e" }]}>
                                ¿Olvidaste tu contraseña?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text style={[styles.link, { color: "#e6007e" }]}>
                                Crear cuenta
                            </Text>
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
                                <Image
                                    source={require("../../assets/icons/google.png")}
                                    style={styles.socialIcon}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleFacebookLogin}
                            >
                                <Image
                                    source={require("../../assets/icons/fb.png")}
                                    style={styles.socialIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}


export default Login;