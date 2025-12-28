import { Images } from "@/assets/images/Images";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ChooseAiLevel = () => {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });
  const router = useRouter();

  const levels = [
    { level: 1, title: "Level 1: Beginner", slogan: "Just Starting Out" },
    { level: 2, title: "Level 2: Novice", slogan: "Just Beyond Basics" },
    { level: 3, title: "Level 3: Intermediate", slogan: "Developing Strategy" },
    { level: 4, title: "Level 4: Advanced", slogan: "The Strategist" },
    { level: 5, title: "Level 5: Master/Expert", slogan: "The Final Test" },
  ];

  return (
    <SafeAreaView style={styles.main}>
      <Image source={{ uri: Images.rook }} style={styles.rook} />
      <Image source={{ uri: Images.king }} style={styles.king} />
      <Image source={{ uri: Images.knight }} style={styles.knight} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.navigate("/pages/Dashboard")}
          activeOpacity={0.8}
          style={styles.backWrapper}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-back" size={26} color="#3B82F6" />
          </View>
        </TouchableOpacity>
        <Text style={styles.heading}>Choose AI Level</Text>
      </View>

      {levels.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={{ width: "100%" }}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/pages/aiMode/AiGameScreen",
              params: { level: item.level.toString() },
            })
          }
        >
          <View style={styles.buttons}>
            <View>
              <Text style={styles.levelTxt}>{item.title}</Text>
              <Text style={styles.sloganTxt}>{item.slogan}</Text>
            </View>
            <Ionicons name="arrow-forward" size={28} color="#3B82F6" />
          </View>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 10,
  },

  backWrapper: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },

  rook: {
    position: "absolute",
    width: 200,
    height: 200,
    resizeMode: "contain",
    opacity: 0.5,
    bottom: 100,
    left: -1,
    transform: [{ rotate: "25deg" }],
  },

  king: {
    position: "absolute",
    right: -20,
    top: 200,
    width: 300,
    height: 300,
    opacity: 0.6,
  },

  knight: {
    position: "absolute",
    width: 150,
    height: 200,
    opacity: 0.5,
    left: -5,
    top: 200,
    resizeMode: "contain",
    transform: [{ rotate: "-15deg" }],
  },

  buttons: {
    width: "85%",
    height: 90,
    backgroundColor: "#141821",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 30,
  },

  levelTxt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },

  sloganTxt: {
    color: "#B3B3B3",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});

export default ChooseAiLevel;
