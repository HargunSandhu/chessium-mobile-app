import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useLocalSearchParams, router } from "expo-router";
import { supabase, SUPABASE_URL } from "@/app/lib/Supabase";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button1 } from "@/components/Buttons";

type Color = "white" | "black";
type GameResult = "win" | "loss" | "draw" | null;

type PlayerInfo = {
  id: string;
  name: string;
  elo: number;
  avatar_url?: string | null;
};

const GameScreen = () => {
  const params = useLocalSearchParams();
  const matchId =
    typeof params.matchId === "string"
      ? params.matchId
      : Array.isArray(params.matchId)
        ? params.matchId[0]
        : undefined;

  const BOARD_SIZE = Dimensions.get("window").width;

  const channelRef = useRef<any>(null);
  const moveLockRef = useRef(false);
  const playerColorRef = useRef<Color | null>(null);

  const [fen, setFen] = useState<string | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);

  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo | null>(null);

  const [whiteTime, setWhiteTime] = useState<number | null>(null);
  const [blackTime, setBlackTime] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [lastMoveAt, setLastMoveAt] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [drawReason, setDrawReason] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;

    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) return;

      const { data: match } = await supabase
        .from("matches")
        .select(
          "player_white, player_black, time_mode_id, white_time_ms, black_time_ms, active_color, last_move_at, status, result",
        )
        .eq("id", matchId)
        .single();

      if (!match) return;
      setMatchStatus(match.status);

      const myColor = auth.user.id === match.player_white ? "white" : "black";

      setPlayerColor(myColor);
      playerColorRef.current = myColor;

      setWhiteTime(match.white_time_ms);
      setBlackTime(match.black_time_ms);
      setActiveColor(match.active_color);
      setLastMoveAt(match.last_move_at);

      const eloField =
        match.time_mode_id === 1
          ? "bullet_elo"
          : match.time_mode_id === 2
            ? "blitz_elo"
            : "rapid_elo";

      const { data: whiteProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bullet_elo, blitz_elo, rapid_elo")
        .eq("id", match.player_white)
        .maybeSingle();

      const { data: blackProfile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bullet_elo, blitz_elo, rapid_elo")
        .eq("id", match.player_black)
        .maybeSingle();

      if (whiteProfile) {
        setWhitePlayer({
          id: whiteProfile.id,
          name: whiteProfile.full_name,
          elo: whiteProfile[eloField],
          avatar_url: whiteProfile.avatar_url,
        });
      }

      if (blackProfile) {
        setBlackPlayer({
          id: blackProfile.id,
          name: blackProfile.full_name,
          elo: blackProfile[eloField],
          avatar_url: blackProfile.avatar_url,
        });
      }

      const { data: state } = await supabase
        .from("game_states")
        .select("fen, turn")
        .eq("match_id", matchId)
        .single();

      if (state) {
        setFen(state.fen);
        setTurn(state.turn);
      }

      channelRef.current = supabase
        .channel(`game-${matchId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "game_states",
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            setFen(payload.new.fen);
            setTurn(payload.new.turn);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "matches",
            filter: `id=eq.${matchId}`,
          },
          (payload) => {
            setWhiteTime(payload.new.white_time_ms);
            setBlackTime(payload.new.black_time_ms);
            setActiveColor(payload.new.active_color);
            setLastMoveAt(payload.new.last_move_at);

            if (payload.new.status === "finished") {
              setMatchStatus("finished");

              const isWhite = playerColorRef.current === "white";
              const result = payload.new.result;

              if (result.startsWith("white_win")) {
                setGameResult(isWhite ? "win" : "loss");
              } else if (result.startsWith("black_win")) {
                setGameResult(isWhite ? "loss" : "win");
              } else {
                setGameResult("draw");

                if (result === "draw_stalemate") setDrawReason("Stalemate");
                else if (result === "draw_threefold")
                  setDrawReason("Threefold repetition");
                else if (result === "draw_insufficient_material")
                  setDrawReason("Insufficient material");
                else setDrawReason("Draw");
              }

              setShowResultModal(true);
            }
          },
        )
        .subscribe();
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [matchId]);

  useEffect(() => {
    if (!activeColor || !lastMoveAt) return;
    if (matchStatus === "finished") return;

    const baseWhite = whiteTime ?? 0;
    const baseBlack = blackTime ?? 0;
    const last = new Date(lastMoveAt).getTime();

    const interval = setInterval(() => {
      const elapsed = Date.now() - last;

      if (activeColor === "white") {
        setWhiteTime(Math.max(0, baseWhite - elapsed));
      } else {
        setBlackTime(Math.max(0, baseBlack - elapsed));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeColor, lastMoveAt, matchStatus]);

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!matchId || moveLockRef.current) {
      return;
    }

    moveLockRef.current = true;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) return;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/make-move`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ match_id: matchId, from, to, promotion }),
      });
    } finally {
      moveLockRef.current = false;
    }
  };

  const formatTime = (ms: number) => {
    const t = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!fen || !turn || !playerColor) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </SafeAreaView>
    );
  }

  const canMove = playerColor === turn;

  const topPlayer = playerColor === "white" ? blackPlayer : whitePlayer;
  const bottomPlayer = playerColor === "white" ? whitePlayer : blackPlayer;

  const handleResign = async () => {
    if (!matchId) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    await fetch(`${SUPABASE_URL}/functions/v1/resign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ match_id: matchId }),
    });
  };
  const handleOfferDraw = () => { };
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          {topPlayer?.avatar_url ? (
            <Image
              source={{ uri: topPlayer.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{topPlayer?.name}</Text>
            <Text style={styles.playerElo}>{topPlayer?.elo}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(
              playerColor === "white" ? (blackTime ?? 0) : (whiteTime ?? 0),
            )}
          </Text>
        </View>
      </View>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          boardTheme={DefaultThemes.blue}
          perspective={playerColor}
          readonly={!canMove}
          onMove={handleMove}
          showCoordinates={false}
        />
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          {bottomPlayer?.avatar_url ? (
            <Image
              source={{ uri: bottomPlayer.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{bottomPlayer?.name}</Text>
            <Text style={styles.playerElo}>{bottomPlayer?.elo}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(
              playerColor === "white" ? (whiteTime ?? 0) : (blackTime ?? 0),
            )}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleResign}>
            <Ionicons name="flag" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Resign</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleOfferDraw}>
            <FontAwesome6 name="handshake-simple" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Offer Draw</Text>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={showResultModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name={
                gameResult === "win"
                  ? "trophy"
                  : gameResult === "loss"
                    ? "skull"
                    : "remove-circle"
              }
              size={48}
              color={
                gameResult === "win"
                  ? "#22c55e"
                  : gameResult === "loss"
                    ? "#ef4444"
                    : "#facc15"
              }
              style={{ alignSelf: "center", marginBottom: 12 }}
            />

            <Text style={styles.modalTitle}>
              {gameResult === "win"
                ? "You Won"
                : gameResult === "loss"
                  ? "You Lost"
                  : "Draw"}
            </Text>

            {gameResult === "draw" && drawReason && (
              <Text style={styles.modalText}>{drawReason}</Text>
            )}

            <View style={styles.modalActions}>
              <Button1
                text="Back to Home"
                onPress={() => router.replace("/pages/Navbar")}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  loading: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  playerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#3b82f6",
    width: "90%",
    height: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
    justifyContent: "space-between",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerInfo: {
    marginLeft: 12,
  },
  playerName: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  playerElo: {
    color: "#B3B3B3",
    fontSize: 16,
  },
  timeContainer: {
    backgroundColor: "#fff",
    height: 45,
    width: 95,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  timeText: {
    color: "#0B0E13",
    fontSize: 22,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 100,
  },
  btnContainer: {
    alignItems: "center",
  },
  circleBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#141821",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    marginTop: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#0B0E13",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Inter_600SemiBold",
  },
  modalText: {
    color: "#cbd5e1",
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
});

export default GameScreen;
