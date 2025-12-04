import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { ThemedButton } from "@/components/ui/themed-button";
import { Fonts } from '@/constants/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet } from 'react-native';
import { createAccount, handleLogin } from "../../scripts/backend-call";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLoginClick = async () => {
    try {
      const response = await handleLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    AsyncStorage.setItem("userEmail", email);
  };

  interface LoginStateProps {
    setInSignUp: (val: boolean) => void;
  }

  function EnterLogonInfo({ setInSignUp }: LoginStateProps) {
    return (
      <ThemedView
        style={{
          backgroundColor: 'transparent',
          flex: 1,
          gap: 16,
          height: '100%',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <ThemedText type="title"
          style={{
            fontFamily: Fonts.rounded,
            textAlign: 'center',
          }}
        >Login</ThemedText>
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
        <ThemedView
          style={{
            backgroundColor: 'transparent',
            flexDirection: 'row',
            gap: 16,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <ThemedButton onPress={handleLoginClick} content="Login"></ThemedButton>
          <ThemedButton content="Sign Up" onPress={() => setInSignUp(true)} ></ThemedButton>
        </ThemedView>
      </ThemedView>
    );
  }

  function EnterSignUpInfo({ setInSignUp }: LoginStateProps) {
    function createAccountClick() {
      if (email == "" || password == "") {
        console.error("Email and password cannot be empty");
        return;
      }
      createAccount(email, password);
      setInSignUp(false);
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

        <ThemedButton content="Back to Login" onPress={() => setInSignUp(false)}></ThemedButton>
      </ThemedView>
    );
  }

  function FormCard() {
    const [inSignUp, setInSignUp] = useState(false);

    return (
      <ThemedView
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'white',
          borderRadius: 24,
          borderWidth: 1,
          height: '35%',
          margin: 'auto',
        }}
      >
        { inSignUp ? <EnterSignUpInfo setInSignUp={setInSignUp}/> : <EnterLogonInfo setInSignUp={setInSignUp} /> }
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={{
        alignItems: 'center',
        height: '100%',
      }}
    >
      <FormCard />
    </ThemedView>
  );
}

export default LoginPage;

const styles = StyleSheet.create({
  
});