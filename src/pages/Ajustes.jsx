import React, { useContext, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
    Platform,
    StyleSheet,
} from "react-native";

import { ThemeContext } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { globalStyles, COLORS } from "../theme/styles";

const Ajustes = ({ navigation }) => {
    const { themeMode, setThemeMode, isDark } = useContext(ThemeContext);

    const [idioma, setIdioma] = useState("Español");
    const [notificaciones, setNotificaciones] = useState(true);

    const handleBorrarHistorial = () => {
        alert("Historial borrado (simulado)");
    };

    return (
        <View style={[globalStyles.container, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg, alignItems: Platform.OS === "web" ? "center" : "stretch" }]}>
            <View style={globalStyles.webWrapper}>
                <TouchableOpacity style={globalStyles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color={COLORS.primary} />
                </TouchableOpacity>

                <Text style={globalStyles.screenTitleConfig}>Configuración</Text>

                <ScrollView contentContainerStyle={globalStyles.scrollContainer} showsVerticalScrollIndicator={false}>

                    <View style={[globalStyles.cardConfiguracion, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleConfig}>Modo Oscuro</Text>
                        <TouchableOpacity style={[styles.option, themeMode === "auto" && styles.active]} onPress={() => setThemeMode("auto")}>
                            <MaterialIcons name="brightness-auto" size={22} color={COLORS.primarySuperDark} />
                            <Text style={styles.optionText}>Automático</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.option, themeMode === "light" && styles.active]} onPress={() => setThemeMode("light")}>
                            <MaterialIcons name="light-mode" size={22} color={COLORS.prymarySol} />
                            <Text style={styles.optionText}>Claro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.option, themeMode === "dark" && styles.active]} onPress={() => setThemeMode("dark")}>
                            <MaterialIcons name="dark-mode" size={22} color={COLORS.prymaryLuna} />
                            <Text style={styles.optionText}>Oscuro</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[globalStyles.cardConfiguracion, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleConfig}>Idioma</Text>
                        <TouchableOpacity style={[styles.option, idioma === "Español" && styles.active]} onPress={() => setIdioma("Español")}>
                            <MaterialIcons name="language" size={22} color={COLORS.primaryIconIdioma} />
                            <Text style={styles.optionText}>Español</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.option, idioma === "Inglés" && styles.active]} onPress={() => setIdioma("Inglés")}>
                            <MaterialIcons name="language" size={22} color={COLORS.primaryIconIdioma} />
                            <Text style={styles.optionText}>Inglés</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[globalStyles.cardConfiguracion, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleConfig}>Notificaciones</Text>
                        <View style={styles.switchRow}>
                            <View style={styles.switchLeft}>
                                <MaterialIcons name="notifications" size={22} color={COLORS.primaryIconNoti} />
                                <Text style={styles.optionText}>Activar notificaciones</Text>
                            </View>
                            <Switch
                                value={notificaciones}
                                onValueChange={setNotificaciones}
                                trackColor={{ false: "#ccc", true: COLORS.primary }}
                                thumbColor={COLORS.blanco}
                            />
                        </View>
                    </View>

                    <View style={[globalStyles.cardConfiguracion, { backgroundColor: isDark ? COLORS.darkBg : COLORS.lightBg }]}>
                        <Text style={globalStyles.sectionTitleConfig}>Historial</Text>
                        <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleBorrarHistorial}>
                            <MaterialIcons name="delete" size={22} color={COLORS.blanco} />
                            <Text style={globalStyles.btnPrimaryText}>Borrar historial</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </View>
    );
};

export default Ajustes;

const styles = StyleSheet.create({
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 8,
    },
    optionText: {
        fontSize: 15,
        color: COLORS.primaryletraConfig,
        fontWeight: "bold",
    },
    active: {
        backgroundColor: COLORS.primaryLight,
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
    switchLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
});