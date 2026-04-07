import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

function FloatingInput({
    label,
    value,
    onChangeText,
    secureTextEntry,
    isDark,
}) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const handleFocus = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        if (!value) {
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    };

    const inputBg = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)";
    const labelBg = isDark ? "#808080" : "#f1f5f930";

    const labelStyle = {
        position: "absolute",
        left: 12,
        paddingHorizontal: 6,
        backgroundColor: labelBg,
        color: "#e6007e",
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, -18],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        zIndex: 10,
    };

    return (
        <View style={styles.inputContainer}>
            <Animated.Text style={labelStyle}>{label}</Animated.Text>

            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: inputBg,
                        color: "#e6007e",
                        borderColor: "#e6007e",
                    },
                ]}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoCapitalize="none"
                textContentType={secureTextEntry ? "password" : "none"}
                autoComplete={secureTextEntry ? "password" : "off"}
                importantForAutofill="yes"
                placeholderTextColor="rgba(230,0,126,0.6)"
            />
        </View>
    );
}

export default function Login() {
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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        { backgroundColor: isDark ? "#808080" : "#f1f5f9" },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image
                        source={require("../../assets/images/Ximbapp.png")}
                        style={styles.logo}
                    />

                    <Text style={[styles.title, { color: "#e6007e" }]}>
                        Tu lugar perfecto a un click de distancia
                    </Text>

                    <Text style={[styles.subtitle, { color: "#e6007e" }]}>
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
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 25,
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        marginTop: 20,
        position: "relative",
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 10,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#e6007e",
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
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
    },
    logo: {
        width: 180,
        height: 180,
        alignSelf: "center",
        marginBottom: 20,
        resizeMode: "contain",
    },
});