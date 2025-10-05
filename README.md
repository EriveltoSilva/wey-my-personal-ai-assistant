# 🧠 Wey, a Jarvis-Like AI Assistant (Frontend)

This is the **frontend** of `Wey` my personal AI Assistant — an intelligent, generative and context-aware system inspired by *Jarvis* from Iron Man.  
It’s a personal challenge and research project that integrates **AI**, **IoT**, **Automation**, and **Software Engineering** in one experience.  

The goal: create a virtual assistant that I can **talk to**, **ask questions**, and **interact with in natural language** — eventually capable of controlling my environment (like turning on a lamp) and connecting with my own apps.

---

## 🚀 Project Overview

The assistant is being built as a modular system composed of:
- 🖥 **Frontend (this repo)** — Chat and voice interface built with React + TypeScript + TailwindCSS.  
- ⚙️ **Backend** — FastAPI + LangChain orchestration for AI reasoning, tool calls, and device control via MQTT.  
- 🌐 **IoT Devices** — ESP32-based devices connected through MQTT to execute commands.  

In later phases, the assistant will support **voice interaction**, **multi-device presence**, and become a **scalable SaaS platform** with IoT integration.

---

## 🧩 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, TailwindCSS |
| **Backend (API)** | FastAPI, LangChain, MQTT |
| **AI / LLM** | OpenAI, LangGraph (planned) |
| **IoT** | ESP32 + MQTT Broker (Mosquitto) |
| **Communication** | REST / WebSocket |
| **Deployment** | Docker + Vercel (planned) |

---

## 📦 Features

### ✅ Version 1.0
- Chat interface (text-based)  
- Integration with FastAPI backend  
- Displays assistant replies in real-time  
- Sends user messages to backend endpoint (`/chat`)  

### ⚡ Version 1.5 (in development)
- AI detects and executes commands like:
  > “Turn on the lamp” → sends MQTT command to IoT device  
- Persistent session history  
- Improved UI with chat bubbles and action logs  

### 🔊 Future Versions
- Voice input/output (STT + TTS)  
- Connection with personal productivity apps  
- Real-time device state visualization  
- Cloud deployment and SaaS capabilities  

---

## 🛠️ Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/EriveltoSilva/ai-assistant-frontend.git
cd ai-assistant-frontend
````

### 2️⃣ Install dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Start the development server

```bash
npm run dev
```

By default, the frontend runs on [http://localhost:5173](http://localhost:5173)
and communicates with the backend at `http://localhost:8000/chat`.
You can adjust this in the project’s `.env` file or Vite config.

---

## 🧠 How It Works

```mermaid
graph TD
    A[User in Chat UI] -->|Message| B[FastAPI Backend]
    B -->|Intent Detection / LLM| C[LangChain Agent]
    C -->|Tool Invocation| D[MQTT Publisher]
    D -->|Command| E[ESP32 Device (Lamp)]
    E -->|Feedback| B
    B -->|Response| A
```

---

## 🧰 Project Structure

```
ai-assistant-frontend/
│
├── src/
│   ├── components/        # UI components (Chat, MessageList, Input)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API communication logic
│   ├── App.tsx            # Main React component
│   └── index.tsx          # Entry point
│
├── public/                # Static assets
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🧪 Example Usage

When connected to the backend and MQTT device, you can:

> **User:** Turn on the lamp
> **Assistant:** Okay — I sent the command to turn the lamp ON.

The ESP32 subscribed to `home/room1/lamp` receives the message and activates the GPIO pin linked to your lamp.

---

## 💡 Roadmap

| Version  | Goal                                              |
| -------- | ------------------------------------------------- |
| **v1.0** | Text-based chat with FastAPI integration          |
| **v1.5** | Device control (lamp on/off) through conversation |
| **v2.0** | Add voice (STT/TTS) and context memory            |
| **v3.0** | Omnichannel experience + multi-app integration    |
| **v4.0** | Scalable SaaS product with AI + IoT core          |

---

## 🤖 Author

**Erivelto Clénio da Costa e Silva**
Software Developer | AI & IoT Enthusiast | Founder of K.A Solutions
🌐 [Portfolio](https://erivelto-silva-portfolio.vercel.app)

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

## ⚙️ Future Vision

> “Not just another virtual assistant — but a personalized AI companion that connects software, intelligence, and the physical world.”

---
