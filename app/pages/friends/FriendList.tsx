import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { supabase } from "@/app/lib/Supabase";
import { useRouter } from "expo-router";

const FriendList = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
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
        friend_id,
        userProfile:profiles!friends_user_profiles_fkey (
          id,
          full_name,
          user_status,
          avatar_url
        ),
        friendProfile:profiles!friends_friend_profiles_fkey (
          id,
          full_name,
          user_status,
          avatar_url
        )
      `,
      )
      .eq("status", "accepted")
      .or(`user_id.eq.${myId},friend_id.eq.${myId}`);

    if (error) {
      console.log("fetch error", error);
      setLoading(false);
      return;
    }

    const formatted = data.map((item: any) => {
      const isMeSender = item.user_id === myId;
      return {
        id: item.id,
        profile: isMeSender ? item.friendProfile : item.userProfile,
      };
    });

    setFriends(formatted);
    setLoading(false);
  };

  const handleChat = (friendId: string) => {
    router.push({
      pathname: "/pages/Chat",
      params: { friendId },
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const profile = item.profile;
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
          <TouchableOpacity style={styles.btn}>
            <Ionicons
              name="chatbox-ellipses"
              size={24}
              color="#3b82f6"
              onPress={() => handleChat(profile.id)}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn}>
            <Ionicons name="game-controller" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#3b82f6"
        style={{ marginTop: 30 }}
      />
    );
  }

  if (friends.length === 0) {
    return (
      <Text style={{ color: "#fff", alignSelf: "center", marginTop: 30 }}>
        No Friends Yet
      </Text>
    );
  }

  return (
    <FlatList
      data={friends}
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
  btn: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
  },
});

export default FriendList;
