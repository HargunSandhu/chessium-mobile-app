import { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { Chess } from "chess.js";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/app/lib/Supabase";

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
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    if (!matchId) return;

    let channel: any;

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

      setPlayerColor(match.player_white === user.id ? "white" : "black");

      const { data: gameState } = await supabase
        .from("game_states")
        .select("fen")
        .eq("match_id", matchId)
        .single();

      if (!gameState?.fen) return;

      const initialChess = new Chess(gameState.fen);
      setChess(initialChess);
      setFen(gameState.fen);

      channel = supabase
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
            const newFen = payload.new.fen;
            const updatedChess = new Chess(newFen);
            setChess(updatedChess);
            setFen(newFen);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [matchId]);

  const onMove = (from: string, to: string, promotion?: string) => {
    if (!chess || !matchId) return;

    const next = new Chess(chess.fen());
    const result = next.move({ from, to, promotion });

    if (!result) return;

    setChess(next);
    setFen(next.fen());

    supabase.functions.invoke("make-move", {
      body: {
        match_id: matchId,
        fen: next.fen(),
      },
    });
  };

  if (!fen || !chess) {
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
      <Chessboard
        fen={fen}
        onMove={onMove}
        boardTheme={DefaultThemes.blue}
        showCoordinates={false}
        perspective={playerColor}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
