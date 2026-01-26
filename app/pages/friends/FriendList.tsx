import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const FriendList = () => {
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
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="chatbox-ellipses" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Ionicons name="game-controller" size={24} color="#3b82f6" />
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
  btn: {
    borderWidth: 1,
    borderColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
  },
});

export default FriendList;
