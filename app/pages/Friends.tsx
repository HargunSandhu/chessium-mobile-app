import Header from "@/components/Header";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FriendList from "./friends/FriendList";
import Requests from "./friends/Requests";
import AddFriend from "./friends/AddFriend";

const Friends = () => {
  useFonts({
    Inter_600SemiBold,
    Inter_400Regular,
  });
  const [activeTab, setActiveTab] = useState("All Friends");

  return (
    <SafeAreaView style={styles.main}>
      <Header />
      <Text style={styles.heading}>Friends</Text>
      <View style={styles.selector}>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => setActiveTab("All Friends")}
        >
          <Text
            style={[
              styles.selectorText,
              activeTab === "All Friends" && styles.activeTab,
            ]}
          >
            All Friends
          </Text>
          {activeTab === "All Friends" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => setActiveTab("Requests")}
        >
          <Text
            style={[
              styles.selectorText,
              activeTab === "Requests" && styles.activeTab,
            ]}
          >
            Requests
          </Text>
          {activeTab === "Requests" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center" }}
          onPress={() => setActiveTab("Add Friends")}
        >
          <Text
            style={[
              styles.selectorText,
              activeTab === "Add Friends" && styles.activeTab,
            ]}
          >
            Add Friends
          </Text>
          {activeTab === "Add Friends" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>
      {activeTab === "All Friends" && <FriendList />}
      {activeTab === "Requests" && <Requests />}
      {activeTab === "Add Friends" && <AddFriend />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    margin: 20,
    fontFamily: "Inter_600SemiBold",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  selectorText: {
    color: "#9CA3AF",
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  activeTab: {
    color: "#fff",
  },
  activeTabIndicator: {
    borderWidth: 3,
    borderColor: "#3B82F6",
    borderRadius: 8,
    marginTop: 4,
    width: 90,
  },
});

export default Friends;
