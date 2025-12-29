import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { Chess } from "chess.js";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/app/lib/Supabase";

const GameScreen = () => {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const [fen, setFen] = useState("start");
  const [chess, setChess] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    let channel: any;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !matchId) return;

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

      if (gameState?.fen) {
        const newChess = new Chess(gameState.fen);
        setChess(newChess);
        setFen(gameState.fen);
      }

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
            const newChess = new Chess(newFen);
            setChess(newChess);
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
    const newChess = new Chess(chess.fen());

    const result = newChess.move({
      from,
      to,
      promotion,
    });

    if (!result) return;

    setChess(newChess);
    setFen(newChess.fen());

    supabase.functions.invoke("make-move", {
      body: {
        match_id: matchId,
        fen: newChess.fen(),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E13" }}>
      <Chessboard
        fen={fen}
        onMove={onMove}
        boardTheme={DefaultThemes.blue}
        showCoordinates={false}
        perspective={playerColor === "white" ? "white" : "black"}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
