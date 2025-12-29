import { Button2 } from "@/components/Buttons";
import { supabase } from "@/app/lib/Supabase";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GameMode = "bullet" | "blitz" | "rapid";

const TIME_MODE_MAP: Record<GameMode, number> = {
  bullet: 1,
  blitz: 2,
  rapid: 3,
};

const FindingOpponent = () => {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const normalizedMode = mode?.toLowerCase() as GameMode | undefined;
  const timeModeId = normalizedMode ? TIME_MODE_MAP[normalizedMode] : null;

  const [userId, setUserId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace("/pages/authentication/SignIn");
        return;
      }
      setUserId(data.user.id);
    };

    loadUser();
  }, []);

  const cleanupAsync = async () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (userId) {
      await supabase.functions.invoke("matchmake", {
        body: {
          action: "leave",
          user_id: userId,
        },
      });
    }
  };

  useEffect(() => {
    if (!userId || !timeModeId) return;

    cancelledRef.current = false;

    const start = async () => {
      await supabase.functions.invoke("matchmake", {
        body: {
          action: "join",
          user_id: userId,
          time_mode_id: timeModeId,
        },
      });

      channelRef.current = supabase
        .channel(`match-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "matches",
          },
          (payload) => {
            const match = payload.new;
            if (
              match.player_white === userId ||
              match.player_black === userId
            ) {
              cleanupAsync();
              router.replace({
                pathname: "/pages/competitiveMode/GameScreen",
                params: { matchId: match.id },
              });
            }
          }
        )
        .subscribe();

      intervalRef.current = setInterval(() => {
        if (cancelledRef.current) return;

        supabase.functions.invoke("matchmake", {
          body: {
            action: "poll",
            user_id: userId,
            time_mode_id: timeModeId,
          },
        });
      }, 1500);
    };

    start();

    return () => {
      cleanupAsync();
    };
  }, [userId, timeModeId]);

  const cancelMatchmaking = async () => {
    await cleanupAsync();
    router.back();
  };

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.title}>Player vs Player</Text>
      <Text style={styles.subtitle}>Finding Opponent ({normalizedMode})</Text>
      <Button2 text="Cancel" width="90%" onPress={cancelMatchmaking} />
    </SafeAreaView>
  );
};

export default FindingOpponent;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    marginBottom: 20,
  },
  subtitle: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 40,
  },
});
