import { supabase } from "@/app/lib/Supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyTournaments = () => {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTournaments();
  }, []);

  const fetchMyTournaments = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("tournaments")
      .select(
        `
        *,
        tournament_players ( count )
      `,
      )
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setTournaments(data);
    setLoading(false);
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    const datePart = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart}, ${timePart}`;
  };

  const formatText = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={styles.backWrapper}
          >
            <View style={styles.circle}>
              <Ionicons name="arrow-back" size={26} color="#3B82F6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.heading}>My Tournaments</Text>
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : tournaments.length === 0 ? (
          <Text style={styles.emptyText}>
            You haven’t created any tournaments yet
          </Text>
        ) : (
          tournaments.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/pages/tournament/TournamentLobby",
                  params: { tournamentId: item.id },
                })
              }
            >
              <View style={styles.card}>
                <View>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.cardTxt}>
                    {formatText(item.tournament_type)} •{" "}
                    {formatText(item.time_control)}
                  </Text>
                  <Text style={styles.starting}>
                    {formatDateTime(item.start_time)}
                  </Text>
                  <Text style={styles.status}>{formatText(item.status)}</Text>
                </View>

                <Text style={styles.cardTxt}>
                  {item.tournament_players?.[0]?.count ?? 0}/{item.max_players}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
    gap: 10,
  },
  backWrapper: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  card: {
    width: "90%",
    backgroundColor: "#141821",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B82F6",
    padding: 20,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  cardTxt: {
    color: "#B3B3B3",
    fontSize: 16,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  starting: {
    color: "#3B82F6",
    fontSize: 16,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },
  status: {
    color: "#3b82f6",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  emptyText: {
    color: "#B3B3B3",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
    fontFamily: "Inter_400Regular",
  },
});

export default MyTournaments;
