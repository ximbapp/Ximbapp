import React, { createContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemTheme = useColorScheme();

    const [themeMode, setThemeMode] = useState("auto");
    const [loadingTheme, setLoadingTheme] = useState(true);

    const isDark =
        themeMode === "dark" || (themeMode === "auto" && systemTheme === "dark");

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem("themeMode");
                if (savedTheme) setThemeMode(savedTheme);
            } catch (error) {
                console.log(error);
            } finally {
                setLoadingTheme(false);
            }
        };

        loadTheme();
    }, []);

    const changeTheme = async (mode) => {
        setThemeMode(mode);
        await AsyncStorage.setItem("themeMode", mode);
    };

    return (
        <ThemeContext.Provider
            value={{ themeMode, setThemeMode: changeTheme, isDark, loadingTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
};