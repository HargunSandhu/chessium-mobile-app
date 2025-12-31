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
  const params = useLocalSearchParams();

  const rawMode =
    typeof params.mode === "string"
      ? params.mode
      : Array.isArray(params.mode)
      ? params.mode[0]
      : undefined;

  const normalizedMode = rawMode?.toLowerCase() as GameMode | undefined;
  const timeModeId = normalizedMode ? TIME_MODE_MAP[normalizedMode] : null;

  const [userId, setUserId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

      intervalRef.current = setInterval(async () => {
        if (cancelledRef.current) return;

        const { data } = await supabase.functions.invoke("matchmake", {
          body: {
            action: "check",
            user_id: userId,
          },
        });

        if (data?.match_id) {
          await cleanupAsync();
          router.replace({
            pathname: "/pages/competitiveMode/GameScreen",
            params: { matchId: data.match_id },
          });
        }
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
