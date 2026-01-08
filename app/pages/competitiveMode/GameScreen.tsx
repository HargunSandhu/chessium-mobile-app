import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { Chess } from "chess.js";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/app/lib/Supabase";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Color = "white" | "black";

const GameScreen = () => {
  const params = useLocalSearchParams();
  const matchId =
    typeof params.matchId === "string"
      ? params.matchId
      : Array.isArray(params.matchId)
      ? params.matchId[0]
      : undefined;

  const [fen, setFen] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);

  const channelRef = useRef<any>(null);

  const BOARD_SIZE = Dimensions.get("window").width;

  useEffect(() => {
    if (!matchId) return;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: match } = await supabase
        .from("matches")
        .select("player_white, player_black")
        .eq("id", matchId)
        .single();

      if (!match) return;

      setPlayerColor(user.id === match.player_white ? "white" : "black");

      const { data: state } = await supabase
        .from("game_states")
        .select("fen, turn")
        .eq("match_id", matchId)
        .single();

      if (!state) return;

      setFen(state.fen);
      setTurn(state.turn);

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
          }
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

  const canMove = playerColor && turn && playerColor === turn;

  const onMove = async (from: string, to: string, promotion?: string) => {
    if (!matchId || !canMove) return;

    await supabase.functions.invoke("make-move", {
      body: {
        match_id: matchId,
        from,
        to,
        promotion,
      },
    });
  };

  if (!fen || !playerColor || !turn) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#0B0E13",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>Loading game...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0B0E13", alignItems: "center" }}
    >
       <Text
        style={{
          color: "#fff",
          textAlign: "center",
          marginVertical: 10,
        }}
      >
        {canMove ? "Your Turn" : "Opponent's Turn"}
      </Text>
      <View style={styles.playerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-circle-outline" size={48} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.playerName}>Name</Text>
            <Text style={styles.playerElo}>1500</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text
            style={{
              color: "#0B0E13",
              fontSize: 22,
              fontFamily: "Inter_600SemiBold",
              fontWeight: "bold",
            }}
          >
            10 : 00
          </Text>
        </View>
      </View>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          onMove={onMove}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
          perspective={playerColor}
          readonly={!canMove}
        />
      </View>
      <View style={styles.playerContainer}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-circle-outline" size={48} color="#fff" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.playerName}>Name</Text>
            <Text style={styles.playerElo}>1500</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text
            style={{
              color: "#0B0E13",
              fontSize: 22,
              fontFamily: "Inter_600SemiBold",
              fontWeight: "bold",
            }}
          >
            10 : 00
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="flag" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Resign</Text>
        </View>

        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.circleBtn}>
            <FontAwesome6 name="handshake-simple" size={28} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.btnText}>Offer Draw</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  playerName: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  playerElo: {
    color: "#fff",
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
  actions: {
    flexDirection: "row",
    marginTop: 20,
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
});

export default GameScreen;
