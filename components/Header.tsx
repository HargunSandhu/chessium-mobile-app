import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { Ionicons } from "@expo/vector-icons";
import { Images } from "@/assets/images/Images";
import { Inter_600SemiBold, useFonts } from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";

const Header = () => {
  useFonts({
    Inter_600SemiBold,
  });

  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.logoWrapper}>
          <Image
            source={{ uri: Images.logo_knight }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Chessium</Text>
      </View>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.navigate("/pages/Profile")}
      >
        <Ionicons name="person-circle-outline" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 70,
    backgroundColor: "#141821",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  // 🔹 Added wrapper to visually center logo despite transparent padding
  logoWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 50, // limits vertical space
    marginRight: 6,
    marginTop: 4, // small offset to balance visual alignment
  },
  logo: {
    width: 75,
    height: 75,
  },
  title: {
    color: "white",
    fontSize: 26,
    fontFamily: "Inter_600SemiBold",
  },
  profileButton: {
    padding: 4,
  },
});

export default Header;
