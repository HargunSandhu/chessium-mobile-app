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
  Modal,
} from "react-native";
import { supabase, SUPABASE_URL } from "@/app/lib/Supabase";
import { useRouter } from "expo-router";

const FriendList = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [popup, setPopup] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id ?? null;
    setMyId(uid);
    if (uid) await fetchFriends(uid);
    subscribeChallenges(uid);
    setLoading(false);
  };

  const fetchFriends = async (uid: string) => {
    const { data } = await supabase
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
      .or(`user_id.eq.${uid},friend_id.eq.${uid}`);

    if (!data) return;

    const formatted = data.map((item: any) => {
      const isMeSender = item.user_id === uid;
      return {
        id: item.id,
        profile: isMeSender ? item.friendProfile : item.userProfile,
      };
    });

    setFriends(formatted);
  };

  const subscribeChallenges = (uid: string | null) => {
    if (!uid) return;
    const channel = supabase
      .channel("friend-challenges")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_challenges",
          filter: `to_user_id=eq.${uid}`,
        },
        (payload) => {
          if (payload.new.status === "pending") setPopup(payload.new);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleChat = (friendId: string) => {
    router.push({
      pathname: "/pages/Chat",
      params: { friendId },
    });
  };

  const acceptChallenge = async (challengeId: string) => {
    if (!myId) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/friend-matchmaking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "accept", challenge_id: challengeId }),
    });

    const { match_id } = await res.json();
    setPopup(null);
    router.push(`/pages/competitiveMode/GameScreen?matchId=${match_id}`);
  };

  const rejectChallenge = async (challengeId: string) => {
    if (!myId) return;
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    await fetch(`${SUPABASE_URL}/functions/v1/friend-matchmaking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "reject", challenge_id: challengeId }),
    });

    setPopup(null);
  };

  const renderItem = ({ item }: { item: any }) => {
    const profile = item.profile;
    const isOnline = profile?.user_status === "online";

    const handleViewProfile = (profileId: string) => {
      router.push({
        pathname: "/pages/OthersProfile",
        params: { userId: profileId },
      });
    };

    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity
          onPress={() => handleViewProfile(profile.id)}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
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
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.btn}>
            <Ionicons
              name="chatbox-ellipses"
              size={24}
              color="#3b82f6"
              onPress={() => handleChat(profile.id)}
            />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.btn}
            onPress={() => handlePlay(profile.id)}
          >
            <Ionicons name="game-controller" size={24} color="#3b82f6" />
          </TouchableOpacity> */}
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
    <>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12, paddingTop: 10 }}
      />

      {/* Popup Modal for Incoming Challenges */}
      <Modal visible={!!popup} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>
            {popup && (
              <>
                <Text style={styles.popupTitle}>New Challenge!</Text>
                <Text style={styles.popupText}>From: {popup.from_user_id}</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    style={[styles.popupBtn, { backgroundColor: "#22C55E" }]}
                    onPress={() => acceptChallenge(popup.id)}
                  >
                    <Text style={styles.popupBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.popupBtn, { backgroundColor: "#EF4444" }]}
                    onPress={() => rejectChallenge(popup.id)}
                  >
                    <Text style={styles.popupBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  popup: {
    width: 300,
    padding: 20,
    backgroundColor: "#141821",
    borderRadius: 12,
    alignItems: "center",
  },
  popupTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  popupText: {
    color: "#fff",
    marginTop: 10,
  },
  popupBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  popupBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default FriendList;
