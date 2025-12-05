import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import { Fonts } from "@/constants/theme";
import { createAccount, handleLogin } from "@/scripts/backend-call";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useAuth } from "../auth_context";

// NOTE - AI was used throughout this file in order to edit the already existing code
// to properly validate user input and handle giving alert errors.

interface AuthFormProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  setInSignUp: (val: boolean) => void;
  onSubmit?: () => void;
}

function EnterLogonInfo({
  email,
  setEmail,
  password,
  setPassword,
  setInSignUp,
  onSubmit,
}: AuthFormProps) {
  return (
    <ThemedView
      style={{
        backgroundColor: "transparent",
        flex: 1,
        gap: 16,
        height: "100%",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <ThemedText
        type="title"
        style={{
          fontFamily: Fonts.rounded,
          textAlign: "center",
        }}
      >
        Login
      </ThemedText>
      <ThemedTextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ThemedTextInput
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <ThemedView
        style={{
          backgroundColor: "transparent",
          flexDirection: "row",
          gap: 16,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <ThemedButton onPress={onSubmit} content="Login"></ThemedButton>
        <ThemedButton
          content="Sign Up"
          onPress={() => (setInSignUp(true), setEmail(""), setPassword(""))}
        ></ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

function EnterSignUpInfo({
  email,
  setEmail,
  password,
  setPassword,
  setInSignUp,
  onSubmit,
}: AuthFormProps) {
  const [loading, setLoading] = useState(false);

  async function createAccountClick() {
    if (email === "" || password === "") {
      Alert.alert("Error", "Email and password cannot be empty");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await createAccount(email, password);
      console.log("Create account response:", response);

      if (response.error) {
        Alert.alert("Error", response.error);
      } else if (response.message && response.message.includes("created")) {
        Alert.alert("Success", "Account created! You can now log in.", [
          {
            text: "OK",
            onPress: () => {
              setInSignUp(false);
              setEmail("");
              setPassword("");
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Create account error:", error);
      Alert.alert("Error", "Network error. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView
      style={{
        backgroundColor: "transparent",
        flex: 1,
        gap: 16,
        height: "100%",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <ThemedText
        type="title"
        style={{
          fontFamily: Fonts.rounded,
          textAlign: "center",
        }}
      >
        Create Account
      </ThemedText>
      <ThemedTextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ThemedTextInput
        secureTextEntry={true}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <ThemedView
        style={{
          alignItems: "center",
          backgroundColor: "transparent",
          flexDirection: "column",
          gap: 16,
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: 8,
        }}
      >
        <ThemedButton
          onPress={() => createAccountClick()}
          content={loading ? "Creating..." : "Create Account"}
          disabled={loading}
        ></ThemedButton>
        <ThemedButton
          onPress={() => (setInSignUp(false), setEmail(""), setPassword(""))}
          content="Back to Login"
          disabled={loading}
        ></ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inSignUp, setInSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { login, userName } = useAuth();

  const handleLoginClick = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Email and password cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await handleLogin(email, password);
      console.log("Login response:", response);

      if (response.error) {
        Alert.alert("Login Failed", response.error);
      } else if (response.message && response.message.includes("successful")) {
        await login(email);
        console.log("Logged in successfully as", email);
        await AsyncStorage.setItem("userEmail", email);
        Alert.alert("Success", `Welcome back, ${email}!`);
      } else {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      Alert.alert(
        "Error",
        "Network error. Make sure the server is running and reachable."
      );
    } finally {
      setLoading(false);
    }
  };

  if (userName) {
    const { logout } = useAuth();
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Hello, {userName}!</ThemedText>
        <ThemedButton content="Logout" onPress={logout} />
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        alignItems: "center",
        height: "100%",
      }}
    >
      <ThemedView
        style={{
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderColor: "white",
          borderRadius: 24,
          borderWidth: 1,
          height: inSignUp ? "45%" : "35%",
          margin: "auto",
          width: "80%",
        }}
      >
        {inSignUp ? (
          <EnterSignUpInfo
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setInSignUp={setInSignUp}
          />
        ) : (
          <EnterLogonInfo
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            setInSignUp={setInSignUp}
            onSubmit={handleLoginClick}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

export default LoginPage;

const styles = StyleSheet.create({});
