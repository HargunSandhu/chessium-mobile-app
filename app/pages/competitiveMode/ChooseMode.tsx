import { supabase } from "@/app/lib/Supabase";
import { Images } from "@/assets/images/Images";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ChooseMode = () => {
  const [bulletElo, setBulletElo] = useState<number | null>(null);
  const [blitzElo, setBlitzElo] = useState<number | null>(null);
  const [rapidElo, setRapidElo] = useState<number | null>(null);
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });

  const router = useRouter();

  useEffect(() => {
    const loadElo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not found", userError);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("bullet_elo, blitz_elo, rapid_elo")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching ELO:", error);
        return;
      }

      setBulletElo(data?.bullet_elo);
      setBlitzElo(data?.blitz_elo);
      setRapidElo(data?.rapid_elo);
    };

    loadElo();
  }, []);
  const modes = [
    {
      mode: 1,
      title: "Bullet",
      time: "1 min",
      icon: Images.bullet,
      elo: bulletElo,
    },
    {
      mode: 2,
      title: "Blitz",
      time: "3 min",
      icon: Images.blitz,
      elo: blitzElo,
    },
    {
      mode: 3,
      title: "Rapid",
      time: "10 min",
      icon: Images.rapid,
      elo: rapidElo,
    },
  ];

  return (
    <SafeAreaView style={styles.main}>
      <Image source={{ uri: Images.rook }} style={styles.rook} />
      <Image source={{ uri: Images.king }} style={styles.king} />
      <Image source={{ uri: Images.knight }} style={styles.knight} />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </View>
        </TouchableOpacity>

        <View style={styles.centerHeader}>
          <Text style={styles.heading}>Choose Mode</Text>
          <Text style={styles.subHeading}>Player vs Player</Text>
        </View>
      </View>

      <View style={styles.cardsWrapper}>
        {modes.map((item) => (
          <TouchableOpacity
            key={item.mode}
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: "/pages/competitiveMode/FindingOpponent",
                params: { mode: item.title },
              });
            }}
          >
            <View style={styles.card}>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
                <Text style={styles.elo}>{item.elo}</Text>
              </View>

              <View style={styles.rightIcons}>
                <Image source={{ uri: item.icon }} style={styles.modeIcon} />
                <Ionicons name="arrow-forward" size={22} color="#3B82F6" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },

  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },

  centerHeader: {
    alignItems: "center",
  },

  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
  },

  subHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
  },

  cardsWrapper: {
    alignItems: "center",
  },

  card: {
    width: 300,
    height: 150,
    backgroundColor: "#141821",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingHorizontal: 20,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },

  time: {
    color: "#B3B3B3",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },

  elo: {
    color: "#3B82F6",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },

  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  modeIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },

  rook: {
    position: "absolute",
    width: 180,
    height: 180,
    opacity: 0.5,
    bottom: 100,
    left: -10,
    resizeMode: "contain",
  },

  king: {
    position: "absolute",
    right: -20,
    top: 180,
    width: 280,
    height: 280,
    opacity: 0.5,
  },

  knight: {
    position: "absolute",
    width: 140,
    height: 180,
    opacity: 0.5,
    left: -10,
    top: 220,
    resizeMode: "contain",
  },
});

export default ChooseMode;
