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
    Modal,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import FloatingInput from "../components/FloatingInput";
import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
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
    const [loading, setLoading] = useState(false);
    const [terminosAceptados, setTerminosAceptados] = useState(false);
    const [modalTerminos, setModalTerminos] = useState(false);

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

    const handleRegister = async () => {
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

        if (!terminosAceptados)
            newErrors.terminos = "Debes aceptar los términos y condiciones";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            setLoading(true);

            const response = await fetch('http://ximbapp.com:3000/api/auth/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    apellidoP: apellido_pa.trim(),
                    apellidoM: apellido_ma.trim(),
                    fechaNacimiento: fechaNacimiento.toISOString(),
                    nacionalidad: nacionalidad.trim(),
                    codigoPostal: codigo_postal.trim(),
                    alcaldiaMunicipio: localidad.trim(),
                    genero: genero,
                    telefono: telefono.trim(),
                    email: correo.trim(),
                    password: password,
                    terminosAceptados: true,
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Cuenta creada correctamente. Revisa tu correo para confirmarla.");
                navigation.goBack();
            } else {
                if (data.mensaje.includes("email")) {
                    setErrors({ correo: "Este correo ya está registrado" });
                } else if (data.mensaje.includes("telefono")) {
                    setErrors({ telefono: "Este teléfono ya está registrado" });
                } else {
                    alert(data.mensaje);
                }
            }
        } catch (error) {
            alert("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: isDark ? "#3A3A46" : "#fff" },
            ]}
            keyboardShouldPersistTaps="always"
        >
            <Text style={styles.title}>Crear Cuenta</Text>

            <View style={[styles.form, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                <Text style={[styles.formTitle, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                    Registro
                </Text>

                <FloatingInput label="Nombre" value={nombre} onChangeText={(text) => { setNombre(text); clearError("nombre"); }} isDark={isDark} error={errors.nombre} />
                <FloatingInput label="Apellido Paterno" value={apellido_pa} onChangeText={(text) => { setApellido_pa(text); clearError("apellido_pa"); }} isDark={isDark} error={errors.apellido_pa} />
                <FloatingInput label="Apellido Materno (opcional)" value={apellido_ma} onChangeText={(text) => { setApellido_ma(text); clearError("apellido_ma"); }} isDark={isDark} error={errors.apellido_ma} />

                <TouchableOpacity onPress={() => setShowPicker(true)}>
                    <View pointerEvents="none">
                        <FloatingInput label="Fecha de nacimiento" value={formatFecha(fechaNacimiento)} onChangeText={() => {}} isDark={isDark} error={errors.fechaNacimiento} />
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

                <FloatingInput label="Código Postal" value={codigo_postal} onChangeText={(text) => { setCodigo_postal(text.replace(/[^0-9]/g, "")); clearError("codigo_postal"); }} isDark={isDark} error={errors.codigo_postal} keyboardType="numeric" maxLength={5} />
                <FloatingInput label="Nacionalidad" value={nacionalidad} onChangeText={(text) => { setNacionalidad(text); clearError("nacionalidad"); }} isDark={isDark} error={errors.nacionalidad} />
                <FloatingInput label="Localidad" value={localidad} onChangeText={(text) => { setLocalidad(text); clearError("localidad"); }} isDark={isDark} error={errors.localidad} />

                <Text style={styles.selectLabel}>Género</Text>
                <View style={[styles.selectContainer, { borderBottomColor: errors.genero ? "#ff3b30" : "#e6007e" }]}>
                    <Picker selectedValue={genero} onValueChange={(itemValue) => { setGenero(itemValue); clearError("genero"); }} style={{ color: "#e6007e" }} dropdownIconColor="#e6007e">
                        <Picker.Item label="Selecciona una opción" value="" />
                        <Picker.Item label="Hombre" value="Hombre" />
                        <Picker.Item label="Mujer" value="Mujer" />
                        <Picker.Item label="Otro" value="Otro" />
                    </Picker>
                </View>
                {errors.genero ? <Text style={styles.errorText}>{errors.genero}</Text> : null}

                <FloatingInput label="Teléfono" value={telefono} onChangeText={(text) => { setTelefono(text.replace(/[^0-9]/g, "")); clearError("telefono"); }} isDark={isDark} error={errors.telefono} keyboardType="numeric" maxLength={10} />
                <FloatingInput label="Usuario" value={usuario} onChangeText={(text) => { setUsuario(text); clearError("usuario"); }} isDark={isDark} error={errors.usuario} />
                <FloatingInput label="Correo" value={correo} onChangeText={(text) => { setCorreo(text); clearError("correo"); }} isDark={isDark} error={errors.correo} keyboardType="email-address" />
                <FloatingInput label="Contraseña" value={password} onChangeText={(text) => { setPassword(text); clearError("password"); }} secureTextEntry isDark={isDark} error={errors.password} />
                <FloatingInput label="Confirmar contraseña" value={confirmPassword} onChangeText={(text) => { setConfirmPassword(text); clearError("confirmPassword"); }} secureTextEntry isDark={isDark} error={errors.confirmPassword} />

                {/* Checkbox Términos y Condiciones */}
                <View style={styles.terminosRow}>
                    <TouchableOpacity
                        style={[styles.checkbox, terminosAceptados && styles.checkboxActivo]}
                        onPress={() => { setTerminosAceptados(!terminosAceptados); clearError("terminos"); }}
                    >
                        {terminosAceptados && <MaterialIcons name="check" size={16} color="#fff" />}
                    </TouchableOpacity>
                    <Text style={styles.terminosTexto}>Acepto los </Text>
                    <TouchableOpacity onPress={() => setModalTerminos(true)}>
                        <Text style={styles.terminosLink}>Términos y Condiciones</Text>
                    </TouchableOpacity>
                </View>
                {errors.terminos ? <Text style={styles.errorText}>{errors.terminos}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Creando cuenta..." : "Crear Cuenta"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}>Ya tengo cuenta</Text>
                </TouchableOpacity>

            </View>

            {/* Modal Términos y Condiciones */}
            <Modal visible={modalTerminos} animationType="slide" transparent onRequestClose={() => setModalTerminos(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? "#3A3A46" : "#fff" }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                            <TouchableOpacity onPress={() => setModalTerminos(false)}>
                                <MaterialIcons name="close" size={26} color="#e6007e" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            <Text style={styles.tcTitulo}>TÉRMINOS Y CONDICIONES, AVISO DE PRIVACIDAD Y POLÍTICAS{"\n"}Aplicación Turística "Ximbapp"</Text>

                            <Text style={styles.tcSeccion}>1. TÉRMINOS Y CONDICIONES DE USO</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA PRIMERA. ACEPTACIÓN DE LOS TÉRMINOS</Text>
                            <Text style={styles.tcTexto}>Al acceder o utilizar la aplicación "Ximbapp", el usuario acepta de manera expresa los presentes términos y condiciones, así como las políticas de privacidad y protección de datos establecidas en este documento.{"\n"}En caso de no aceptar alguna de las disposiciones, el usuario deberá abstenerse de utilizar la aplicación.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA SEGUNDA. OBJETO DE LA APLICACIÓN</Text>
                            <Text style={styles.tcTexto}>La aplicación tiene como finalidad proporcionar información turística, recomendaciones, rutas, servicios, atractivos culturales, naturales, hospedajes, restaurantes y actividades recreativas relacionadas principalmente con destinos turísticos del sur del Estado de México.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA TERCERA. EDAD MÍNIMA</Text>
                            <Text style={styles.tcTexto}>El uso de la aplicación está permitido únicamente a personas mayores de 18 años. Al registrarse, el usuario declara bajo protesta de decir verdad que cuenta con la mayoría de edad legal requerida. La aplicación se reserva el derecho de suspender o eliminar cuentas que incumplan esta disposición.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA CUARTA. REGISTRO DE USUARIOS</Text>
                            <Text style={styles.tcTexto}>Para acceder a determinadas funciones, el usuario deberá registrarse proporcionando información verídica, completa y actualizada.{"\n"}El usuario será responsable de:{"\n"}• Mantener la confidencialidad de su contraseña.{"\n"}• Todas las actividades realizadas desde su cuenta.{"\n"}• Notificar cualquier uso no autorizado.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA QUINTA. USO ADECUADO DE LA APLICACIÓN</Text>
                            <Text style={styles.tcTexto}>El usuario se compromete a:{"\n"}• Utilizar la plataforma de forma lícita y responsable.{"\n"}• No realizar actos que dañen la aplicación.{"\n"}• No introducir virus o software malicioso.{"\n"}• No copiar, distribuir o comercializar contenido sin autorización.{"\n"}• No publicar contenido ofensivo, discriminatorio o ilegal.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA SEXTA. PROPIEDAD INTELECTUAL</Text>
                            <Text style={styles.tcTexto}>Todo el contenido de la aplicación se encuentra protegido por las leyes de propiedad intelectual y derechos de autor. Queda estrictamente prohibida su reproducción total o parcial sin autorización escrita.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA SÉPTIMA. INFORMACIÓN TURÍSTICA</Text>
                            <Text style={styles.tcTexto}>La aplicación busca mantener información actualizada; sin embargo, no garantiza la exactitud absoluta de precios, horarios, disponibilidad, eventos, condiciones climáticas o servicios de terceros. La información puede modificarse sin previo aviso.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA OCTAVA. SERVICIOS DE TERCEROS</Text>
                            <Text style={styles.tcTexto}>La aplicación no será responsable por accidentes, cancelaciones, incumplimientos, pérdidas económicas o daños ocasionados por terceros como hoteles, restaurantes, agencias o guías turísticos.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA NOVENA. LIMITACIÓN DE RESPONSABILIDAD</Text>
                            <Text style={styles.tcTexto}>La aplicación no será responsable por fallas técnicas, interrupciones del servicio, pérdida de datos o daños derivados del uso de la plataforma. El usuario utiliza la aplicación bajo su propia responsabilidad.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA DÉCIMA. SUSPENSIÓN DEL SERVICIO</Text>
                            <Text style={styles.tcTexto}>La aplicación podrá suspender temporal o definitivamente cuentas que incumplan estos términos, presenten actividad fraudulenta o generen riesgos para otros usuarios.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA DÉCIMA PRIMERA. MODIFICACIONES</Text>
                            <Text style={styles.tcTexto}>La empresa podrá modificar los presentes términos y condiciones en cualquier momento. Las modificaciones surtirán efecto una vez publicadas en la aplicación.</Text>

                            <Text style={styles.tcSubtitulo}>CLÁUSULA DÉCIMA SEGUNDA. LEGISLACIÓN APLICABLE</Text>
                            <Text style={styles.tcTexto}>El presente documento se regirá conforme a las leyes vigentes de los Estados Unidos Mexicanos en materia civil, mercantil, protección de datos personales y propiedad intelectual.</Text>

                            <Text style={styles.tcSeccion}>2. AVISO DE PRIVACIDAD</Text>
                            <Text style={styles.tcTexto}>La aplicación "Ximbapp" es responsable del tratamiento y protección de los datos personales proporcionados por los usuarios.{"\n\n"}Datos recabados: nombre completo, correo electrónico, número telefónico, ubicación, fotografías, datos de navegación y preferencias turísticas.{"\n\n"}Los datos serán utilizados para crear cuentas, mejorar la experiencia, enviar información turística, personalizar recomendaciones, dar soporte técnico y cumplir obligaciones legales.{"\n\n"}La aplicación no venderá ni compartirá datos personales con terceros sin autorización del usuario, salvo requerimiento legal.</Text>

                            <Text style={styles.tcSeccion}>3. POLÍTICA DE COOKIES</Text>
                            <Text style={styles.tcTexto}>La aplicación podrá utilizar cookies técnicas, analíticas y de personalización para mejorar la experiencia del usuario. El usuario podrá configurar su dispositivo para rechazarlas; sin embargo, algunas funciones podrían verse limitadas.</Text>

                            <Text style={styles.tcSeccion}>4. NORMATIVA DE PROTECCIÓN DE DATOS</Text>
                            <Text style={styles.tcTexto}>Toda la información proporcionada por el usuario será considerada confidencial. La aplicación implementará sistemas de autenticación, contraseñas cifradas y protección contra accesos no autorizados.</Text>

                            <Text style={styles.tcSeccion}>5. SESIÓN DE DERECHOS AUDIOVISUALES</Text>
                            <Text style={styles.tcTexto}>Al publicar contenido en la aplicación, el usuario cede a favor de Ximbapp los derechos de uso, reproducción y difusión del material compartido para fines de promoción turística, sin compensación económica. El usuario conservará el reconocimiento de autoría.</Text>

                            <Text style={styles.tcSeccion}>6. CONTACTO</Text>
                            <Text style={styles.tcTexto}>Correo: ximbapp@gmail.com{"\n"}Teléfono: 5549257864{"\n"}Dirección: Prol. Vicente Guerrero Sur 171, San Juan Tepenahuac, Milpa Alta 12800, Ciudad de México, CDMX</Text>

                            <View style={{ height: 20 }} />
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.btnAceptar}
                            onPress={() => {
                                setTerminosAceptados(true);
                                clearError("terminos");
                                setModalTerminos(false);
                            }}
                        >
                            <Text style={styles.btnAceptarText}>Acepto los Términos y Condiciones</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        marginTop: 20,
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
    terminosRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        flexWrap: "wrap",
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: "#e6007e",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    checkboxActivo: {
        backgroundColor: "#e6007e",
    },
    terminosTexto: {
        fontSize: 13,
        color: "#e6007e",
    },
    terminosLink: {
        fontSize: 13,
        color: "#e6007e",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: "#e6007e",
        padding: 20,
        maxHeight: "90%",
        flex: 1,
        marginTop: 60,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(230,0,126,0.3)",
        paddingBottom: 12,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#e6007e",
    },
    tcTitulo: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#e6007e",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 20,
    },
    tcSeccion: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#e6007e",
        marginTop: 16,
        marginBottom: 8,
        textDecorationLine: "underline",
    },
    tcSubtitulo: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#e6007e",
        marginTop: 12,
        marginBottom: 4,
    },
    tcTexto: {
        fontSize: 12,
        color: "#e6007e",
        lineHeight: 18,
        opacity: 0.85,
    },
    btnAceptar: {
        backgroundColor: "#e6007e",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 12,
    },
    btnAceptarText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});