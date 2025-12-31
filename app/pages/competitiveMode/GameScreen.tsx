import { useEffect, useRef, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { Chess } from "chess.js";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/app/lib/Supabase";

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
  const [chess, setChess] = useState<Chess | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);

  const channelRef = useRef<any>(null);

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
      setChess(new Chess(state.fen));

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
            setChess(new Chess(payload.new.fen));
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

  const canMove = playerColor !== null && turn !== null && playerColor === turn;

  const onMove = (from: string, to: string, promotion?: string) => {
    if (!chess || !matchId || !canMove) return;

    const next = new Chess(chess.fen());
    if (!next.move({ from, to, promotion })) return;

    setFen(next.fen());
    setTurn(playerColor === "white" ? "black" : "white");
    setChess(next);

    supabase.functions.invoke("make-move", {
      body: {
        match_id: matchId,
        fen: next.fen(),
      },
    });
  };

  if (!fen || !chess || !playerColor || !turn) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E13" }}>
      <Text
        style={{
          color: "#fff",
          textAlign: "center",
          marginVertical: 10,
        }}
      >
        {canMove ? "Your Turn" : "Opponent's Turn"}
      </Text>

      <Chessboard
        fen={fen}
        onMove={onMove}
        boardTheme={DefaultThemes.blue}
        showCoordinates={false}
        perspective={playerColor}
        readonly={!canMove}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
