// app/todo/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../config";

const TodoPage = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tasks, setTasks] = useState([]);
  const router = useRouter();

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchTasks = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`);
    const data = await res.json();

    // ✅ Safety check to avoid crash on bad response
    if (Array.isArray(data)) {
      setTasks(data);
    } else {
      console.warn("Unexpected task data:", data);
      setTasks([]);
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    setTasks([]);
  }
};

  useEffect(() => {
    if (!userId) {
      router.push("/login"); // Redirect to login if not logged in
    } else {
      fetchTasks();
    }
  }, [userId]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title || !desc) return;

    await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, description: desc }),
    });

    setTitle("");
    setDesc("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE_URL}/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">My To-Do List</h1>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <form onSubmit={addTask} className="flex flex-col items-center mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="m-2 p-2 border w-96"
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="m-2 p-2 border w-96"
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded">Add Task</button>
      </form>

      <ul className="space-y-4">
        {tasks.length === 0 ? (
          <li>No tasks found.</li>
        ) : (

          {Array.isArray(tasks) && tasks.length > 0 ? (
  tasks.map((task) => (
    <li key={task.id} className="flex justify-between items-center border p-2 rounded">
      <div>
        <h3 className="font-semibold text-xl">{task.title}</h3>
        <p>{task.description}</p>
      </div>
      <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white px-3 py-1 rounded">
        Delete
      </button>
    </li>
  ))
) : (
  <p className="text-gray-600">No tasks found.</p>
)}


        )}
      </ul>
    </div>
  );
};

export default TodoPage;




