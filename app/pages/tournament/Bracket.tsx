import { supabase } from "@/app/lib/Supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PlayerSlot = ({ player }: { player?: any }) => {
  if (!player) {
    return (
      <View style={styles.playerSlot}>
        <Ionicons name="remove-circle-outline" size={36} color="#6B7280" />
        <Text style={styles.playerName}>BYE</Text>
      </View>
    );
  }

  return (
    <View style={styles.playerSlot}>
      {player.avatar_url ? (
        <Image source={{ uri: player.avatar_url }} style={styles.avatar} />
      ) : (
        <Ionicons name="person-circle-outline" size={36} color="#6B7280" />
      )}
      <Text style={styles.playerName} numberOfLines={1}>
        {player.full_name}
      </Text>
    </View>
  );
};

const MatchCard = ({ match }: { match: any }) => (
  <View style={styles.matchCard}>
    <Text style={styles.roundText}>Round {match.round}</Text>

    <View style={styles.playersRow}>
      <PlayerSlot player={match.player1} />
      <Text style={styles.vs}>VS</Text>
      <PlayerSlot player={match.player2} />
    </View>

    <Text style={styles.matchStatus}>{match.status}</Text>
  </View>
);

const TournamentBracket = () => {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams();

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    console.log("📌 tournamentId:", tournamentId);

    const { data } = await supabase.auth.getUser();
    console.log("👤 auth user:", data.user);

    if (data.user) setUserId(data.user.id);

    await fetchMatches();
  };

  const fetchMatches = async () => {
    setLoading(true);

    console.log("🔄 fetching matches for tournament:", tournamentId);

    const { data, error } = await supabase
      .from("tournament_matches")
      .select(
        `
        id,
        round,
        status,
        match_id,
        player1:player1_id (
          id,
          full_name,
          avatar_url
        ),
        player2:player2_id (
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq("tournament_id", tournamentId)
      .order("round", { ascending: true });

    if (error) {
      console.log("❌ fetchMatches error:", error);
    } else {
      console.log("✅ matches fetched:", data);
      console.log("📊 matches length:", data?.length);
    }

    if (!error && data) setMatches(data);

    setLoading(false);
  };

  useEffect(() => {
    if (!userId || matches.length === 0 || redirecting) return;

    console.log(
      "🔍 checking pending matches:",
      matches.map((m) => ({
        id: m.id,
        status: m.status,
        p1: m.player1?.id,
        p2: m.player2?.id,
      })),
    );

    const myMatch = matches.find(
      (m) =>
        (m.status === "pending" || m.status === "ongoing") &&
        (m.player1?.id === userId || m.player2?.id === userId),
    );
    console.log("🎯 myMatch found:", myMatch);

    if (myMatch) {
      setRedirecting(true);
      router.replace({
        pathname: "/pages/tournament/TournamentGameScreen",
        params: {
          tournamentMatchId: myMatch.id,
        },
      });
    }
  }, [matches, userId]);

  if (redirecting) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.infoText}>Joining your match…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.heading}>Bracket</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.infoText}>Loading bracket...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="git-branch-outline" size={48} color="#6B7280" />
          <Text style={styles.infoText}>Bracket not generated yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13" },
  header: { flexDirection: "row", gap: 14, padding: 20 },
  heading: { color: "#fff", fontSize: 26 },
  list: { paddingBottom: 40 },
  matchCard: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#141821",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  roundText: { color: "#3B82F6", marginBottom: 10 },
  playersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vs: { color: "#9CA3AF" },
  playerSlot: { alignItems: "center", width: 100 },
  playerName: { color: "#fff", marginTop: 6, textAlign: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  matchStatus: { marginTop: 12, color: "#9CA3AF", textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  infoText: { color: "#9CA3AF" },
});

export default TournamentBracket;
