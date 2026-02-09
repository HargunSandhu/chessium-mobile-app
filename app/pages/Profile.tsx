import { supabase } from "@/app/lib/Supabase";
import { Images } from "@/assets/images/Images";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UserProfile = {
  full_name: string;
  avatar_url?: string | null;
  bullet_elo?: number;
  blitz_elo?: number;
  rapid_elo?: number;
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const router = useRouter();

  useFonts({ Inter_400Regular, Inter_600SemiBold });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bullet_elo, blitz_elo, rapid_elo")
        .eq("id", user.user.id)
        .maybeSingle();

      if (data) {
        // ensure full_name is always a string
        setProfile({
          full_name: data.full_name || "Guest",
          avatar_url: data.avatar_url ?? null,
          bullet_elo: data.bullet_elo ?? 0,
          blitz_elo: data.blitz_elo ?? 0,
          rapid_elo: data.rapid_elo ?? 0,
        });
      }
    };

    fetchProfile();
  }, []);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop()!;
      const response = await fetch(uri);
      const file = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filename, file, { upsert: true });
      if (uploadError) return Alert.alert("Upload error", uploadError.message);

      const publicUrlData = supabase.storage
        .from("avatars")
        .getPublicUrl(filename);
      const publicUrl = publicUrlData.data.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", (await supabase.auth.getUser()).data.user!.id);

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
    }
  };

  const saveName = async () => {
    if (!nameInput.trim()) return Alert.alert("Name cannot be empty");
    await supabase
      .from("profiles")
      .update({ full_name: nameInput })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);
    setProfile((prev) => (prev ? { ...prev, full_name: nameInput } : prev));
    setEditingName(false);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
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
        <TouchableOpacity onPress={pickAvatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={100} color="#fff" />
          )}
        </TouchableOpacity>

        {editingName ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={[styles.name, { fontSize: 24 }]}
              placeholder="Enter name"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={saveName}>
              <Ionicons name="checkmark-circle" size={28} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditingName(true);
              setNameInput(profile?.full_name ?? "");
            }}
          >
            <Text style={styles.name}>{profile?.full_name ?? "Guest"}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image
            source={{ uri: Images.bullet }}
            style={{ width: 40, height: 40 }}
          />
          <Text style={styles.subHeading}>Bullet</Text>
          <Text style={styles.elo}>{profile?.bullet_elo ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={{ uri: Images.blitz }}
            style={{ width: 40, height: 40 }}
          />
          <Text style={styles.subHeading}>Blitz</Text>
          <Text style={styles.elo}>{profile?.blitz_elo ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Image
            source={{ uri: Images.rapid }}
            style={{ width: 40, height: 40 }}
          />
          <Text style={styles.subHeading}>Rapid</Text>
          <Text style={styles.elo}>{profile?.rapid_elo ?? 0}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13" },
  container: {
    alignSelf: "center",
    marginTop: 40,
    alignItems: "center",
    gap: 16,
  },
  avatar: { width: 100, height: 100, borderRadius: 60 },
  name: { color: "#fff", fontSize: 28 },
  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
    justifyContent: "center",
  },
  backButton: { position: "absolute", left: 16, zIndex: 10 },
  centerHeader: { alignItems: "center" },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { color: "#FFFFFF", fontSize: 28, fontFamily: "Inter_600SemiBold" },
  subHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
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
  elo: { color: "#fff", fontSize: 24, fontFamily: "Inter_600SemiBold" },
});

export default Profile;
