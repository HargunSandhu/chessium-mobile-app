import { Redirect } from "expo-router";
import { View } from "react-native";

const Index = () => {
  return (
    <View>
      <Redirect href="/pages/Intro" />
      {/* <Redirect href="/pages/Navbar" /> */}
    </View>
  );
};

export default Index;
