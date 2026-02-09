import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { supabase, SUPABASE_URL } from "@/app/lib/Supabase";
import { useRouter } from "expo-router";

const AddFriend = () => {
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useFonts({ Inter_600SemiBold, Inter_400Regular });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSearch = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/get-friend-suggestions?username=${username}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setSuggestions(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    try {
      await supabase.from("friends").insert({
        user_id: userId,
        friend_id: friendId,
        status: "pending",
      });
      alert("Friend request sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  // Navigate to OthersProfile screen
  const handleViewProfile = (profileId: string) => {
    router.push({
      pathname: "/pages/OthersProfile",
      params: { userId: profileId },
    });
  };

  const renderPlayer = ({ item }: { item: any }) => {
    const isOnline = item.user_status === "online";

    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity
          onPress={() => handleViewProfile(item.id)}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={50} color="#fff" />
          )}

          <View>
            <Text style={styles.playerName}>{item.full_name || "Player"}</Text>
            <Text
              style={[
                styles.playerStatus,
                { color: isOnline ? "#22C55E" : "#EF4444" },
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => sendFriendRequest(item.id)}>
          <LinearGradient
            colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Ionicons name="paper-plane" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#757575"
        />
        <TouchableOpacity onPress={handleSearch}>
          <LinearGradient
            colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Suggestions</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={{ gap: 10, flexGrow: 1 }}
          ListEmptyComponent={
            !loading ? (
              <Text
                style={{
                  color: "#FFFFFF",
                  alignSelf: "center",
                  marginTop: 40,
                  fontFamily: "Inter_400Regular",
                }}
              >
                No Players Found
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20, flex: 1 },
  inputWrapper: { width: "90%", flexDirection: "row", alignItems: "center" },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#1E2230",
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    margin: 20,
    fontFamily: "Inter_600SemiBold",
    alignSelf: "flex-start",
  },
  playerContainer: {
    backgroundColor: "#141821",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    height: 75,
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 12,
    alignSelf: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  playerStatus: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    height: 40,
    width: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AddFriend;
