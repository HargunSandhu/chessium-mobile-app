import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/Supabase";

const Menu = () => {
  const router = useRouter();
  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error logging out:", error.message);
    } else {
      console.log("Logged out successfully");
      router.replace("/pages/Intro");
    }
  };
  return (
    <SafeAreaView style={styles.main}>
      <Header />
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          height: "70%",
        }}
      >
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/pages/AnalyseMode")}
        >
          <Ionicons color={"#fff"} name="analytics" size={28} />
          <Text style={styles.txt}>Analyse Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/pages/Tournament")}
        >
          <Ionicons color={"#fff"} name="trophy" size={28} />
          <Text style={styles.txt}>Tournaments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleLogOut}>
          <Ionicons color={"#fff"} name="log-out" size={28} />
          <Text style={styles.txt}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    // alignItems: "center",
  },
  btn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "85%",
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    // justifyContent: "",
  },
  txt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
});
export default Menu;
