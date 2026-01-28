import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/app/lib/Supabase";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";

const Chat = () => {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();

  useFonts({ Inter_400Regular, Inter_600SemiBold });

  const [friend, setFriend] = useState<any>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    init();
    return () => cleanup();
  }, [friendId]);

  const init = async () => {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid || !friendId) return;

    setMyId(uid);
    fetchFriend();
    fetchMessages(uid);
    subscribeMessages(uid);
  };

  const cleanup = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  const fetchFriend = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, user_status")
      .eq("id", friendId)
      .single();

    setFriend(data);
  };

  const fetchMessages = async (uid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${uid})`,
      )
      .order("created_at", { ascending: true });

    setMessages(data ?? []);
    scrollBottom();
  };

  const subscribeMessages = (uid: string) => {
    channelRef.current = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;

          // ignore my own realtime echo
          if (msg.sender_id === uid) return;

          if (msg.sender_id === friendId && msg.receiver_id === uid) {
            setMessages((prev) => [...prev, msg]);
            scrollBottom();
          }
        },
      )
      .subscribe();
  };

  const sendMessage = async () => {
    if (!message.trim() || !myId) return;

    const tempId = `temp-${Date.now()}`;

    // 🔥 OPTIMISTIC MESSAGE
    const optimisticMsg = {
      id: tempId,
      sender_id: myId,
      receiver_id: friendId,
      content: message.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");
    scrollBottom();

    // background insert
    await supabase.from("messages").insert({
      sender_id: myId,
      receiver_id: friendId,
      content: optimisticMsg.content,
    });
  };

  const scrollBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderItem = ({ item }: { item: any }) => {
    const mine = item.sender_id === myId;

    return (
      <View
        style={[styles.bubble, mine ? styles.myBubble : styles.friendBubble]}
      >
        <Text style={styles.bubbleText}>{item.content}</Text>
        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
      </View>
    );
  };

  const isOnline = friend?.user_status === "online";

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={30}
              color="#3B82F6"
              style={{ marginHorizontal: 20 }}
            />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            {friend?.avatar_url ? (
              <Image
                source={{ uri: friend.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={45} color="#fff" />
            )}

            <View>
              <Text style={styles.name}>{friend?.full_name ?? "Player"}</Text>
              <Text
                style={[
                  styles.status,
                  { color: isOnline ? "#22C55E" : "#EF4444" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>

        {/* CHAT */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />

        {/* INPUT */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#757575"
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage}>
            <LinearGradient
              colors={["#3B82F6", "#2563EB", "#1E3A8A"]}
              style={styles.sendBtn}
            >
              <Ionicons name="paper-plane" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#0B0E13" },
  topBar: {
    height: 60,
    backgroundColor: "#141821",
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 45, height: 45, borderRadius: 22.5 },
  name: { color: "#fff", fontSize: 18, fontFamily: "Inter_600SemiBold" },
  status: { fontSize: 14 },

  bubble: { maxWidth: "75%", padding: 10, borderRadius: 10, marginVertical: 4 },
  myBubble: { backgroundColor: "#3b82f6", alignSelf: "flex-end" },
  friendBubble: { backgroundColor: "#1f2937", alignSelf: "flex-start" },
  bubbleText: { color: "#fff", fontSize: 16 },
  time: { fontSize: 11, color: "#D1D5DB", marginTop: 4, alignSelf: "flex-end" },

  inputWrapper: { flexDirection: "row", padding: 10, gap: 10 },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#5A5A5A",
    borderWidth: 1,
    backgroundColor: "#1E2230",
    borderRadius: 8,
    paddingHorizontal: 20,
    color: "#fff",
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Chat;
