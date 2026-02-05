import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChooseTournament = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backWrapper}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-back" size={26} color="#3B82F6" />
          </View>
        </TouchableOpacity>
        <Text style={styles.heading}>Tournaments</Text>
      </View>
      <View style={{ justifyContent: "center", height: "60%" }}>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => {
            router.navigate("/pages/tournament/JoinTournament");
          }}
        >
          <Text style={styles.btnText}>Join a Tournament</Text>
          <Ionicons name="log-in-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => {
            router.navigate("/pages/tournament/CreateTournament");
          }}
        >
          <Text style={styles.btnText}>Create a Tournament</Text>
          <Ionicons name="create-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => {
            router.navigate("/pages/tournament/TournamentsJoined");
          }}
        >
          <Text style={styles.btnText}>Tournaments Joined</Text>
          <Ionicons name="people-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnContainer}
          onPress={() => {
            router.navigate("/pages/tournament/MyTournaments");
          }}
        >
          <Text style={styles.btnText}>My Tournaments</Text>
          <Ionicons name="trophy-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#0B0E13",
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 40,
    gap: 10,
  },

  backWrapper: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  btnContainer: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    // gap: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
    padding: 30,
    borderRadius: 12,
    marginTop: 40,
    // alignItems: "center",
    // backgroundColor: "#3B82F6",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
});

export default ChooseTournament;
