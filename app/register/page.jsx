"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../config";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

   const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("Registration successful! Please login.");
      router.push("/login"); // Redirect to login page
    } else {
      const data = await res.json();
      alert(data.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col items-center justify-center mt-20">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="m-2 p-2 border"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="m-2 p-2 border"
      />
      <button className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
    </form>
  );
};

export default RegisterPage;
