import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyTournaments = () => {
  return (
    <SafeAreaView style={styles.main}>
      <View></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
});

export default MyTournaments;
