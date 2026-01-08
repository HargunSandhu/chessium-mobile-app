import "react-native-url-polyfill/auto";
import {
  Inter_500Medium_Italic,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Images } from "../../assets/images/Images";
import { Button1 } from "../../components/Buttons";
import { useEffect, useState } from "react";
import { supabase } from "../lib/Supabase";

export default function Intro() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_600SemiBold,
    Inter_500Medium_Italic,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/pages/Navbar");
      } else {
        setCheckingSession(false);
      }
    });
  }, []);

  if (!fontsLoaded || checkingSession) return null;

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
