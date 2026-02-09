import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/app/lib/Supabase";
import { Images } from "@/assets/images/Images";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useLocalSearchParams, useRouter } from "expo-router";

type UserProfile = {
  full_name: string;
  avatar_url?: string | null;
  bullet_elo?: number;
  blitz_elo?: number;
  rapid_elo?: number;
};

const OthersProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bullet_elo, blitz_elo, rapid_elo")
        .eq("id", userId)
        .maybeSingle();

      if (data) setProfile(data);
    };

    fetchProfile();
  }, [userId]);

  return (
    <SafeAreaView style={styles.main}>
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
          <Text style={styles.heading}>Profile</Text>
        </View>
      </View>
      <View style={styles.container}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#fff" />
        )}
        <Text style={styles.name}>{profile?.full_name ?? "Guest"}</Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image source={{ uri: Images.bullet }} style={styles.icon} />
          <Text style={styles.subHeading}>Bullet</Text>
          <Text style={styles.elo}>{profile?.bullet_elo ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Image source={{ uri: Images.blitz }} style={styles.icon} />
          <Text style={styles.subHeading}>Blitz</Text>
          <Text style={styles.elo}>{profile?.blitz_elo ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Image source={{ uri: Images.rapid }} style={styles.icon} />
          <Text style={styles.subHeading}>Rapid</Text>
          <Text style={styles.elo}>{profile?.rapid_elo ?? 0}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
  container: {
    alignSelf: "center",
    marginTop: 40,
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  name: {
    color: "#fff",
    fontSize: 28,
    marginTop: 12,
    fontFamily: "Inter_600SemiBold",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B82F6",
    width: "30%",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 40,
    height: 40,
  },
  subHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
  },
  elo: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
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
});

export default OthersProfile;
