import { Button1, Button2 } from "@/components/Buttons";
import LogoWithText from "@/components/LogoWithText";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/Supabase";
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  const forgotPasswordHandler = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      // optional but safe to include
      options: {
        emailRedirectTo: "chessium://app/pages/authentication/VerifyEmail",
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Success",
        "A verification code has been sent to your email."
      );
      router.push({
        pathname: "/pages/authentication/VerifyEmail",
        params: { email },
      });
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.main}>
      <LogoWithText />
      <Text style={styles.heading}>Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#757575"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={{ width: "90%", marginBottom: 10 }}>
        <Button1 text="Send OTP" onPress={forgotPasswordHandler} />
      </View>

      <Button2
        text="Back to Sign In"
        onPress={() => router.push("/pages/authentication/SignIn")}
        width={"90%"}
      />
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
    marginTop: 30,
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#2C2C2C",
    fontSize: 18,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
    marginTop: 50,
    marginBottom: 50,
  },
});

export default ForgotPassword;
