import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import { useRouter } from "expo-router";
import { useState } from "react";
import { testEcho } from "../../scripts/backend-call";
import { StyleSheet, Alert } from "react-native";

function TestFetchPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTestEcho = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please enter some text");
      return;
    }

    setLoading(true);
    try {
      const result = await testEcho(inputText);
      setOutputText(
        `Original: ${result.originalText}\nReversed: ${result.reversedText}`
      );
      Alert.alert("Success", "Test echo completed!");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      Alert.alert("Error", `Failed to test echo: ${message}`);
      console.error("testEcho error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Test Fetch Endpoint</ThemedText>

      <ThemedTextInput
        style={styles.input}
        placeholder="Enter text to reverse"
        value={inputText}
        onChangeText={setInputText}
        editable={!loading}
      />

      <ThemedButton
        onPress={handleTestEcho}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        <ThemedText>{loading ? "Testing..." : "Test Echo"}</ThemedText>
      </ThemedButton>

      {outputText ? (
        <ThemedText style={styles.output}>{outputText}</ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  output: {
    fontSize: 16,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
  },
});

export default TestFetchPage;
