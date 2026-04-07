import { useRef,useEffect} from "react";
import {TextInput,Animated,View,StyleSheet} from "react-native";
import Main from "../assets/styles/Main";

const FloatingInput = ({label,value,onChangeText,secureTextEntry,isDark}) => {
    const styles = StyleSheet.create(Main);
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
};

export default FloatingInput;