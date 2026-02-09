import { supabase } from "@/app/lib/Supabase";
import { Button1 } from "@/components/Buttons";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TournamentLobby = () => {
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams();

  const [tournament, setTournament] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;

    init();

    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.new.status === "ongoing") {
            router.replace({
              pathname: "/pages/tournament/Bracket",
              params: { tournamentId },
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId]);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUserId(user.id);

    const { data: tournamentData } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (!tournamentData) return;

    setTournament(tournamentData);
    setIsCreator(tournamentData.creator_id === user.id);

    if (tournamentData.status === "ongoing") {
      router.replace({
        pathname: "/pages/tournament/Bracket",
        params: { tournamentId },
      });
      return;
    }

    fetchPlayers();
  };

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("tournament_players")
      .select("id, user_id, ready")
      .eq("tournament_id", tournamentId);

    if (data) setPlayers(data);
  };

  const toggleReady = async () => {
    const current = players.find((p) => p.user_id === userId);
    if (!current) return;

    await supabase
      .from("tournament_players")
      .update({ ready: !current.ready })
      .eq("id", current.id);

    fetchPlayers();
  };

const startTournament = async () => {
  if (!isCreator || loading) return;

  setLoading(true);

  const result = await supabase.functions.invoke("start-tournament", {
    body: { tournament_id: tournamentId },
  });
  
  setLoading(false);
  if (result.error) {
    console.log("🔥 FULL ERROR OBJECT:", JSON.stringify(result.error, null, 2));
    Alert.alert("Error", "Check console logs");
  }

  // if (result.error) {
  //   console.log("🔥 start-tournament ERROR:", result.error);

  //   const message =
  //     typeof result.error === "string"
  //       ? result.error
  //       : result.error.message || "Failed to start tournament";

  //   Alert.alert("Start Tournament Error", message);
  //   return;
  // }

};


  const formatText = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const notReadyCount = players.filter((p) => !p.ready).length;

  return (
    <SafeAreaView style={styles.main}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.circle}
            >
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <Text style={styles.heading}>Lobby</Text>
          </View>

          {tournament && (
            <View style={styles.infoCard}>
              <Text style={styles.title}>{tournament.name}</Text>
              <Text style={styles.sub}>
                {formatText(tournament.tournament_type)} •{" "}
                {formatText(tournament.time_control)}
              </Text>
              <Text style={styles.status}>{tournament.status}</Text>
            </View>
          )}

          <Text style={styles.section}>Players</Text>

          {players.map((player, index) => (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerText}>Player {index + 1}</Text>
              <Ionicons
                name={player.ready ? "checkmark-circle" : "time-outline"}
                size={22}
                color={player.ready ? "#22C55E" : "#FACC15"}
              />
            </View>
          ))}

          {!isCreator && (
            <TouchableOpacity style={styles.readyBtn} onPress={toggleReady}>
              <Text style={styles.readyText}>Toggle Ready</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {isCreator && (
          <View style={styles.bottomBar}>
            <Button1
              text={
                loading
                  ? "Starting..."
                  : `Start Tournament${
                      notReadyCount > 0 ? ` (${notReadyCount} not ready)` : ""
                    }`
              }
              onPress={startTournament}
              width="100%"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
    gap: 12,
  },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { color: "#fff", fontSize: 26, fontFamily: "Inter_600SemiBold" },
  infoCard: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#141821",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B82F6",
    padding: 20,
    marginBottom: 20,
  },
  title: { color: "#fff", fontSize: 22, fontFamily: "Inter_600SemiBold" },
  sub: {
    color: "#B3B3B3",
    fontSize: 16,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  status: {
    color: "#3B82F6",
    marginTop: 8,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  section: {
    color: "#fff",
    fontSize: 20,
    marginLeft: "5%",
    marginVertical: 10,
    fontFamily: "Inter_600SemiBold",
  },
  playerRow: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#141821",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  playerText: { color: "#fff", fontSize: 16, fontFamily: "Inter_400Regular" },
  readyBtn: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#3B82F6",
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
  },
  readyText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
  bottomBar: {
    padding: 16,
    backgroundColor: "#0B0E13",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },
});

export default TournamentLobby;
