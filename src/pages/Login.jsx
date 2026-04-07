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

    const labelBg = isDark ? "#808080" : "#fff";

    const labelStyle = {
        position: "absolute",
        left: 0,
        paddingHorizontal: 4,
        backgroundColor: labelBg,
        color: "#e6007e",
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [18, -10],
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
                        color: "#e6007e",
                        borderBottomColor: "#e6007e",
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
                        source={require("../../assets/images/Ximbapp.png")}
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
    },
    inputContainer: {
        marginTop: 25,
        position: "relative",
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#e6007e",
        paddingHorizontal: 5,
        paddingTop: 18,
        paddingBottom: 8,
        fontSize: 16,
        backgroundColor: "transparent",
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
    socialIcon: {
        width: 30,
        height: 30,
        resizeMode: "contain",
    },
});