import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import FloatingInput from "../components/FloatingInput";

const Registro = ({ navigation }) => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const [nombre, setNombre] = useState("");
    const [apellido_pa, setApellido_pa] = useState("");
    const [apellido_ma, setApellido_ma] = useState("");
    const [codigo_postal, setCodigo_postal] = useState("");
    const [nacionalidad, setNacionalidad] = useState("");
    const [localidad, setLocalidad] = useState("");
    const [genero, setGenero] = useState("");
    const [telefono, setTelefono] = useState("");
    const [usuario, setUsuario] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // 📌 FECHA
    const [fechaNacimiento, setFechaNacimiento] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const formatFecha = (date) => {
        if (!date) return "";
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const anio = date.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    const handleFechaChange = (event, selectedDate) => {
        setShowPicker(false);

        if (selectedDate) {
            setFechaNacimiento(selectedDate);
        }
    };

    const handleRegister = () => {
        if (
            nombre.trim() === "" ||
            apellido_pa.trim() === "" ||
            !fechaNacimiento ||
            codigo_postal.trim() === "" ||
            nacionalidad.trim() === "" ||
            localidad.trim() === "" ||
            genero.trim() === "" ||
            telefono.trim() === "" ||
            usuario.trim() === "" ||
            correo.trim() === "" ||
            password.trim() === "" ||
            confirmPassword.trim() === ""
        ) {
            alert("Completa todos los campos obligatorios");
            return;
        }

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        alert("Cuenta creada correctamente (simulado)");
        navigation.goBack();
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
                    <Text style={styles.title}>Crear Cuenta</Text>

                    <View style={styles.form}>
                        <Text
                            style={[
                                styles.formTitle,
                                { backgroundColor: isDark ? "#808080" : "#fff" },
                            ]}
                        >
                            Registro
                        </Text>

                        <FloatingInput
                            label="Nombre"
                            value={nombre}
                            onChangeText={setNombre}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Apellido Paterno"
                            value={apellido_pa}
                            onChangeText={setApellido_pa}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Apellido Materno (opcional)"
                            value={apellido_ma}
                            onChangeText={setApellido_ma}
                            isDark={isDark}
                        />

                        {/* 📌 FECHA CON CALENDARIO */}
                        <TouchableOpacity onPress={() => setShowPicker(true)}>
                            <View pointerEvents="none">
                                <FloatingInput
                                    label="Fecha de nacimiento"
                                    value={formatFecha(fechaNacimiento)}
                                    onChangeText={() => { }}
                                    isDark={isDark}
                                />
                            </View>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={fechaNacimiento || new Date(2000, 0, 1)}
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                maximumDate={new Date()}
                                onChange={handleFechaChange}
                            />
                        )}

                        <FloatingInput
                            label="Código Postal"
                            value={codigo_postal}
                            onChangeText={setCodigo_postal}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Nacionalidad"
                            value={nacionalidad}
                            onChangeText={setNacionalidad}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Localidad"
                            value={localidad}
                            onChangeText={setLocalidad}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Género"
                            value={genero}
                            onChangeText={setGenero}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Teléfono"
                            value={telefono}
                            onChangeText={setTelefono}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Usuario"
                            value={usuario}
                            onChangeText={setUsuario}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Correo"
                            value={correo}
                            onChangeText={setCorreo}
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            isDark={isDark}
                        />

                        <FloatingInput
                            label="Confirmar contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            isDark={isDark}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleRegister}>
                            <Text style={styles.buttonText}>Crear Cuenta</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.link}>Ya tengo cuenta</Text>
                        </TouchableOpacity>
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
        fontSize: 28,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 25,
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
        marginTop: 20,
        textAlign: "center",
        color: "#e6007e",
        fontSize: 14,
    },
});

export default Registro;