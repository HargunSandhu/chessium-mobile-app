// import "react-native-gesture-handler";
// import "react-native-reanimated";
import { Link, Redirect } from "expo-router";
import { View, Text } from "react-native";

const Index = () => {
  return (
    <View>
      {/* <Redirect href="/pages/Intro" /> */}
      <Redirect href="/pages/Navbar" />
    </View>
  );
};

export default Index;
