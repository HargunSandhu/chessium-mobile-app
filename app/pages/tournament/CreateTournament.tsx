import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Button1 } from "@/components/Buttons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useState } from "react";

const CreateTournament = () => {
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const [tournamentType, setTournamentType] = useState<"knockout" | "league">(
    "knockout",
  );

  const [timeControl, setTimeControl] = useState<"bullet" | "blitz" | "rapid">(
    "blitz",
  );

  useFonts({
    Inter_600SemiBold,
    Inter_500Medium,
  });

  const openPicker = () => {
    if (Platform.OS === "android") {
      const baseDate = date ?? new Date();

      DateTimePickerAndroid.open({
        value: baseDate,
        mode: "date",
        minimumDate: new Date(),
        onChange: (_, selectedDate) => {
          if (!selectedDate) return;

          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            onChange: (_, selectedTime) => {
              if (!selectedTime) return;

              const finalDate = new Date(selectedDate);
              finalDate.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
              );

              setDate(finalDate);
            },
          });
        },
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
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
            <TouchableOpacity onPress={() => setTournamentType("knockout")}>
              <Text
                style={[
                  styles.txt,
                  tournamentType === "knockout" && styles.activeOption,
                ]}
              >
                Knockout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTournamentType("league")}>
              <Text
                style={[
                  styles.txt,
                  tournamentType === "league" && styles.activeOption,
                ]}
              >
                League
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heading2}>Choose Time Control</Text>
          <View style={[styles.chooseContainer, { marginBottom: 20 }]}>
            <TouchableOpacity onPress={() => setTimeControl("bullet")}>
              <Text
                style={[
                  styles.txt,
                  timeControl === "bullet" && styles.activeOption,
                ]}
              >
                Bullet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTimeControl("blitz")}>
              <Text
                style={[
                  styles.txt,
                  timeControl === "blitz" && styles.activeOption,
                ]}
              >
                Blitz
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTimeControl("rapid")}>
              <Text
                style={[
                  styles.txt,
                  timeControl === "rapid" && styles.activeOption,
                ]}
              >
                Rapid
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Tournament Name"
            placeholderTextColor="#757575"
            style={styles.input}
          />

          <Pressable style={styles.dateInputWrapper} onPress={openPicker}>
            <Text
              style={[styles.dateText, { color: date ? "#FFFFFF" : "#757575" }]}
            >
              {date ? date.toLocaleString() : "Starting Date & Time"}
            </Text>
            <Ionicons name="calendar-outline" size={24} color="#757575" />
          </Pressable>

          <TextInput
            placeholder="Maximum Players"
            placeholderTextColor="#757575"
            style={styles.input}
            keyboardType="number-pad"
          />
        </ScrollView>

        <View style={styles.bottomButton}>
          <Button1 text="Create Tournament" width={"90%"} onPress={() => {}} />
        </View>

        {Platform.OS === "ios" && showIOSPicker && (
          <DateTimePicker
            value={date ?? new Date()}
            mode="datetime"
            minimumDate={new Date()}
            display="spinner"
            onChange={(_, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#0B0E13",
    flex: 1,
  },
  content: {
    paddingBottom: 40,
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
    padding: 7,
  },
  chooseContainer: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 20,
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
    marginBottom: 20,
  },
  dateInputWrapper: {
    width: "85%",
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#141821",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 18,
  },
  bottomButton: {
    paddingBottom: 20,
    alignItems: "center",
  },
  activeOption: {
    borderColor: "#3B82F6",
    borderWidth: 1,
    borderRadius: 8,
    color: "#3B82F6",
    padding: 7,
  },
});

export default CreateTournament;
