import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { createAccount } from "../../scripts/db-calls";

function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  function GoToLogin() {
    // navigation.back();
  }

  function createAccountClick() {
    if (email == "" || password == "") {
      console.error("Email and password cannot be empty");
      return;
    }
    createAccount(email, password);
  }

  return (
    <ThemedView>
      <ThemedText type="title">Create Account</ThemedText>
      <ThemedTextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <ThemedTextInput
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <ThemedButton
        onPress={() => createAccountClick()}
        content="Create Account"
      ></ThemedButton>

      <ThemedButton onPress={GoToLogin} content="Back to Login"></ThemedButton>
    </ThemedView>
  );
}

export default CreateAccountPage;
