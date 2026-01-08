import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/app/lib/Supabase";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Color = "white" | "black";
type TimeMode = 1 | 2 | 3;
type EloField = "elo_bullet" | "elo_blitz" | "elo_rapid";

type PlayerInfo = {
  id: string;
  name: string;
  elo: number;
  avatar_url?: string | null;
};

// type ProfileRow = {
//   id: string;
//   full_name: string;
//   elo_bullet: number;
//   elo_blitz: number;
//   elo_rapid: number;
// };

const TIME_MODE_TO_ELO_FIELD: Record<TimeMode, EloField> = {
  1: "elo_bullet",
  2: "elo_blitz",
  3: "elo_rapid",
};

const GameScreen = () => {
  const params = useLocalSearchParams();
  const matchId =
    typeof params.matchId === "string"
      ? params.matchId
      : Array.isArray(params.matchId)
      ? params.matchId[0]
      : undefined;

  console.log("[GameScreen] matchId:", matchId);

  const [fen, setFen] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<Color | null>(null);
  const [turn, setTurn] = useState<Color | null>(null);
  const [whitePlayer, setWhitePlayer] = useState<PlayerInfo | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<PlayerInfo | null>(null);

  const channelRef = useRef<any>(null);
  const BOARD_SIZE = Dimensions.get("window").width;

  useEffect(() => {
    if (!matchId) return;

    const init = async () => {
      console.log("[INIT] start");

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      console.log("[AUTH]", user.id);

      const { data: match } = await supabase
        .from("matches")
        .select("player_white, player_black, time_mode_id")
        .eq("id", matchId)
        .single();

      if (!match) return;
      console.log("[MATCH]", match);

      setPlayerColor(user.id === match.player_white ? "white" : "black");

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

      if (!whiteProfile || !blackProfile) {
        console.log("[PROFILES] missing", { whiteProfile, blackProfile });
        return;
      }

      const TIME_MODE_TO_ELO_FIELD: Record<
        number,
        "bullet_elo" | "blitz_elo" | "rapid_elo"
      > = {
        1: "bullet_elo",
        2: "blitz_elo",
        3: "rapid_elo",
      };

      const eloField = TIME_MODE_TO_ELO_FIELD[match.time_mode_id];

      setWhitePlayer({
        id: whiteProfile.id,
        name: whiteProfile.full_name,
        elo: whiteProfile[eloField],
        avatar_url: whiteProfile.avatar_url,
      });

      setBlackPlayer({
        id: blackProfile.id,
        name: blackProfile.full_name,
        elo: blackProfile[eloField],
        avatar_url: blackProfile.avatar_url,
      });

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

  if (!fen || !playerColor || !turn || !whitePlayer || !blackPlayer) {
    console.log("[RENDER] waiting", {
      fen,
      playerColor,
      turn,
      whitePlayer,
      blackPlayer,
    });

    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </SafeAreaView>
    );
  }

  const canMove = playerColor === turn;
  const topPlayer = playerColor === "white" ? blackPlayer : whitePlayer;
  const bottomPlayer = playerColor === "white" ? whitePlayer : blackPlayer;

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          {topPlayer.avatar_url ? (
            <Image
              source={{ uri: topPlayer.avatar_url }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{topPlayer.name}</Text>
            <Text style={styles.playerElo}>{topPlayer.elo}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>10 : 00</Text>
        </View>
      </View>

      <View style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
        <Chessboard
          fen={fen}
          onMove={() => {}}
          boardTheme={DefaultThemes.blue}
          showCoordinates={false}
          perspective={playerColor}
          readonly={!canMove}
        />
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          {bottomPlayer.avatar_url ? (
            <Image
              source={{ uri: bottomPlayer.avatar_url }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{bottomPlayer.name}</Text>
            <Text style={styles.playerElo}>{bottomPlayer.elo}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>10 : 00</Text>
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
  turnText: {
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
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
});

export default GameScreen;
