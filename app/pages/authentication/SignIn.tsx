import { SafeAreaView } from "react-native-safe-area-context";
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Images } from "@/assets/images/Images";
import LogoWithText from "@/components/LogoWithText";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Button1, Button2 } from "@/components/Buttons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "../../lib/Supabase";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });

  const signInHandler = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log("Sign in error:", error);
    } else {
      const user = data.user;
      const session = data.session;
      console.log("Signed in", user, session);
      await router.replace("/pages/Navbar");
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <LogoWithText />
      <Text style={styles.heading}>Sign In</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#757575"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#757575"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={{ width: "90%", marginTop: 30 }}>
        <Button1 text="Sign In" onPress={signInHandler} />
      </View>
      <View
        style={{
          width: "100%",
          marginTop: 10,
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <Button2
          text="Sign In with Google"
          imagePath={Images.google}
          width={"90%"}
        />
      </View>
      <Button2 text="Continue as a Guest" width={"90%"} />
      <TouchableOpacity
        onPress={() => {
          router.navigate("/pages/authentication/ForgotPassword");
        }}
        style={{ marginTop: 20 }}
      >
        <Text style={styles.text}>Forgot Password?</Text>
      </TouchableOpacity>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
      >
        <Text style={styles.text}>Don't have an account? </Text>
        <TouchableOpacity
          onPress={() => {
            router.navigate("/pages/authentication/SignUp");
          }}
        >
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

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
    // marginTop: 30,
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#2C2C2C",
    fontFamily: "Inter_400Regular",
    fontSize: 22,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
    marginTop: 20,
  },
  text: {
    color: "#9A9A9F",
    fontSize: 20,
  },
  linkText: {
    color: "#3B82F6",
    fontSize: 20,
  },
});

export default SignIn;
