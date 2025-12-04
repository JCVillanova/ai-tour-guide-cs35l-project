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

interface AuthFormProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  setInSignUp: (val: boolean) => void;
  onSubmit?: () => void;
}

function EnterLogonInfo({ email, setEmail, password, setPassword, setInSignUp, onSubmit }: AuthFormProps) {
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
        <ThemedButton onPress={onSubmit} content="Login"></ThemedButton>
        <ThemedButton content="Sign Up" onPress={() => setInSignUp(true)} ></ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

function EnterSignUpInfo({ email, setEmail, password, setPassword, setInSignUp, onSubmit }: AuthFormProps) {
  function createAccountClick() {
    if (email == "" || password == "") {
      console.error("Email and password cannot be empty");
      return;
    }
    createAccount(email, password);
    setInSignUp(false);
  }

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
      >Create Account</ThemedText>
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
          alignItems: 'center',
          backgroundColor: 'transparent',
          flexDirection: 'column',
          gap: 16,
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 8,
        }}
      >
        <ThemedButton onPress={() => createAccountClick()} content="Create Account"></ThemedButton>
        <ThemedButton onPress={() => setInSignUp(false)} content="Back to Login"></ThemedButton>
      </ThemedView>
    </ThemedView>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inSignUp, setInSignUp] = useState(false);
  const router = useRouter();

  const handleLoginClick = async () => {
    try {
      const response = await handleLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    AsyncStorage.setItem("userEmail", email);
  };

  return (
    <ThemedView
      style={{
        alignItems: 'center',
        height: '100%',
      }}
    >
      <ThemedView
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'white',
          borderRadius: 24,
          borderWidth: 1,
          height: inSignUp ? '45%' : '35%',
          margin: 'auto',
          width: '80%',
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

const styles = StyleSheet.create({
  
});