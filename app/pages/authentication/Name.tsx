import LogoWithText from "@/components/LogoWithText";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Button1 } from "@/components/Buttons";
import { supabase } from "@/app/lib/Supabase";
import { router } from "expo-router";

const Name = () => {
  useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const imageResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!imageResult.canceled) {
      setImageUri(imageResult.assets[0].uri);
    }
  };

  const handleConfirm = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name to continue.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let avatarPath: string | null = null;

    if (imageUri) {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      avatarPath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(avatarPath, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        setLoading(false);
        Alert.alert("Upload failed", uploadError.message);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        avatar_url: avatarPath,
      })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      Alert.alert("Error", profileError.message);
      return;
    }

    setLoading(false);
    router.replace("/pages/Navbar");
  };

  return (
    <SafeAreaView style={styles.main}>
      <LogoWithText />

      <Text style={styles.heading}>Tell us about yourself</Text>

      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarText}>Add Photo (optional)</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#757575"
        value={name}
        onChangeText={setName}
      />

      <Button1
        text={loading ? "Saving..." : "Continue"}
        onPress={handleConfirm}
        width={"90%"}
        // disabled={loading}
      />
    </SafeAreaView>
  );
};

export default Name;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  heading: {
    color: "#fff",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    marginTop: 20,
    textAlign: "center",
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#2C2C2C",
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
    marginTop: 20,
    marginBottom: 50,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#5A5A5A",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    color: "#757575",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});
