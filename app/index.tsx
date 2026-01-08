import { Redirect } from "expo-router";
import { View } from "react-native";

const Index = () => {
  return (
    <View>
      {/* <Redirect href="/pages/Intro" /> */}
      {/* <Redirect href="/pages/competitiveMode/GameScreen" /> */}
      <Redirect href="/pages/authentication/Name" />
    </View>
  );
};

export default Index;
