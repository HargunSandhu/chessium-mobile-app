import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/app/lib/Supabase";
import { Images } from "@/assets/images/Images";
import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts,
} from "@expo-google-fonts/inter";

type Match = {
  id: string;
  time_mode_id: number;
  player_white: string;
  player_black: string;
  opponent_name: string;
  opponent_avatar?: string | null;
  result: "Win" | "Lose" | "Draw";
  time_control: string;
};

const RecentMatchesSlider = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["40%", "75%", "90%"], []);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium });

  const userId = supabase.auth.getUser().then((res) => res.data.user?.id);

  useEffect(() => {
    const fetchMatches = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      const userId = user.data.user.id;

      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          player_white,
          player_black,
          time_mode_id,
          result,
          profiles_white:profiles!player_white (full_name, avatar_url),
          profiles_black:profiles!player_black (full_name, avatar_url)
        `,
        )
        .or(`player_white.eq.${userId},player_black.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching matches:", error);
        return;
      }

      const mapped: Match[] = data.map((match: any) => {
        const isWhite = match.player_white === userId;
        const opponentProfile = isWhite
          ? match.profiles_black
          : match.profiles_white;

        let time_control = "Blitz";
        if (match.time_mode_id === 1) time_control = "Bullet";
        else if (match.time_mode_id === 2) time_control = "Blitz";
        else if (match.time_mode_id === 3) time_control = "Rapid";
        let result: "Win" | "Lose" | "Draw";

        if (match.result?.startsWith("white_win")) {
          result = isWhite ? "Win" : "Lose";
        } else if (match.result?.startsWith("black_win")) {
          result = isWhite ? "Lose" : "Win";
        } else if (match.result?.startsWith("draw") || match.result === null) {
          result = "Draw";
        } else {
          result = "Draw";
        }

        return {
          id: match.id,
          time_mode_id: match.time_mode_id,
          player_white: match.player_white,
          player_black: match.player_black,
          opponent_name: opponentProfile?.full_name ?? "Guest",
          opponent_avatar: opponentProfile?.avatar_url ?? null,
          result,
          time_control,
        };
      });

      setMatches(mapped);
    };

    fetchMatches();
  }, []);

  const getIconForTimeControl = (timeControl: string) => {
    switch (timeControl.toLowerCase()) {
      case "blitz":
        return Images.blitz;
      case "bullet":
        return Images.bullet;
      case "rapid":
        return Images.rapid;
      default:
        return undefined;
    }
  };

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        animateOnMount={true}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.title}>RECENT MATCHES</Text>

          {matches.map((match, index) => (
            <View key={match.id}>
              <View style={styles.matchRow}>
                <View style={styles.leftSection}>
                  <Image
                    source={{ uri: getIconForTimeControl(match.time_control) }}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                  <Text style={styles.timeControl}>{match.time_control}</Text>
                </View>

                <View style={styles.middleSection}>
                  {match.opponent_avatar ? (
                    <Image
                      source={{ uri: match.opponent_avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={28}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={styles.opponent}>{match.opponent_name}</Text>
                </View>

                <View style={styles.rightSection}>
                  <Text
                    style={[
                      styles.result,
                      {
                        color:
                          match.result === "Win"
                            ? "#22C55E"
                            : match.result === "Lose"
                              ? "#EF4444"
                              : "#FACC15",
                      },
                    ]}
                  >
                    {match.result}
                  </Text>
                </View>
              </View>

              {index !== matches.length - 1 && (
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                </View>
              )}
            </View>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#141821",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  indicator: {
    backgroundColor: "#3B82F6",
    width: 80,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "Inter_500Medium",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  leftSection: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  timeControl: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  middleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 30,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 20,
    marginRight: 8,
  },
  opponent: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  rightSection: {
    width: 60,
    alignItems: "flex-end",
    marginRight: 10,
  },
  result: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  dividerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1.5,
    backgroundColor: "#3B82F6",
    width: "85%",
  },
});

export default RecentMatchesSlider;
