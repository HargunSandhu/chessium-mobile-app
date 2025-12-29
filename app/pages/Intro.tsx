import { Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_700Bold,
  Inter_600SemiBold,
  Inter_500Medium_Italic,
} from "@expo-google-fonts/inter";
import { Image } from "react-native";
import { Images } from "../../assets/images/Images";
import { Button1, Button2 } from "../../components/Buttons";
import { useRouter } from "expo-router";

export default function Intro() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium_Italic,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.heading}>Chessium</Text>
      <Image
        source={{ uri: Images.logo_knight }}
        style={styles.img}
        resizeMode="contain"
      />
      <View style={styles.sloganContainer}>
        <Text style={styles.slogan}>The Board Awaits </Text>
        <Text style={styles.slogan}>Your Move.</Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Train your brain, play thrilling matches, and climb the ranks in this
          interactive chess app
        </Text>
      </View>
      <View style={styles.btnContainer}>
        <Button1
          text="Get Started"
          onPress={() => router.navigate("/pages/authentication/SignIn")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    alignItems: "center",
  },
  heading: {
    color: "#fff",
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    marginTop: 30,
  },
  img: {
    height: 450,
    width: 450,
    marginTop: 30,
  },
  sloganContainer: {
    alignItems: "flex-start",
    width: "80%",
    marginTop: -50,
  },
  slogan: {
    color: "#fff",
    fontSize: 25,
    fontFamily: "Inter_600SemiBold",
  },
  descriptionContainer: {
    width: "80%",
    marginTop: 20,
  },
  description: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Inter_500Medium_Italic",
  },
  btnContainer: {
    width: "90%",
    marginTop: 20,
    alignItems: "flex-end",
  },
});
