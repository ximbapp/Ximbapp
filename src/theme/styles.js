import { StyleSheet, Platform } from "react-native";

// ─────────────────────────────────────────
// COLORES GLOBALES
// ─────────────────────────────────────────
export const COLORS = {
    // Primarios
    primary: "#e6007e",
    primaryLight: "rgba(230,0,126,0.1)",
    primaryMedium: "rgba(230,0,126,0.3)",
    primaryFade: "rgba(230,0,126,0.6)",

    // Eventos (naranja)
    evento: "#ff6600",
    eventoLight: "rgba(255,102,0,0.1)",
    eventoMedium: "rgba(255,102,0,0.3)",

    // Acciones
    azul: "#3A86FF",
    rojo: "#FF3A3A",
    verde: "#2E8B57",

    // Fondos modo oscuro
    darkBg: "#3A3A46",
    darkCard: "#2C2C36",

    // Fondos modo claro
    lightBg: "#ffffff",
    lightCard: "#f5f5f5",

    // Texto
    blanco: "#ffffff",
    negro: "#000000",

    // Avatares — colores pastel
    avatarRosa: "#FFB3D1",
    avatarMorado: "#C9B3FF",
    avatarAzul: "#B3D9FF",
    avatarVerde: "#B3FFD1",
    avatarAmarillo: "#FFF5B3",
    avatarNaranja: "#FFD9B3",
    avatarRojo: "#FFB3B3",
    avatarGris: "#E0E0E0",

    // Categorías marcadores
    historiaColor: "#8B4513",
    religiosoColor: "#6A0DAD",
    recreativoColor: "#2E8B57",
    gastronomiaColor: "#FF6347",
    aventuraColor: "#228B22",
    eventosColor: "#FF8C00",
};

// ─────────────────────────────────────────
// TIPOGRAFÍA
// ─────────────────────────────────────────
export const FONTS = {
    small: 11,
    body: 13,
    regular: 14,
    medium: 15,
    large: 16,
    title: 18,
    header: 20,
    big: 26,
};

// ─────────────────────────────────────────
// ESPACIADO
// ─────────────────────────────────────────
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
};

// ─────────────────────────────────────────
// BORDES
// ─────────────────────────────────────────
export const RADIUS = {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 15,
    xxl: 20,
    round: 50,
};

// ─────────────────────────────────────────
// ESTILOS GLOBALES REUTILIZABLES
// ─────────────────────────────────────────
export const globalStyles = StyleSheet.create({

    // ── Contenedores ──
    container: {
        flex: 1,
        padding: SPACING.xl,
    },
    webWrapper: {
        width: "100%",
        maxWidth: Platform.OS === "web" ? 650 : "100%",
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Headers ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === "ios" ? 50 : 40,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
    },
    headerTitle: {
        fontSize: FONTS.title,
        fontWeight: "bold",
        color: COLORS.primary,
        flex: 1,
        textAlign: "center",
        marginHorizontal: SPACING.sm,
    },
    screenTitle: {
        fontSize: FONTS.big,
        fontWeight: "bold",
        color: COLORS.primary,
        textAlign: "center",
        marginTop: Platform.OS === "web" ? 15 : 45,
        marginBottom: SPACING.xl,
    },

    // ── Cards ──
    card: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg + 2,
        marginBottom: SPACING.lg + 2,
    },
    cardSoft: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.primaryMedium,
    },
    sectionTitle: {
        fontSize: FONTS.large,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 15,
        textAlign: "center",
    },

    // ── Botones ──
    btnPrimary: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: SPACING.sm,
    },
    btnPrimaryText: {
        color: COLORS.blanco,
        fontWeight: "bold",
        fontSize: FONTS.large,
    },
    btnOutline: {
        backgroundColor: "transparent",
        paddingVertical: 14,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: SPACING.sm,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    btnOutlineText: {
        color: COLORS.primary,
        fontWeight: "bold",
        fontSize: FONTS.large,
    },
    btnAzul: {
        backgroundColor: COLORS.azul,
        paddingVertical: 12,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: SPACING.sm,
        flex: 1,
    },
    btnRojo: {
        backgroundColor: COLORS.rojo,
        paddingVertical: 12,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: SPACING.sm,
        flex: 1,
    },
    btnText: {
        color: COLORS.blanco,
        fontWeight: "bold",
        fontSize: FONTS.regular,
    },

    // ── Inputs ──
    input: {
        borderRadius: RADIUS.sm,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        fontSize: FONTS.medium,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginTop: SPACING.xs,
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: "top",
    },
    label: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        marginTop: SPACING.sm + 2,
        fontWeight: "bold",
    },
    value: {
        fontSize: FONTS.medium,
        color: COLORS.primary,
        marginTop: 2,
    },

    // ── Filas de info ──
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    infoLabel: {
        fontSize: FONTS.body,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    infoValue: {
        fontSize: FONTS.regular,
        color: COLORS.primary,
        flex: 1,
    },

    // ── Back button ──
    backButton: {
        position: "absolute",
        top: Platform.OS === "web" ? 15 : 45,
        left: 0,
        zIndex: 10,
        padding: 5,
    },

    // ── Empty state ──
    emptyContainer: {
        alignItems: "center",
        marginTop: 80,
        gap: SPACING.md,
    },
    emptyText: {
        color: COLORS.primaryFade,
        fontSize: FONTS.medium,
        fontWeight: "bold",
    },

    // ── Botones de acción (fila) ──
    botonesAccion: {
        flexDirection: "row",
        gap: SPACING.md,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },

    // ── Avatar ──
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.sm + 2,
    },
    avatarImage: {
        width: 80,
        height: 80,
    },
    avatarEditBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarNombre: {
        fontSize: FONTS.title,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    avatarEmail: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        opacity: 0.7,
        marginTop: 2,
    },

    // ── Modales ──
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xl,
    },
    modalBottomOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        width: "100%",
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: SPACING.lg + 2,
        maxHeight: "85%",
    },
    modalBottomContent: {
        borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl,
        padding: SPACING.xxl,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    modalTitle: {
        fontSize: FONTS.title,
        fontWeight: "bold",
        color: COLORS.primary,
    },

    // ── Chips de filtro ──
    filtroChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: RADIUS.round,
        backgroundColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    filtroChipActivo: {
        backgroundColor: COLORS.primary,
    },
    filtroChipText: {
        fontSize: 12,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    filtroChipTextActivo: {
        color: COLORS.blanco,
    },

    // ── Date button ──
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm + 2,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginBottom: SPACING.md,
    },
    dateButtonText: {
        color: COLORS.primary,
        fontSize: FONTS.medium,
        fontWeight: "bold",
    },

    // ── Checkbox ──
    checkRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm + 2,
        marginBottom: SPACING.md,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxActivo: {
        backgroundColor: COLORS.primary,
    },
    checkLabel: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        fontWeight: "bold",
    },

    // ── Save button ──
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: RADIUS.md,
        alignItems: "center",
        marginTop: SPACING.sm + 2,
        marginBottom: SPACING.xl,
    },
    saveButtonText: {
        color: COLORS.blanco,
        fontWeight: "bold",
        fontSize: FONTS.large,
    },

    // ── Foto preview ──
    fotosPreview: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    fotoPreview: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    fotoDelete: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },

    // ── Result cards (buscador) ──
    resultCard: {
        borderRadius: RADIUS.md,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.primaryMedium,
        marginBottom: SPACING.sm + 2,
    },
    resultTitle: {
        fontSize: FONTS.medium,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    resultCategory: {
        fontSize: 12,
        fontWeight: "bold",
        color: COLORS.primaryFade,
        marginTop: 3,
    },
    resultDesc: {
        fontSize: FONTS.body,
        color: COLORS.primary,
        marginTop: SPACING.xs + 2,
    },
});