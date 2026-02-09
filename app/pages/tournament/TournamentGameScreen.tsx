import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useLocalSearchParams } from "expo-router";
import { supabase, SUPABASE_URL } from "@/app/lib/Supabase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Color = "white" | "black";

type PlayerInfo = {
  id: string;
  name: string;
  avatar_url: string | null;
};

const BOARD_SIZE = Dimensions.get("window").width;

const formatTime = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const TournamentGameScreen = () => {
  const { tournamentMatchId } = useLocalSearchParams<{
    tournamentMatchId: string;
  }>();

  const channelRef = useRef<any>(null);
  const matchChannelRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [fen, setFen] = useState<string | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);

  const [topPlayer, setTopPlayer] = useState<PlayerInfo | null>(null);
  const [bottomPlayer, setBottomPlayer] = useState<PlayerInfo | null>(null);

  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [lastMoveAt, setLastMoveAt] = useState<number>(Date.now());
  const [matchId, setMatchId] = useState<string | null>(null);

  // ---------------- INIT GAME ----------------
  useEffect(() => {
    if (!tournamentMatchId) return;

    const init = async () => {
      console.log("[INIT] Loading tournament match", tournamentMatchId);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        console.error("[INIT] No authenticated user");
        return;
      }

      const userId = auth.user.id;

      // 1️⃣ Fetch the actual match for this user
      const { data: myMatch, error: matchError } = await supabase
        .from("tournament_matches")
        .select("*")
        .eq("id", tournamentMatchId)
        .single();

      if (matchError || !myMatch) {
        console.error("[INIT] Failed to fetch match:", matchError);
        return;
      }

      console.log("[INIT] My match found:", myMatch);

      setMatchId(myMatch.id); // THIS is the ID we send to backend for moves

      const myColor: Color = userId === myMatch.player1_id ? "white" : "black";
      setPlayerColor(myColor);
      setWhiteTime(myMatch.white_time_ms);
      setBlackTime(myMatch.black_time_ms);
      setLastMoveAt(new Date(myMatch.last_move_at).getTime());

      // 2️⃣ Fetch player profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", [myMatch.player1_id, myMatch.player2_id]);

      if (profiles) {
        const white = profiles.find((p) => p.id === myMatch.player1_id) ?? null;
        const black = profiles.find((p) => p.id === myMatch.player2_id) ?? null;

        if (myColor === "white") {
          setBottomPlayer(
            white && {
              id: white.id,
              name: white.full_name,
              avatar_url: white.avatar_url,
            },
          );
          setTopPlayer(
            black && {
              id: black.id,
              name: black.full_name,
              avatar_url: black.avatar_url,
            },
          );
        } else {
          setBottomPlayer(
            black && {
              id: black.id,
              name: black.full_name,
              avatar_url: black.avatar_url,
            },
          );
          setTopPlayer(
            white && {
              id: white.id,
              name: white.full_name,
              avatar_url: white.avatar_url,
            },
          );
        }
      }

      // 3️⃣ Fetch initial game state
      const { data: state, error: stateError } = await supabase
        .from("tournament_game_states")
        .select("fen, turn")
        .eq("tournament_match_id", myMatch.id)
        .single();

      if (stateError || !state) {
        console.error("[INIT] Failed to fetch game state:", stateError);
        return;
      }

      setFen(state.fen);
      setTurn(state.turn);

      console.log("[INIT] Game loaded. FEN:", state.fen, "Turn:", state.turn);

      // ---------------- SUBSCRIPTIONS ----------------
      channelRef.current = supabase
        .channel(`game-${myMatch.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tournament_game_states",
            filter: `tournament_match_id=eq.${myMatch.id}`,
          },
          (payload) => {
            console.log("[SUB] Game state updated", payload.new);
            setFen(payload.new.fen);
            setTurn(payload.new.turn);
          },
        )
        .subscribe();

      matchChannelRef.current = supabase
        .channel(`match-${myMatch.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tournament_matches",
            filter: `id=eq.${myMatch.id}`,
          },
          (payload) => {
            console.log("[SUB] Match updated", payload.new);
            setWhiteTime(payload.new.white_time_ms);
            setBlackTime(payload.new.black_time_ms);
            setLastMoveAt(new Date(payload.new.last_move_at).getTime());
          },
        )
        .subscribe();
    };

    init();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (matchChannelRef.current)
        supabase.removeChannel(matchChannelRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tournamentMatchId]);

  // ---------------- TIMER ----------------
  useEffect(() => {
    if (!turn) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (turn === "white") setWhiteTime((t) => Math.max(0, t - 1000));
      else setBlackTime((t) => Math.max(0, t - 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turn]);

  // ---------------- HANDLE MOVE ----------------
  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!matchId || !playerColor || !turn) return;
    if (playerColor !== turn) return;

    console.log(
      `[MOVE] Attempting move ${from} -> ${to}, promotion: ${promotion}`,
    );

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        console.error("[MOVE] No access token");
        return;
      }

      // ✅ Use the correct match ID
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/tournament-make-move`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            match_id: matchId,
            from,
            to,
            promotion,
          }),
        },
      );

      const text = await res.text();
      if (!res.ok) {
        console.error("[MOVE] Move failed:", res.status, text);
        return;
      }

      console.log("[MOVE] Move success:", text);

      setLastMoveAt(Date.now());
    } catch (err) {
      console.error("[MOVE] Error sending move:", err);
    }
  };

  if (!fen || !turn || !playerColor) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>Loading game…</Text>
      </SafeAreaView>
    );
  }

  const isTopActive = turn !== playerColor;
  const isBottomActive = turn === playerColor;

  return (
    <SafeAreaView style={styles.main}>
      <View
        style={[styles.playerContainer, isTopActive && styles.activePlayer]}
      >
        <View style={styles.playerRow}>
          {topPlayer?.avatar_url ? (
            <Image
              source={{ uri: topPlayer.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <Text style={styles.playerName}>{topPlayer?.name}</Text>
        </View>
        <Text style={styles.time}>
          {formatTime(playerColor === "white" ? blackTime : whiteTime)}
        </Text>
      </View>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          boardTheme={DefaultThemes.blue}
          perspective={playerColor}
          readonly={playerColor !== turn}
          showCoordinates={false}
          onMove={handleMove}
        />
      </View>

      <View
        style={[styles.playerContainer, isBottomActive && styles.activePlayer]}
      >
        <View style={styles.playerRow}>
          {bottomPlayer?.avatar_url ? (
            <Image
              source={{ uri: bottomPlayer.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <Text style={styles.playerName}>{bottomPlayer?.name}</Text>
        </View>
        <Text style={styles.time}>
          {formatTime(playerColor === "white" ? whiteTime : blackTime)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13", alignItems: "center" },
  loading: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#fff", fontSize: 18 },
  playerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#1F2937",
    width: "90%",
    height: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  playerName: { color: "#fff", fontSize: 18 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  activePlayer: { borderColor: "#3b82f6" },
  time: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default TournamentGameScreen;
