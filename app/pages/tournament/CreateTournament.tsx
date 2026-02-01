import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Button1 } from "@/components/Buttons";

const CreateTournament = () => {
  const router = useRouter();
  useFonts({ Inter_600SemiBold, Inter_500Medium });
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.navigate("/pages/Navbar")}
          activeOpacity={0.8}
          style={styles.backWrapper}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-back" size={26} color="#3B82F6" />
          </View>
        </TouchableOpacity>
        <Text style={styles.heading}>Create Tournament</Text>
      </View>
      <Text style={styles.heading2}>Choose Tournament Type</Text>
      <View style={styles.chooseContainer}>
        <TouchableOpacity>
          <Text style={styles.txt}>Knockout</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.txt}>League</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.heading2}>Choose Time Control</Text>
      <View style={[styles.chooseContainer, { marginBottom: 20 }]}>
        <TouchableOpacity>
          <Text style={styles.txt}>Bullet</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.txt}>Blitz</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.txt}>Rapid</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Tournament Name"
        placeholderTextColor="#757575"
        style={styles.input}
        // value={email}
        // onChangeText={setEmail}
      />
      <TextInput
        placeholder="Starting Date & Time"
        placeholderTextColor="#757575"
        style={styles.input}
        // value={password}
        // onChangeText={setPassword}
      />
      <TextInput 
        placeholder="Maximum Players"
        placeholderTextColor="#757575"
        style={styles.input}
      />
      <Button1 text="Create Tournament" width={"90%"} onPress={() => {}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#0B0E13",
    flex: 1,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    gap: 10,
  },

  backWrapper: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    fontSize: 26,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  heading2: {
    fontSize: 20,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    marginLeft: 20,
    marginTop: 30,
    alignSelf: "flex-start",
  },
  txt: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  chooseContainer: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    backgroundColor: "#141821",
    padding: 20,
    marginTop: 15,
    borderRadius: 12,
  },
  input: {
    width: "85%",
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#141821",
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
    marginBottom: 20,
  },
});

export default CreateTournament;
