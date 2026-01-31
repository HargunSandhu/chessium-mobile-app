import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { supabase, SUPABASE_URL } from "@/app/lib/Supabase";
import { useRouter } from "expo-router";

const IncomingChallenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const session = await supabase.auth.getSession();
    const myId = session.data.session?.user.id;
    if (!myId) return;

    const { data } = await supabase
      .from("friend_challenges")
      .select(
        `
        id,
        time_mode_id,
        from_user_id,
        profiles:from_user_id (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("to_user_id", myId)
      .eq("status", "pending");

    setChallenges(data ?? []);
  };

  const accept = async (challengeId: string) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/friend-matchmaking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "accept",
        challenge_id: challengeId,
      }),
    });

    const { match_id } = await res.json();

    router.push({
      pathname: "/pages/competitiveMode/GameScreen",
      params: { matchId: match_id },
    });
  };

  const reject = async (challengeId: string) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    await fetch(`${SUPABASE_URL}/functions/v1/friend-matchmaking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: "reject",
        challenge_id: challengeId,
      }),
    });

    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
  };

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {item.profiles?.avatar_url ? (
              <Image
                source={{ uri: item.profiles.avatar_url }}
                style={styles.avatar}
              />
            ) : null}
            <Text style={styles.name}>
              {item.profiles?.full_name ?? "Player"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[styles.btn, styles.accept]}
              onPress={() => accept(item.id)}
            >
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.reject]}
              onPress={() => reject(item.id)}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B0E13",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    color: "#fff",
    fontSize: 16,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  accept: {
    backgroundColor: "#22C55E",
  },
  reject: {
    backgroundColor: "#EF4444",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default IncomingChallenges;
