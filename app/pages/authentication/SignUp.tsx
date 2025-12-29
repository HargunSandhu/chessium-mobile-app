// import { supabase } from "@/app/lib/Supabase";
import { Images } from "@/assets/images/Images";
import { Button1, Button2 } from "@/components/Buttons";
import LogoWithText from "@/components/LogoWithText";
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/Supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_400Regular,
  });
  if (!fontsLoaded) {
    return null;
  }

  const signUpHandler = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      console.log("Sign up error:", error);
      return;
    }

    const user = data?.user;
    const session = data?.session;
    console.log("Signed up", user, session);
    router.navigate("/pages/authentication/SignIn");
  };

  return (
    <SafeAreaView style={styles.main}>
      <LogoWithText />
      <Text style={styles.heading}>Sign Up</Text>
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
      />
      <View style={{ width: "90%", marginTop: 30 }}>
        <Button1 text="Sign Up" onPress={signUpHandler} />
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
          text="Continue with Google"
          imagePath={Images.google}
          width={"90%"}
        />
      </View>
      <Button2 text="Continue as a Guest" width={"90%"} />
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 15 }}
      >
        <Text style={styles.text}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => {
            router.navigate("/pages/authentication/SignIn");
          }}
        >
          <Text style={styles.linkText}>Sign In</Text>
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
    fontFamily: "Inter_400Regular",
  },
  linkText: {
    color: "#3B82F6",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
  },
});
export default SignUp;
