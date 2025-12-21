import "react-native-gesture-handler";
import "react-native-reanimated";

import "expo-router/entry";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "[Reanimated] Reading from `value` during component render",
]);
