import React, { useRef, useEffect } from "react";
import { View, TextInput, StyleSheet, Animated } from "react-native";


const FloatingInput = ({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    isDark,
}) => {
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
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!!secureTextEntry}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoCapitalize="none"
                placeholderTextColor="rgba(230,0,126,0.6)"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginTop: 25,
        position: "relative",
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: "#e6007e",
        paddingHorizontal: 5,
        paddingTop: 18,
        paddingBottom: 8,
        fontSize: 16,
        backgroundColor: "transparent",
        color: "#e6007e",
    },
});

export default FloatingInput;