import React, { useRef, useState } from "react";
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
  AiGame: {
    level: 1 | 2 | 3 | 4 | 5;
  };
};

const BOARD_SIZE = Dimensions.get("window").width;

const AiGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "AiGame">>();
  const level = route.params?.level ?? 1;

  const chess = useRef(new Chess()).current;

  const [fen, setFen] = useState(chess.fen());
  const [thinking, setThinking] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [highlightedSquares, setHighlightedSquares] = useState<
    HighlightedSquare[]
  >([]);

  const getDepthForLevel = (lvl: number) => {
    switch (lvl) {
      case 1:
        return 2;
      case 2:
        return 4;
      case 3:
        return 8;
      case 4:
        return 12;
      case 5:
        return 16;
      default:
        return 8;
    }
  };

  const findKingSquare = (color: "w" | "b") => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

    for (const r of ranks) {
      for (const f of files) {
        const sq = f + r;
        const piece = chess.get(sq as any);
        if (piece?.type === "k" && piece.color === color) {
          return sq;
        }
      }
    }
    return null;
  };

  const updateHighlights = (move?: { from: string; to: string }) => {
    const highlights: HighlightedSquare[] = [];

    if (move) {
      highlights.push(
        { square: move.from, color: "rgba(255,215,0,0.6)" },
        { square: move.to, color: "rgba(255,215,0,0.6)" }
      );
    }

    if (chess.isCheck()) {
      const kingSq = findKingSquare(chess.turn());
      if (kingSq) {
        highlights.push({
          square: kingSq,
          color: "rgba(255,0,0,0.75)",
        });
      }
    }

    setHighlightedSquares(highlights);
  };

  const maybeRandomMove = () => {
    const moves = chess.moves({ verbose: true });
    if (!moves.length) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  };

  const fetchAiMove = async (fen: string) => {
    try {
      setThinking(true);
      const res = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen,
          depth: getDepthForLevel(level),
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.move;
    } finally {
      setThinking(false);
    }
  };

  const onUserMove = async (from: string, to: string, promotion?: string) => {
    if (thinking || chess.isGameOver()) return;

    let move = chess.move({ from, to, promotion });

    if (!move && !promotion) {
      for (const p of ["q", "r", "b", "n"]) {
        const attempt = chess.move({ from, to, promotion: p });
        if (attempt) {
          move = attempt;
          break;
        }
      }
    }

    if (!move) return;

    setFen(chess.fen());
    updateHighlights({ from, to });

    if (chess.isGameOver()) return;

    if (level <= 2 && Math.random() < 0.35) {
      const r = maybeRandomMove();
      if (r) {
        chess.move(r);
        setFen(chess.fen());
        updateHighlights({ from: r.from, to: r.to });
        return;
      }
    }

    const uci = await fetchAiMove(chess.fen());
    if (!uci) return;

    const aiMove = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    });

    if (!aiMove) return;

    setFen(chess.fen());
    updateHighlights({
      from: aiMove.from,
      to: aiMove.to,
    });
  };

  const handleResign = () => {
    setShowResignModal(true);
  };

  const cancelResign = () => {
    setShowResignModal(false);
  };

  const confirmResign = () => {
    setShowResignModal(false);
    router.replace("/pages/Dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.opponentContainer}>
        <Ionicons name="person-circle-outline" size={50} color="#fff" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.opponentName}>Machine</Text>
          <Text style={styles.opponentLevel}>Level {level}</Text>
        </View>
      </View>

      {/* Board */}
      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE, marginTop: 30 }}>
        <Chessboard
          fen={fen}
          onMove={onUserMove}
          highlightedSquares={highlightedSquares}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
          showArrows
        />

        {thinking && (
          <View style={styles.thinkingOverlay}>
            <ActivityIndicator size="large" />
            <Text style={{ color: "#fff", marginTop: 6 }}>AI thinking...</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleResign}>
            <Ionicons name="flag" color="#3b82f6" size={30} />
          </TouchableOpacity>
          <Text style={styles.btnText}>Resign</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="bulb" color="#3b82f6" size={30} />
          </TouchableOpacity>
          <Text style={styles.btnText}>Hint</Text>
        </View>
      </View>

      {/* Resign Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showResignModal}
        onRequestClose={cancelResign}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Resign Game?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to resign this match?
            </Text>

            <View style={styles.modalActions}>
              <View style={styles.halfBtn}>
                <Button1
                  text="Resign"
                  onPress={confirmResign}
                  // width="100%"
                  // height={56}
                />
              </View>
              <View style={styles.halfBtn}>
                <Button2
                  text="Cancel"
                  onPress={cancelResign}
                  // width="100%"
                  // height={56}
                />
              </View>
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
    paddingVertical: 8,
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
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
  },
  modalText: {
    color: "#cbd5e1",
    fontSize: 15,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  halfBtn: {
    flex: 1,
  },
});

export default AiGameScreen;
