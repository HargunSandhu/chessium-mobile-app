import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/app/lib/Supabase";

const Chat = () => {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();

  const [friend, setFriend] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (friendId) {
      fetchFriend();
    }
  }, [friendId]);

  const fetchFriend = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, user_status")
      .eq("id", friendId)
      .single();

    if (!error) {
      setFriend(data);
    }

    setLoading(false);
  };

  const isOnline = friend?.user_status === "online";

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={30}
            color="#3B82F6"
            style={{ marginHorizontal: 20 }}
          />
        </TouchableOpacity>

        {loading ? (
          <Text style={{ color: "#fff" }}>Loading...</Text>
        ) : (
          <View style={styles.userInfo}>
            {friend?.avatar_url ? (
              <Image
                source={{ uri: friend.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={45} color="#fff" />
            )}

            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.name}>{friend?.full_name ?? "Player"}</Text>
              <Text
                style={[
                  styles.status,
                  { color: isOnline ? "#22C55E" : "#EF4444" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
  topBar: {
    height: 60,
    backgroundColor: "#141821",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  name: {
    color: "#fff",
    fontSize: 18,
  },
  status: {
    fontSize: 14,
  },
});

export default Chat;
