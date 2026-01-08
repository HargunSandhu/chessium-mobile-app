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
  const joinedRef = useRef(false);
  const cancellingRef = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/pages/authentication/SignIn");
        return;
      }
      setUserId(data.user.id);
    });
  }, []);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancel = async () => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    stop();
    joinedRef.current = false;

    if (userId) {
      await supabase.functions.invoke("matchmake", {
        body: { action: "leave", user_id: userId },
      });
    }

    router.back();
  };

  useEffect(() => {
    if (!userId || !timeModeId || joinedRef.current) return;
    joinedRef.current = true;

    supabase.functions.invoke("matchmake", {
      body: {
        action: "join",
        user_id: userId,
        time_mode_id: timeModeId,
      },
    });

    intervalRef.current = setInterval(async () => {
      if (cancellingRef.current) return;

      const { data, error } = await supabase.functions.invoke("matchmake", {
        body: {
          action: "check",
          user_id: userId,
          time_mode_id: timeModeId,
        },
      });

      if (error) {
        stop();
        joinedRef.current = false;
        return;
      }

      if (data?.match_id) {
        stop();
        router.replace({
          pathname: "/pages/competitiveMode/GameScreen",
          params: { matchId: data.match_id },
        });
      }
    }, 1500);

    return () => {
      stop();
    };
  }, [userId, timeModeId]);

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.title}>Player vs Player</Text>
      <Text style={styles.subtitle}>Finding Opponent ({normalizedMode})</Text>
      <Button2 text="Cancel" width="90%" onPress={cancel} />
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
