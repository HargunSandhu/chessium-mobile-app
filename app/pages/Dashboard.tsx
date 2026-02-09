import { Images } from "@/assets/images/Images";
import Header from "@/components/Header";
import RecentMatchesSlider from "@/components/RecentMatchesSlider";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.main}>
      <Header />

      <Image
        source={{ uri: Images.king }}
        style={styles.king}
        resizeMode="contain"
      />

      <Text style={styles.heading}>Play It</Text>

      <View style={styles.cardsRow}>
        <TouchableOpacity
          onPress={() => router.navigate("/pages/competitiveMode/ChooseMode")}
        >
          <View style={styles.competitiveContainer}>
            <Image source={{ uri: Images.rook }} style={styles.rook} />
            <Text style={styles.competitiveText}>
              Competitive {"\n"}Player vs Player
            </Text>
            <Ionicons
              name="arrow-forward"
              size={35}
              color="#3B82F6"
              style={styles.forwardIconCompetitive}
            />
          </View>
        </TouchableOpacity>

        <View style={{ gap: 5 }}>
          <TouchableOpacity
            onPress={() => {
              router.navigate("/pages/aiMode/ChooseAiLevel");
            }}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
              style={[styles.gradient, { marginTop: 20 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.machineContainer}>
                <Text style={styles.cardsText}>Against the machine</Text>
                <Ionicons
                  name="play"
                  color="#E6FF60"
                  size={12}
                  style={styles.playIcon}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate("/pages/LocalGameScreen")}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.challangeFriendContainer}>
                <Text style={styles.cardsText}>Challenge a friend</Text>
                <Ionicons
                  name="play"
                  color="#E6FF60"
                  size={12}
                  style={styles.playIcon}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <RecentMatchesSlider />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  king: {
    position: "absolute",
    right: -60,
    top: 75,
    width: 400,
    height: 400,
    opacity: 0.75,
  },
  heading: {
    color: "white",
    fontSize: 70,
    textAlign: "left",
    width: "85%",
    marginTop: 30,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    gap: 10,
  },
  competitiveContainer: {
    backgroundColor: "#141821",
    borderWidth: 1,
    borderRadius: 18,
    borderColor: "#3B82F6",
    width: 190,
    height: 250,
    marginTop: 20,
    justifyContent: "center",
  },
  competitiveText: {
    color: "white",
    fontSize: 20,
    padding: 25,
    fontFamily: "Inter_500Medium",
  },
  rook: {
    width: 50,
    height: 120,
    top: -40,
    marginLeft: 25,
    position: "absolute",
  },
  forwardIconCompetitive: { position: "absolute", right: 25, bottom: 25 },
  gradient: {
    borderRadius: 12,
    opacity: 0.95,
  },
  machineContainer: {
    width: 167,
    height: 100,
    marginTop: 20,
  },
  challangeFriendContainer: {
    width: 170,
    height: 100,
    marginTop: 20,
  },
  cardsText: {
    color: "white",
    fontSize: 16,
    padding: 12,
    fontFamily: "Inter_500Medium",
  },
  playIcon: { position: "absolute", right: 20, bottom: 20 },
});

export default Dashboard;
