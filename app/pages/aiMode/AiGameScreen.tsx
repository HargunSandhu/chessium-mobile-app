import React, { useRef, useState } from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Chess } from "chess.js";
import {
  Chessboard,
  DefaultThemes,
  HighlightedSquare,
} from "dawikk-chessboard";

// ----------------------------
// TYPES
// ----------------------------
type RootStackParamList = {
  AiGame: {
    level: 1 | 2 | 3 | 4 | 5;
  };
};

const BOARD_SIZE = Dimensions.get("window").width;

// ----------------------------
// SCREEN
// ----------------------------
const AiGameScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, "AiGame">>();
  const level = route.params?.level ?? 1;

  const chess = useRef(new Chess()).current;

  const [fen, setFen] = useState(chess.fen());
  const [thinking, setThinking] = useState(false);
  const [highlightedSquares, setHighlightedSquares] = useState<
    HighlightedSquare[]
  >([]);

  // ----------------------------
  // DIFFICULTY
  // ----------------------------
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

  // ----------------------------
  // FIND KING SQUARE
  // ----------------------------
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

  // ----------------------------
  // UPDATE HIGHLIGHTS
  // ----------------------------
  const updateHighlights = (move?: { from: string; to: string }) => {
    const highlights: HighlightedSquare[] = [];

    // last move (gold)
    if (move) {
      highlights.push(
        { square: move.from, color: "rgba(255,215,0,0.6)" },
        { square: move.to, color: "rgba(255,215,0,0.6)" }
      );
    }

    // check (red king)
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

  // ----------------------------
  // RANDOM MOVE (BEGINNER)
  // ----------------------------
  const maybeRandomMove = () => {
    const moves = chess.moves({ verbose: true });
    if (!moves.length) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  };

  // ----------------------------
  // AI MOVE
  // ----------------------------
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

  // ----------------------------
  // USER MOVE
  // ----------------------------
  const onUserMove = async (
    from: string,
    to: string,
    promotion?: string
  ): Promise<void> => {
    if (thinking || chess.isGameOver()) return;

    let move = chess.move({ from, to, promotion });

    // auto-promotion
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

    // beginner forgiveness
    if (level <= 2 && Math.random() < 0.35) {
      const r = maybeRandomMove();
      if (r) {
        chess.move(r);
        setFen(chess.fen());
        updateHighlights({ from: r.from, to: r.to });
        return;
      }
    }

    // AI move
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

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E13" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 18,
          margin: 8,
          textAlign: "center",
        }}
      >
        AI Chess — Level {level}
      </Text>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          onMove={onUserMove}
          highlightedSquares={highlightedSquares}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
          showArrows
        />

        {thinking && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.35)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" />
            <Text style={{ color: "#fff", marginTop: 6 }}>AI thinking...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AiGameScreen;
