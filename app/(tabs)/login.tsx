import { useNavigation } from "expo-router";
import { useState } from "react";
import handleLogin from "../../scripts/db-calls";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLoginClick = async () => {
    try {
      const response = await handleLogin(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  let EnterLogonInfo = (
    <div>
      <h1>Login</h1>
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
      <button onClick={handleLoginClick}>Login</button>

      <button>Sign Up</button>
    </div>
  );

  let CreateAccount = (
    <div>
      <h1>Create Account</h1>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Create Account</button>
    </div>
  );

  return <>{EnterLogonInfo}</>;
}

export default LoginPage;
