import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Chess } from "chess.js";
import {
  Chessboard,
  DefaultThemes,
  HighlightedSquare,
} from "dawikk-chessboard";
import { router } from "expo-router";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Button1, Button2 } from "@/components/Buttons";

type RootStackParamList = {
  AiGame: { level: 1 | 2 | 3 | 4 | 5 };
};

const BOARD_SIZE = Dimensions.get("window").width;
const RESULT_POPUP_DELAY = 700;

const AiGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "AiGame">>();
  const level = route.params?.level ?? 1;

  const chess = useRef(new Chess()).current;

  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");

  const [fen, setFen] = useState(chess.fen());
  const [thinking, setThinking] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [gameResult, setGameResult] = useState<"win" | "loss" | "draw" | null>(
    null
  );
  const [drawReason, setDrawReason] = useState("");

  const [highlightedSquares, setHighlightedSquares] = useState<
    HighlightedSquare[]
  >([]);

  const [hintArrow, setHintArrow] = useState<
    { from: string; to: string; color?: string }[]
  >([]);

  useEffect(() => {
    const randomSide = Math.random() < 0.5 ? "w" : "b";
    setPlayerColor(randomSide);
  }, []);

  const getDepthForLevel = (lvl: number) => [2, 4, 8, 12, 16][lvl - 1] ?? 8;

  const checkGameResult = () => {
    if (!chess.isGameOver() || showResultModal) return;

    if (chess.isCheckmate()) {
      setGameResult(chess.turn() === playerColor ? "loss" : "win");
    } else {
      setGameResult("draw");

      if (chess.isStalemate()) setDrawReason("Stalemate");
      else if (chess.isThreefoldRepetition())
        setDrawReason("Threefold Repetition");
      else if (chess.isInsufficientMaterial())
        setDrawReason("Insufficient Material");
      else setDrawReason("50-Move Rule");
    }

    setTimeout(() => setShowResultModal(true), RESULT_POPUP_DELAY);
  };

  const findKingSquare = (color: "w" | "b") => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    for (let r = 1; r <= 8; r++) {
      for (const f of files) {
        const sq = `${f}${r}`;
        const p = chess.get(sq as any);
        if (p?.type === "k" && p.color === color) return sq;
      }
    }
    return null;
  };

  const updateHighlights = (move?: { from: string; to: string }) => {
    const h: HighlightedSquare[] = [];

    if (move) {
      h.push(
        { square: move.from, color: "rgba(255,215,0,0.6)" },
        { square: move.to, color: "rgba(255,215,0,0.6)" }
      );
    }

    if (chess.isCheck()) {
      const king = findKingSquare(chess.turn());
      if (king) h.push({ square: king, color: "rgba(255,0,0,0.8)" });
    }

    setHighlightedSquares(h);
  };

  const fetchAiMove = async (fen: string, depth: number) => {
    try {
      setThinking(true);
      const res = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen, depth }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.move;
    } finally {
      setThinking(false);
    }
  };

  const makeAiMove = async () => {
    if (chess.isGameOver()) return;

    const uci = await fetchAiMove(chess.fen(), getDepthForLevel(level));
    if (!uci) return;

    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    });

    if (!move) return;

    setFen(chess.fen());
    updateHighlights({ from: move.from, to: move.to });
    checkGameResult();
  };

  const onUserMove = async (from: string, to: string, promotion?: string) => {
    if (thinking || chess.isGameOver() || chess.turn() !== playerColor) return;

    setHintArrow([]);

    let move = chess.move({ from, to, promotion });
    if (!move && !promotion) {
      for (const p of ["q", "r", "b", "n"]) {
        move = chess.move({ from, to, promotion: p }) || move;
      }
    }
    if (!move) return;

    setFen(chess.fen());
    updateHighlights({ from, to });
    checkGameResult();
    if (chess.isGameOver()) return;

    await makeAiMove();
  };

  const handleHint = async () => {
    if (thinking || chess.isGameOver() || chess.turn() !== playerColor) return;

    const uci = await fetchAiMove(chess.fen(), 6);
    if (!uci) return;

    setHintArrow([
      { from: uci.slice(0, 2), to: uci.slice(2, 4), color: "#3b82f6" },
    ]);
  };

  useEffect(() => {
    if (playerColor === "b") {
      setTimeout(makeAiMove, 300);
    }
  }, [playerColor]);

  const playAgain = () => {
    chess.reset();

    const randomSide = Math.random() < 0.5 ? "w" : "b";
    setPlayerColor(randomSide);

    setFen(chess.fen());
    setHighlightedSquares([]);
    setHintArrow([]);
    setGameResult(null);
    setDrawReason("");
    setShowResultModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.opponentContainer}>
        <Ionicons name="hardware-chip-outline" size={48} color="#fff" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.opponentName}>Machine</Text>
          <Text style={styles.opponentLevel}>
            Level {level} · You play {playerColor === "w" ? "White" : "Black"}
          </Text>
        </View>
      </View>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE, marginTop: 30 }}>
        <Chessboard
          fen={fen}
          onMove={onUserMove}
          highlightedSquares={highlightedSquares}
          arrows={hintArrow}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
          perspective={playerColor === "w" ? "white" : "black"}
        />

        {thinking && (
          <View style={styles.thinkingOverlay}>
            <ActivityIndicator size="large" />
            <Text style={{ color: "#fff", marginTop: 6 }}>AI thinking…</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => setShowResignModal(true)}
          >
            <Ionicons name="flag" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Resign</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleHint}>
            <Ionicons name="bulb" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Hint</Text>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={showResignModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="flag"
              size={42}
              color="#ef4444"
              style={{ alignSelf: "center", marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Resign Game?</Text>

            <View style={styles.modalActions}>
              <View style={styles.halfBtn}>
                <Button1
                  text="Resign"
                  onPress={() => router.replace("/pages/Navbar")}
                />
              </View>
              <View style={styles.halfBtn}>
                <Button2
                  text="Cancel"
                  onPress={() => setShowResignModal(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

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

            {gameResult === "draw" && (
              <Text style={styles.modalText}>{drawReason}</Text>
            )}

            <Button1 text="Play Again" onPress={playAgain} />
            <View style={{ marginTop: 12 }}>
              <Button2
                text="Back to Dashboard"
                onPress={() => router.push("/pages/Navbar")}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  opponentContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#3b82f6",
    width: "90%",
    height: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: "10%",
  },
  opponentName: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  opponentLevel: {
    color: "#fff",
    fontSize: 16,
  },
  thinkingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: 50,
    gap: 100,
  },
  btnContainer: { alignItems: "center" },
  circleBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#141821",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", marginTop: 6 },
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
  halfBtn: { flex: 1 },
});

export default AiGameScreen;
