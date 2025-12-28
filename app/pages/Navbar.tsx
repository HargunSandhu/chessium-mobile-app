import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Dashboard from "@/app/pages/Dashboard";
import Leaderboard from "@/app/pages/Leaderboard";
import Friends from "@/app/pages/Friends";
import Menu from "@/app/pages/Menu";
import { Images } from "@/assets/images/Images";

const Tab = createBottomTabNavigator();

const Navbar = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#4C4B50",
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#0B0F1C",
          height: 80,
          borderTopWidth: 1,
          borderRadius: 40,
          borderColor: "#2563EB",
          borderWidth: 1,
          marginHorizontal: 20,
          bottom: 20,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          // justifyContent: "center",
          // alignItems: "center",
          marginVertical: 0,
          paddingTop: 20,
          paddingVertical: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={30}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "trophy" : "trophy-outline"}
                size={30}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Knight"
        component={Dashboard}
        options={{
          tabBarButton: () => (
            <View style={styles.centerButtonWrapper}>
              <LinearGradient
                colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.centerButton}
              >
                <Image
                  source={{ uri: Images.knight }}
                  style={styles.knightIcon}
                />
              </LinearGradient>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={30}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={Menu}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "menu" : "menu-outline"}
                size={30}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonWrapper: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    zIndex: 10,
  },
  centerButton: {
    width: 85,
    height: 85,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  knightIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});

export default Navbar;
