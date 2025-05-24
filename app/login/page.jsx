"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../config";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE_URL}/api/login`,  {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("userId", data.userId);
      router.push("/todo");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col items-center justify-center mt-20">
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
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>

      
      <p className="mt-4">
        Don't have an account?{" "}
        <a href="/register" className="text-blue-600 underline">
          Register here
        </a>
      </p>
    </form>
  );
};

export default LoginPage;
