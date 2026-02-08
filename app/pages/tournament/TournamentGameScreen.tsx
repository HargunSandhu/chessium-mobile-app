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
import { Button1, Button2 } from "@/components/Buttons";

type Color = "white" | "black";
type GameResult = "win" | "loss" | "draw" | null;

const TournamentGameScreen = () => {
  const params = useLocalSearchParams();

  const matchId =
    typeof params.matchId === "string" ? params.matchId : undefined;

  const tournamentMatchId =
    typeof params.tournamentMatchId === "string"
      ? params.tournamentMatchId
      : undefined;

  const BOARD_SIZE = Dimensions.get("window").width;

  const channelRef = useRef<any>(null);
  const playerColorRef = useRef<Color | null>(null);

  const [fen, setFen] = useState<string | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);
  const [matchStatus, setMatchStatus] = useState<string | null>(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult>(null);

  useEffect(() => {
    if (!matchId) return;

    const init = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data: match } = await supabase
        .from("matches")
        .select("player_white, player_black, status, result")
        .eq("id", matchId)
        .single();

      if (!match) return;

      const myColor = auth.user.id === match.player_white ? "white" : "black";

      setPlayerColor(myColor);
      playerColorRef.current = myColor;
      setMatchStatus(match.status);

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
            table: "matches",
            filter: `id=eq.${matchId}`,
          },
          async (payload) => {
            const updated = payload.new;

            if (updated.status === "finished") {
              setMatchStatus("finished");

              const isWhite = playerColorRef.current === "white";

              if (updated.result.startsWith("white_win")) {
                setGameResult(isWhite ? "win" : "loss");
              } else if (updated.result.startsWith("black_win")) {
                setGameResult(isWhite ? "loss" : "win");
              } else {
                setGameResult("draw");
              }

              setShowResultModal(true);

              // 🔥 resolve tournament match
              if (tournamentMatchId) {
                const { data } = await supabase.auth.getSession();
                const token = data.session?.access_token;

                await fetch(
                  `${SUPABASE_URL}/functions/v1/resolve-tournament-match`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      tournamentMatchId,
                      matchId,
                    }),
                  },
                );
              }
            }
          },
        )
        .subscribe();
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [matchId, tournamentMatchId]);

  if (!fen || !turn || !playerColor) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={{ color: "#fff" }}>Loading game…</Text>
      </SafeAreaView>
    );
  }

  const canMove = playerColor === turn && matchStatus === "active";

  return (
    <SafeAreaView style={styles.main}>
      <Chessboard
        fen={fen}
        boardTheme={DefaultThemes.blue}
        perspective={playerColor}
        readonly={!canMove}
        showCoordinates={false}
        onMove={() => {}}
      />

      <Modal transparent visible={showResultModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {gameResult === "win"
                ? "You Won"
                : gameResult === "loss"
                  ? "You Lost"
                  : "Draw"}
            </Text>

            <Button1
              text="Back to Bracket"
              onPress={() =>
                router.replace({
                  pathname: "/pages/tournament/Bracket",
                })
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13" },
  loading: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#0B0E13",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
});

export default TournamentGameScreen;
