import { Button2 } from "@/components/Buttons";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GameMode = "bullet" | "blitz" | "rapid";

const FindingOpponent = () => {
  const { mode } = useLocalSearchParams<{ mode: GameMode }>();

  console.log("Selected mode:", mode);

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.title}>Player vs Player</Text>
      <Text style={styles.subtitle}>Finding Opponent ({mode})</Text>

      {/* <LottieView
        source={Images.globe}
        autoPlay
        loop
        style={styles.animation}
      /> */}

      <Button2 text="Cancel" width={"90%"} />
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
  animation: {
    width: 220,
    height: 220,
    marginBottom: 40,
  },
});
