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
    <div>
      <h1>Create Account</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => createAccountClick()}>Create Account</button>

      <button onClick={GoToLogin}>Back to Login</button>
    </div>
  );
}

export default CreateAccountPage;
