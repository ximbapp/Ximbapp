import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Home from "./pages/Home";
import Perfil from "./pages/Perfil";
import Ajustes from "./pages/Ajustes";
import DetalleLugar from "./pages/DetalleLugar";
import DetalleEvento from "./pages/DetalleEvento";
import MisLugares from "./pages/MisLugares";
import MisComentarios from "./pages/MisComentarios";
import Favoritos from "./pages/Favoritos";
import OlvidePassword from "./pages/OlvidePassword";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

const Stack = createNativeStackNavigator();

const MainApp = () => {
    const { loadingTheme } = useContext(ThemeContext);
    if (loadingTheme) return null;
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Registro" component={Registro} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Perfil" component={Perfil} />
                <Stack.Screen name="Ajustes" component={Ajustes} />
                <Stack.Screen name="DetalleLugar" component={DetalleLugar} />
                <Stack.Screen name="DetalleEvento" component={DetalleEvento} />
                <Stack.Screen name="MisLugares" component={MisLugares} />
                <Stack.Screen name="MisComentarios" component={MisComentarios} />
                <Stack.Screen name="Favoritos" component={Favoritos} />
                <Stack.Screen name="OlvidePassword" component={OlvidePassword} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <ThemeProvider>
            <MainApp />
        </ThemeProvider>
    );
};

export default App;