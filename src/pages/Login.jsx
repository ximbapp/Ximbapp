import React, { useState } from "react";
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

import FloatingInput from "../components/FloatingInput";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const Login = ({ navigation }) => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const [email, setEmail] = useState("");
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
                    keyboardShouldPersistTaps="always"
                >
                    <Image
                        source={require("../../assets/images/Ximbapp.png")}
                        style={styles.logo}
                    />

                    <Text style={styles.title}>
                        Tu lugar perfecto a un click de distancia
                    </Text>

                    <View style={styles.form}>
                        <Text
                            style={[
                                styles.formTitle,
                                { backgroundColor: isDark ? "#808080" : "#fff" },
                            ]}
                        >
                            Iniciar Sesión
                        </Text>

                        <FloatingInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
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
                                <Text>
                                    <AntDesign name="google" size={35} color="#DB4437" />
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialButton}
                                onPress={handleFacebookLogin}
                            >
                                <Text>
                                    <MaterialIcons name="facebook" size={35} color="#1877F2" />
                                </Text>
                            </TouchableOpacity>


                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

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
    }
});

export default Login;