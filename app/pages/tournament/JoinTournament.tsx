import { supabase } from "@/app/lib/Supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tournament = {
  id: string;
  name: string;
  tournament_type: "knockout" | "league";
  time_control: "bullet" | "blitz" | "rapid";
  start_time: string;
  max_players: number;
  joined_count: number;
};

const JoinTournament = () => {
  const router = useRouter();

  const [tournamentType, setTournamentType] = useState<"knockout" | "league">(
    "knockout",
  );
  const [timeControl, setTimeControl] = useState<"bullet" | "blitz" | "rapid">(
    "blitz",
  );

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, [tournamentType, timeControl]);

  const fetchTournaments = async () => {
    const { data } = await supabase
      .from("tournaments")
      .select(
        `
        id,
        name,
        tournament_type,
        time_control,
        start_time,
        max_players,
        tournament_players(count)
      `,
      )
      .eq("status", "upcoming")
      .eq("tournament_type", tournamentType)
      .eq("time_control", timeControl)
      .order("start_time", { ascending: true });

    if (!data) return;

    setTournaments(
      data.map((t: any) => ({
        id: t.id,
        name: t.name,
        tournament_type: t.tournament_type,
        time_control: t.time_control,
        start_time: t.start_time,
        max_players: t.max_players,
        joined_count: t.tournament_players[0]?.count ?? 0,
      })),
    );
  };

  const joinTournament = async (tournamentId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("tournament_players").insert({
      tournament_id: tournamentId,
      user_id: user.id,
    });

    fetchTournaments();
    alert("Tournament created successfully");
    router.back();
  };

  const formatText = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);

    const date = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${date}, ${time}`;
  };

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => router.navigate("/pages/Navbar")}
            activeOpacity={0.8}
            style={styles.backWrapper}
          >
            <View style={styles.circle}>
              <Ionicons name="arrow-back" size={26} color="#3B82F6" />
            </View>
          </TouchableOpacity>
          <Text style={styles.heading}>Join Tournament</Text>
        </View>

        <View style={styles.chooseContainer}>
          <TouchableOpacity onPress={() => setTournamentType("knockout")}>
            <Text
              style={[
                styles.txt,
                tournamentType === "knockout" && styles.activeOption,
              ]}
            >
              Knockout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTournamentType("league")}>
            <Text
              style={[
                styles.txt,
                tournamentType === "league" && styles.activeOption,
              ]}
            >
              League
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
              style={[
                styles.txt,
                timeControl === "blitz" && styles.activeOption,
              ]}
            >
              Blitz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTimeControl("rapid")}>
            <Text
              style={[
                styles.txt,
                timeControl === "rapid" && styles.activeOption,
              ]}
            >
              Rapid
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Tournament Name"
            style={styles.input}
            placeholderTextColor="#757575"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {tournaments
          .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
          .map((t) => (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              onPress={() => joinTournament(t.id)}
            >
              <View style={styles.card}>
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "95%",
                    }}
                  >
                    <Text style={styles.title}>{t.name}</Text>
                    <Text style={styles.cardTxt}>
                      {t.joined_count}/{t.max_players}
                    </Text>
                  </View>

                  <Text style={styles.cardTxt}>
                    {formatText(t.time_control)}
                  </Text>
                  <Text style={styles.cardTxt}>
                    {formatText(t.tournament_type)}
                  </Text>
                  <Text style={styles.starting}>
                    {formatDateTime(t.start_time)}
                  </Text>
                </View>

                <View style={styles.rightIcons}>
                  <Ionicons name="arrow-forward" size={22} color="#3B82F6" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
  content: {
    paddingBottom: 40,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
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
  card: {
    width: "90%",
    height: 160,
    backgroundColor: "#141821",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B82F6",
    paddingHorizontal: 20,
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
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
    fontFamily: "Inter_400Regular",
  },
  starting: {
    color: "#3B82F6",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});

export default JoinTournament;
