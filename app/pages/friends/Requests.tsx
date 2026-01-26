import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

const Requests = () => {
  return (
    <View style={styles.playerContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Ionicons name="person-circle-outline" size={50} color="#fff" />
        <View>
          <Text style={styles.playerName}>Player Name</Text>
          <Text style={styles.playerStatus}>Online</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity style={styles.btn1}>
          <Ionicons name="checkmark-sharp" size={24} color="#22C55E" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn2}>
          <Ionicons name="close-sharp" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    backgroundColor: "#141821",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    height: 75,
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 12,
    alignSelf: "center",
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  playerStatus: {
    color: "#22C55E",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  btn1: {
    borderWidth: 1,
    borderColor: "#22C55E",
    padding: 10,
    borderRadius: 8,
  },
  btn2: {
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
  },
});

export default Requests;
