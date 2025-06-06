import React, { useState } from "react";
import { useParams } from "react-router-dom";

const NewUserSetPassword: React.FC = () => {
  const { activationKey } = useParams<{ activationKey: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Activation Key:", activationKey);
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Set Your Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Confirm
        </button>
      </form>
    </div>
  );
};

export default NewUserSetPassword;