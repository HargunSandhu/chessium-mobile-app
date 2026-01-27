import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { supabase } from "@/app/lib/Supabase";

const Requests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const myId = sessionData.session?.user.id;

    if (!myId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("friends")
      .select(
        `
        id,
        user_id,
        sender:profiles!friends_user_profiles_fkey (
          id,
          full_name,
          user_status,
          avatar_url
        )
      `,
      )
      .eq("friend_id", myId)
      .eq("status", "pending");

    if (error) {
      console.log("fetch error", error);
      setLoading(false);
      return;
    }

    setRequests(data ?? []);
    setLoading(false);
  };

  const acceptRequest = async (senderId: string) => {
    const { data } = await supabase.auth.getSession();
    const myId = data.session?.user.id;
    if (!myId) return;

    await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("user_id", senderId)
      .eq("friend_id", myId);

    setRequests((prev) => prev.filter((r) => r.user_id !== senderId));
  };

  const declineRequest = async (senderId: string) => {
    const { data } = await supabase.auth.getSession();
    const myId = data.session?.user.id;
    if (!myId) return;

    await supabase
      .from("friends")
      .delete()
      .eq("user_id", senderId)
      .eq("friend_id", myId);

    setRequests((prev) => prev.filter((r) => r.user_id !== senderId));
  };

  const renderItem = ({ item }: { item: any }) => {
    const profile = item.sender;
    const isOnline = profile?.user_status === "online";

    return (
      <View style={styles.playerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={50} color="#fff" />
          )}

          <View>
            <Text style={styles.playerName}>
              {profile?.full_name ?? "Player"}
            </Text>
            <Text
              style={[
                styles.playerStatus,
                { color: isOnline ? "#22C55E" : "#EF4444" },
              ]}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.btnAccept}
            onPress={() => acceptRequest(item.user_id)}
          >
            <Ionicons name="checkmark-sharp" size={22} color="#22C55E" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnDecline}
            onPress={() => declineRequest(item.user_id)}
          >
            <Ionicons name="close-sharp" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#3B82F6"
        style={{ marginTop: 30 }}
      />
    );
  }

  if (requests.length === 0) {
    return (
      <Text style={{ color: "#fff", alignSelf: "center", marginTop: 30 }}>
        No Friend Requests
      </Text>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ gap: 12, paddingTop: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: "#141821",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
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
  btnAccept: {
    borderWidth: 1,
    borderColor: "#22C55E",
    padding: 10,
    borderRadius: 8,
  },
  btnDecline: {
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
  },
});

export default Requests;
