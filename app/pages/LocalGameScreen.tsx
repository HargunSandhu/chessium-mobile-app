import { Button1, Button2 } from "@/components/Buttons";
import { Ionicons } from "@expo/vector-icons";
import { Chess } from "chess.js";
import Chessboard, { DefaultThemes } from "dawikk-chessboard";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LocalGameScreen = () => {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [modalVisible, setModalVisible] = useState(false);
  const [resultText, setResultText] = useState("");
  const router = useRouter();
  const handleMove = (from: string, to: string, promotion?: string) => {
    const chess = chessRef.current;
    const move = chess.move({ from, to, promotion });

    if (!move) return; // illegal move
    setFen(chess.fen());

    // check for game end
    if (chess.isCheckmate()) {
      setResultText(
        `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins`,
      );
      setModalVisible(true);
    } else if (chess.isStalemate()) {
      setResultText("Stalemate! It's a draw");
      setModalVisible(true);
    } else if (chess.isThreefoldRepetition()) {
      setResultText("Draw by threefold repetition");
      setModalVisible(true);
    } else if (chess.isInsufficientMaterial()) {
      setResultText("Draw due to insufficient material");
      setModalVisible(true);
    } else if (chess.isDraw()) {
      setResultText("Draw by fifty-move rule");
      setModalVisible(true);
    }
  };

  const resetGame = () => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={styles.backButton}
        >
          <View style={styles.circle}>
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </View>
        </TouchableOpacity>

        <View style={styles.centerHeader}>
          <Text style={styles.heading}>Choose Mode</Text>
          <Text style={styles.subHeading}>Player vs Player</Text>
        </View>
      </View>
      <Chessboard
        fen={fen}
        onMove={(from, to, promotion) => handleMove(from, to, promotion)}
        boardTheme={DefaultThemes.blue}
        showCoordinates={false}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{resultText}</Text>
            {/* <TouchableOpacity style={styles.button} onPress={resetGame}>
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>
                      <TouchableOpacity
                          style={styles.button}
                          onPress={() => {
                              setModalVisible(false);
                              router.navigate("/pages/Dashboard")
                           }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity> */}
            <Button1
              text="Play Again"
              onPress={() => {
                setModalVisible(false);
                resetGame();
              }}
              width={250}
            />
            <Button2
              text="Back to Dashboard"
              onPress={() => {
                setModalVisible(false);
                router.navigate("/pages/Dashboard");
              }}
              width={250}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#0B0E13",
    // justifyContent: "center",
    // alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#141821",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    gap: 20,
  },
  modalText: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 20,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },

  centerHeader: {
    alignItems: "center",
  },

  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#141821",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
  },

  subHeading: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_400Regular",
  },
});

export default LocalGameScreen;
