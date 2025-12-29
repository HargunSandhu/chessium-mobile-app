import { Button1 } from "@/components/Buttons";
import LogoWithText from "@/components/LogoWithText";
import { Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { useState } from "react";
import { StyleSheet, Text, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/Supabase";
import { useRouter } from "expo-router";

const ResetPassword = () => {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const resetPasswordHandler = async () => {
    if (password !== repeatPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Password updated successfully!");
        router.navigate("/pages/authentication/SignIn?");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <LogoWithText />
      <Text style={styles.heading}>Reset Password</Text>

      <TextInput
        placeholder="New Password"
        placeholderTextColor="#757575"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Repeat Password"
        placeholderTextColor="#757575"
        style={[styles.input, styles.input2]}
        value={repeatPassword}
        onChangeText={setRepeatPassword}
        secureTextEntry
      />

      <Button1 text="Confirm" onPress={resetPasswordHandler} width={"90%"} />
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
  },
  input2: {
    marginTop: 20,
    marginBottom: 50,
  },
});

export default ResetPassword;
