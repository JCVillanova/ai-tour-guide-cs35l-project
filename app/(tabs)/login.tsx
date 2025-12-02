import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { useState } from "react";
import { handleLogin } from "../../scripts/db-calls";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<any>();

  const handleLoginClick = async () => {
    try {
      const response = await handleLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    AsyncStorage.setItem("userEmail", email);
  };

  const handleCreateAccountClick = () => {
    navigation.navigate("/(tabs)/create-account");
  };

  let EnterLogonInfo = (
    <ThemedView>
      <ThemedText type="title">Login</ThemedText>
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
      <ThemedButton onPress={handleLoginClick} content="Login"></ThemedButton>

      <ThemedButton content="Sign Up"></ThemedButton>
    </ThemedView>
  );

  return <>{EnterLogonInfo}</>;
}

export default LoginPage;
