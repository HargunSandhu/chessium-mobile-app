import { Ionicons } from "@expo/vector-icons";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chess } from "chess.js";
import { useRouter } from "expo-router";

const BOARD_SIZE = Dimensions.get("window").width;

const AnalyseMode = () => {
  const chess = useRef(new Chess()).current;

  const [fen, setFen] = useState(chess.fen());
  const [thinking, setThinking] = useState(false);
  const [hintArrow, setHintArrow] = useState<
    { from: string; to: string; color?: string }[]
  >([]);

  const router = useRouter();

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

  const onUserMove = (from: string, to: string, promotion?: string) => {
    setHintArrow([]);
    let move = chess.move({ from, to, promotion });
    if (!move && !promotion) {
      for (const p of ["q", "r", "b", "n"]) {
        move = chess.move({ from, to, promotion: p }) || move;
      }
    }
    if (!move) return;
    setFen(chess.fen());
  };

  const handleHint = async () => {
    const uci = await fetchAiMove(chess.fen(), 6);
    if (!uci) return;
    setHintArrow([
      { from: uci.slice(0, 2), to: uci.slice(2, 4), color: "#3b82f6" },
    ]);
  };

  const handleUndo = () => {
    const undone = chess.undo();
    if (!undone) return;
    setHintArrow([]);
    setFen(chess.fen());
  };

  const handleReset = () => {
    chess.reset();
    setHintArrow([]);
    setFen(chess.fen());
  };

  return (
    <SafeAreaView style={styles.main}>
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
        <Text style={styles.heading}>Analyse Mode</Text>
      </View>
      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE, marginTop: 30 }}>
        <Chessboard
          fen={fen}
          onMove={onUserMove}
          arrows={hintArrow}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
        />

        {thinking && (
          <View style={styles.thinkingOverlay}>
            <ActivityIndicator size="large" />
            <Text style={{ color: "#fff", marginTop: 6 }}>Analyzing…</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleUndo}>
            <Ionicons name="arrow-undo" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Undo</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleHint}>
            <Ionicons name="bulb" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Hint</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleReset}>
            <Ionicons name="refresh" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Reset</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#0B0E13",
    flex: 1,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: 30,
    gap: 40,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  btnContainer: { alignItems: "center" },
  circleBtn: {
    width: 56,
    height: 56,
    backgroundColor: "#141821",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", marginTop: 6, fontSize: 12 },
  thinkingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
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
    textAlign: "center",
  },
});

export default AnalyseMode;
