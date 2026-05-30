"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });

      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h1>Signup</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleSignup}>
        Signup
      </button>
    </div>
  );
}