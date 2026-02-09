import Header from "@/components/Header";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/app/lib/Supabase";
import { Ionicons } from "@expo/vector-icons";

type Player = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  elo: number;
};

const Leaderboard = () => {
  const [type, setType] = useState<"global" | "friends">("global");
  const [timeControl, setTimeControl] = useState<"bullet" | "blitz" | "rapid">(
    "blitz",
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (myId) fetchLeaderboard();
  }, [type, timeControl, myId]);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id ?? null;
    setMyId(uid);
  };

  const fetchLeaderboard = async () => {
    setLoading(true);

    try {
      let query = supabase.from("profiles").select(`
        id,
        full_name,
        avatar_url,
        bullet_elo,
        blitz_elo,
        rapid_elo
      `);

      if (type === "friends") {
        // fetch only friends
        const { data: friendsData } = await supabase
          .from("friends")
          .select(
            `
            user_id,
            friend_id
          `,
          )
          .or(`user_id.eq.${myId},friend_id.eq.${myId}`)
          .eq("status", "accepted");

        const friendIds: string[] = [];
        friendsData?.forEach((f: any) => {
          if (f.user_id !== myId) friendIds.push(f.user_id);
          if (f.friend_id !== myId) friendIds.push(f.friend_id);
        });

        query = query.in("id", friendIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped: Player[] = (data ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        elo:
          timeControl === "bullet"
            ? (p.bullet_elo ?? 500)
            : timeControl === "blitz"
              ? (p.blitz_elo ?? 500)
              : (p.rapid_elo ?? 500),
      }));

      mapped.sort((a, b) => b.elo - a.elo); // descending

      setPlayers(mapped);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPlayer = ({ item, index }: { item: Player; index: number }) => (
    <View style={styles.playerContainer}>
      <Text style={styles.rank}>{index + 1}</Text>
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <Ionicons name="person-circle-outline" size={40} color="#fff" />
      )}
      <Text style={styles.playerName}>{item.full_name}</Text>
      <Text style={styles.elo}>{item.elo}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Filters */}
      <View style={styles.chooseContainer}>
        <TouchableOpacity onPress={() => setType("global")}>
          <Text style={[styles.txt, type === "global" && styles.activeOption]}>
            Global
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setType("friends")}>
          <Text style={[styles.txt, type === "friends" && styles.activeOption]}>
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.chooseContainer, { marginBottom: 20 }]}>
        <TouchableOpacity onPress={() => setTimeControl("bullet")}>
          <Text
            style={[
              styles.txt,
              timeControl === "bullet" && styles.activeOption,
            ]}
          >
            Bullet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTimeControl("blitz")}>
          <Text
            style={[styles.txt, timeControl === "blitz" && styles.activeOption]}
          >
            Blitz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTimeControl("rapid")}>
          <Text
            style={[styles.txt, timeControl === "rapid" && styles.activeOption]}
          >
            Rapid
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : players.length === 0 ? (
        <Text style={{ color: "#fff", marginTop: 50 }}>No players found</Text>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  txt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    padding: 7,
  },
  chooseContainer: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#141821",
    padding: 20,
    marginTop: 15,
    borderRadius: 12,
  },
  activeOption: {
    borderColor: "#3B82F6",
    borderWidth: 1,
    borderRadius: 8,
    color: "#3B82F6",
    padding: 7,
  },
  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141821",
    width: "90%",
    height: 60,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  rank: { color: "#fff", fontSize: 16, width: 25 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  playerName: { color: "#fff", fontSize: 16, flex: 1, marginLeft: 10 },
  elo: { color: "#3B82F6", fontSize: 16, fontWeight: "600" },
});

export default Leaderboard;
