import React, { useState, useContext } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import FloatingInput from "../components/FloatingInput";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const Registro = ({ navigation }) => {
    const { isDark } = useContext(ThemeContext);

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

    const [fechaNacimiento, setFechaNacimiento] = useState(null);
    const [showPicker, setShowPicker] = useState(false);

    const [errors, setErrors] = useState({});

    const validarSoloLetras = (texto) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        return regex.test(texto);
    };

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validarTelefono = (tel) => {
        const regex = /^[0-9]{10}$/;
        return regex.test(tel);
    };

    const validarCodigoPostal = (cp) => {
        const regex = /^[0-9]{5}$/;
        return regex.test(cp);
    };

    const validarPasswordSegura = (pass) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,}$/;
        return regex.test(pass);
    };

    const formatFecha = (date) => {
        if (!date) return "";
        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const anio = date.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    const clearError = (campo) => {
        setErrors((prev) => ({ ...prev, [campo]: "" }));
    };

    const handleFechaChange = (event, selectedDate) => {
        setShowPicker(false);

        if (event.type === "dismissed") return;

        if (selectedDate) {
            setFechaNacimiento(selectedDate);
            clearError("fechaNacimiento");
        }
    };

    const handleRegister = () => {
        let newErrors = {};

        if (nombre.trim() === "") newErrors.nombre = "El nombre es obligatorio";
        else if (!validarSoloLetras(nombre.trim()))
            newErrors.nombre = "El nombre solo debe contener letras";

        if (apellido_pa.trim() === "")
            newErrors.apellido_pa = "El apellido paterno es obligatorio";
        else if (!validarSoloLetras(apellido_pa.trim()))
            newErrors.apellido_pa = "El apellido paterno solo debe contener letras";

        if (apellido_ma.trim() !== "" && !validarSoloLetras(apellido_ma.trim()))
            newErrors.apellido_ma = "El apellido materno solo debe contener letras";

        if (!fechaNacimiento)
            newErrors.fechaNacimiento = "Selecciona tu fecha de nacimiento";

        if (codigo_postal.trim() === "")
            newErrors.codigo_postal = "El código postal es obligatorio";
        else if (!validarCodigoPostal(codigo_postal.trim()))
            newErrors.codigo_postal = "Debe contener exactamente 5 números";

        if (nacionalidad.trim() === "")
            newErrors.nacionalidad = "La nacionalidad es obligatoria";

        if (localidad.trim() === "")
            newErrors.localidad = "La localidad es obligatoria";

        if (genero.trim() === "") newErrors.genero = "Selecciona una opción";

        if (telefono.trim() === "")
            newErrors.telefono = "El teléfono es obligatorio";
        else if (!validarTelefono(telefono.trim()))
            newErrors.telefono = "Debe contener exactamente 10 dígitos";

        if (usuario.trim() === "")
            newErrors.usuario = "El usuario es obligatorio";
        else if (usuario.trim().length < 4)
            newErrors.usuario = "Debe tener mínimo 4 caracteres";

        if (correo.trim() === "")
            newErrors.correo = "El correo es obligatorio";
        else if (!validarEmail(correo.trim()))
            newErrors.correo = "Formato inválido (ejemplo@correo.com)";

        if (password.trim() === "")
            newErrors.password = "La contraseña es obligatoria";
        else if (!validarPasswordSegura(password))
            newErrors.password =
                "Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo";

        if (confirmPassword.trim() === "")
            newErrors.confirmPassword = "Confirma tu contraseña";
        else if (password !== confirmPassword)
            newErrors.confirmPassword = "Las contraseñas no coinciden";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        alert("Cuenta creada correctamente (simulado)");
        navigation.goBack();
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
            <Text style={styles.title}>Crear Cuenta</Text>

            <View style={styles.form}>
                <Text
                    style={[
                        styles.formTitle,
                        { backgroundColor: isDark ? "#000" : "#fff" },
                    ]}
                >
                    Registro
                </Text>

                <FloatingInput
                    label="Nombre"
                    value={nombre}
                    onChangeText={(text) => {
                        setNombre(text);
                        clearError("nombre");
                    }}
                    isDark={isDark}
                    error={errors.nombre}
                />

                <FloatingInput
                    label="Apellido Paterno"
                    value={apellido_pa}
                    onChangeText={(text) => {
                        setApellido_pa(text);
                        clearError("apellido_pa");
                    }}
                    isDark={isDark}
                    error={errors.apellido_pa}
                />

                <FloatingInput
                    label="Apellido Materno (opcional)"
                    value={apellido_ma}
                    onChangeText={(text) => {
                        setApellido_ma(text);
                        clearError("apellido_ma");
                    }}
                    isDark={isDark}
                    error={errors.apellido_ma}
                />

                <TouchableOpacity onPress={() => setShowPicker(true)}>
                    <View pointerEvents="none">
                        <FloatingInput
                            label="Fecha de nacimiento"
                            value={formatFecha(fechaNacimiento)}
                            onChangeText={() => {}}
                            isDark={isDark}
                            error={errors.fechaNacimiento}
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
                    onChangeText={(text) => {
                        setCodigo_postal(text.replace(/[^0-9]/g, ""));
                        clearError("codigo_postal");
                    }}
                    isDark={isDark}
                    error={errors.codigo_postal}
                    keyboardType="numeric"
                    maxLength={5}
                />

                <FloatingInput
                    label="Nacionalidad"
                    value={nacionalidad}
                    onChangeText={(text) => {
                        setNacionalidad(text);
                        clearError("nacionalidad");
                    }}
                    isDark={isDark}
                    error={errors.nacionalidad}
                />

                <FloatingInput
                    label="Localidad"
                    value={localidad}
                    onChangeText={(text) => {
                        setLocalidad(text);
                        clearError("localidad");
                    }}
                    isDark={isDark}
                    error={errors.localidad}
                />

                <Text style={styles.selectLabel}>Género</Text>

                <View
                    style={[
                        styles.selectContainer,
                        { borderBottomColor: errors.genero ? "#ff3b30" : "#e6007e" },
                    ]}
                >
                    <Picker
                        selectedValue={genero}
                        onValueChange={(itemValue) => {
                            setGenero(itemValue);
                            clearError("genero");
                        }}
                        style={{ color: "#e6007e" }}
                        dropdownIconColor="#e6007e"
                    >
                        <Picker.Item label="Selecciona una opción" value="" />
                        <Picker.Item label="Hombre" value="Hombre" />
                        <Picker.Item label="Mujer" value="Mujer" />
                        <Picker.Item label="Otro" value="Otro" />
                    </Picker>
                </View>

                {errors.genero ? (
                    <Text style={styles.errorText}>{errors.genero}</Text>
                ) : null}

                <FloatingInput
                    label="Teléfono"
                    value={telefono}
                    onChangeText={(text) => {
                        setTelefono(text.replace(/[^0-9]/g, ""));
                        clearError("telefono");
                    }}
                    isDark={isDark}
                    error={errors.telefono}
                    keyboardType="numeric"
                    maxLength={10}
                />

                <FloatingInput
                    label="Usuario"
                    value={usuario}
                    onChangeText={(text) => {
                        setUsuario(text);
                        clearError("usuario");
                    }}
                    isDark={isDark}
                    error={errors.usuario}
                />

                <FloatingInput
                    label="Correo"
                    value={correo}
                    onChangeText={(text) => {
                        setCorreo(text);
                        clearError("correo");
                    }}
                    isDark={isDark}
                    error={errors.correo}
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

                <FloatingInput
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        clearError("confirmPassword");
                    }}
                    secureTextEntry
                    isDark={isDark}
                    error={errors.confirmPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}>Ya tengo cuenta</Text>
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

export default Registro;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 30,
    },
    title: {
        fontSize: 28,
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
    selectLabel: {
        marginTop: 25,
        fontSize: 12,
        fontWeight: "bold",
        color: "#e6007e",
    },
    selectContainer: {
        borderBottomWidth: 2,
        marginTop: 5,
    },
    errorText: {
        marginTop: 6,
        color: "#ff3b30",
        fontSize: 12,
        fontWeight: "bold",
    },
});