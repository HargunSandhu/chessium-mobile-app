import { useEffect, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const router = useRouter();

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

  const [gameOver, setGameOver] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // ---------------- INIT GAME ----------------
  useEffect(() => {
    if (!tournamentMatchId) return;

    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const userId = auth.user.id;

      // Fetch match
      const { data: myMatch } = await supabase
        .from("tournament_matches")
        .select("*")
        .eq("id", tournamentMatchId)
        .single();

      if (!myMatch) return;

      setMatchId(myMatch.id);
      const myColor: Color = userId === myMatch.player1_id ? "white" : "black";
      setPlayerColor(myColor);

      setWhiteTime(myMatch.white_time_ms);
      setBlackTime(myMatch.black_time_ms);
      setLastMoveAt(new Date(myMatch.last_move_at).getTime());

      // Fetch player profiles
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

      // Fetch game state
      const { data: state } = await supabase
        .from("tournament_game_states")
        .select("fen, turn")
        .eq("tournament_match_id", myMatch.id)
        .single();

      if (state) {
        setFen(state.fen);
        setTurn(state.turn);
      }

      // Subscribe to game state updates
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
            setFen(payload.new.fen);
            setTurn(payload.new.turn);
          },
        )
        .subscribe();

      // Subscribe to match updates (timers, game over)
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
            setWhiteTime(payload.new.white_time_ms);
            setBlackTime(payload.new.black_time_ms);
            setLastMoveAt(new Date(payload.new.last_move_at).getTime());

            if (payload.new.status === "finished") {
              let message = "Game over";
              if (payload.new.reason === "timeout") {
                message =
                  turn === playerColor
                    ? "You lost on time!"
                    : "You won! Opponent timed out.";
              } else if (payload.new.winner_id === null) {
                message = "Draw!";
              } else if (
                (payload.new.winner_id === myMatch.player1_id &&
                  playerColor === "white") ||
                (payload.new.winner_id === myMatch.player2_id &&
                  playerColor === "black")
              ) {
                message = "You won!";
              } else {
                message = "You lost!";
              }
              setResultMessage(message);
              setGameOver(true);
            }
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

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      await fetch(`${SUPABASE_URL}/functions/v1/tournament-make-move`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ match_id: matchId, from, to, promotion }),
      });

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
      {/* TOP PLAYER */}
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

      {/* CHESSBOARD */}
      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          boardTheme={DefaultThemes.blue}
          perspective={playerColor}
          readonly={playerColor !== turn || gameOver}
          showCoordinates={false}
          onMove={handleMove}
        />
      </View>

      {/* BOTTOM PLAYER */}
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

      {/* GAME OVER MODAL */}
      {gameOver && resultMessage && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalText}>{resultMessage}</Text>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color="#3b82f6"
              style={{ marginVertical: 16 }}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => router.replace("/pages/tournament/Bracket")}
            >
              <Text style={styles.modalButtonText}>Back to Bracket</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#141821",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});

export default TournamentGameScreen;
