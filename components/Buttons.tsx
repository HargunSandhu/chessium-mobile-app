import React from "react";
import {
  Text,
  StyleSheet,
  Image,
  DimensionValue,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";

type ButtonProps = {
  text?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  onPress?: () => void;
  imagePath?: string;
  imageSize?: number;
};

const Button1 = ({
  text,
  onPress,
  width = "100%",
  height = 56,
}: ButtonProps) => {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, { width, height }]}
    >
      <TouchableOpacity onPress={onPress} style={styles.pressable}>
        <Text style={styles.primaryText}>{text}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const Button2 = ({
  text,
  onPress,
  imagePath,
  imageSize = 24,
  width = "100%",
  height = 56,
}: ButtonProps) => {
  const showText = !!text;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.outlineButton, { width, height }]}
    >
      {showText ? (
        <View style={styles.row}>
          {imagePath && (
            <Image
              source={{ uri: imagePath }}
              style={{
                width: imageSize,
                height: imageSize,
                marginRight: 10,
              }}
              resizeMode="contain"
            />
          )}
          <Text style={styles.secondaryText}>{text}</Text>
        </View>
      ) : (
        imagePath && (
          <Image
            source={{ uri: imagePath }}
            style={{ width: imageSize, height: imageSize }}
            resizeMode="contain"
          />
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  gradient: {
    borderRadius: 12,
  },

  primaryText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  secondaryText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
});

export { Button1, Button2 };
