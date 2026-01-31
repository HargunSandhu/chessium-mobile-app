import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Tournament = () => {
  return <SafeAreaView style={styles.main}></SafeAreaView>;
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#0B0E13",
    flex: 1,
  },
});

export default Tournament;
