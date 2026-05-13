"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Shield,
  Bot,
  User,
  Phone,
  FileText,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

interface PoliceReportArtifact {
  referenceId: string;
  draftTemplate: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  policeReport?: PoliceReportArtifact;
}

const suggestedQueries = [
  "Someone called saying they're from Bank Negara and my account is compromised. Is this real?",
  "I received an SMS about winning RM10,000 from Shopee. How do I check if it's real?",
  "My friend asked me to invest in crypto with 500% returns. Should I trust it?",
  "How do I report a scam to Malaysian authorities?",
  "What are the most common types of scams in Malaysia right now?",
];



export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 **Salam & Hello!** I'm your **SoloFraud Autonomous Agentic Advisor**.

I'm here to help you identify scams, understand threats, and stay safe online. Ask me anything about:

• 🔍 Suspicious messages or calls you've received
• 🌐 URLs or websites you're unsure about
• 📋 How to report scams in Malaysia
• 💡 Tips to protect yourself and your family

**Try asking:** _"Someone called saying they're from Bank Negara..."_`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<"ms-MY" | "en-US">("ms-MY");
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const speechEnabledRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    speechEnabledRef.current = isSpeakingEnabled;
  }, [isSpeakingEnabled]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "speechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = speechLang;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput((prev) => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };
    }
  }, [speechLang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!speechEnabledRef.current || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ""));
    utterance.lang = speechLang;
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Send the user's message to our custom Next.js backend API
    // We send the ENTIRE message history so the AI has context of the conversation
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      
      if (!response.ok) {
        throw new Error("Failed to connect to AI Agent API");
      }
      
      // We got the response cleanly, so let's parse the JSON text

      const data = await response.json();
      
      // Build the AI's reply message object
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        timestamp: new Date(),
        policeReport: data.policeReport,
      };

      // Add it to the screen!
      setMessages((prev) => [...prev, aiMsg]);

      // Read aloud if enabled
      speak(aiMsg.content);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I am currently experiencing connection issues to the central database. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setTyping(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line, i) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');
        line = line.replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color: #82BCD5; text-decoration: underline;">$1</a>');

        if (line.startsWith("|") && line.endsWith("|")) {
          return null;
        }

        const actionMatch = line.match(/\[AGENT ACTION:(.*?)\]/i);
        if (actionMatch) {
          const actionText = actionMatch[1].trim();
          return (
            <div key={i} className="my-3 p-3 rounded-xl flex gap-3 items-center" style={{ background: "rgba(130,188,213,0.15)", border: "1px solid rgba(130,188,213,0.3)" }}>
              <div className="relative flex h-2 w-2 shrink-0 mt-0.5">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#82BCD5] opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-[#82BCD5]"></div>
              </div>
              <div className="font-mono text-xs text-[#5a9bb5]">
                <strong className="tracking-widest uppercase text-[#82BCD5]">Autonomous Action Executed</strong><br/>
                {actionText.replace(/`/g, '')}
              </div>
            </div>
          );
        }

        return (
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: line }} />
            {i < content.split("\n").length - 1 && <br />}
          </span>
        );
      });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 24px", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: "rgba(107,126,140,0.08)" }}>
            <Bot size={24} style={{ color: "#6B7E8C" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              AI Scam <span className="gradient-text">Advisor</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#5a9bb5" }} />
              Active Protection System
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4" style={{ scrollBehavior: "smooth" }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex gap-3 max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(130,188,213,0.10)" }}>
                    <Shield size={16} style={{ color: "#82BCD5" }} />
                  </div>
                </div>
              )}
              <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {formatContent(msg.content)}
                </div>
                {msg.role === "assistant" &&
                  msg.policeReport &&
                  !msg.content.includes("OFFICIAL INITIAL REPORT") && (
                  <div
                    className="mt-3 rounded-xl p-3 text-left"
                    style={{
                      background: "rgba(53,71,97,0.06)",
                      border: "1px solid rgba(53,71,97,0.12)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#354761]">
                        Police report draft · Ref {msg.policeReport.referenceId}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(msg.policeReport!.draftTemplate);
                        }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white/80 border border-[var(--border-glass)] text-[#354761] hover:bg-white"
                      >
                        Copy draft
                      </button>
                    </div>
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-[var(--text-secondary)] max-h-64 overflow-y-auto">
                      {msg.policeReport.draftTemplate}
                    </pre>
                  </div>
                )}
                <div className="text-[10px] text-[var(--text-muted)] mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(53,71,97,0.08)" }}>
                    <User size={16} style={{ color: "#354761" }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(130,188,213,0.10)" }}>
              <Shield size={16} style={{ color: "#82BCD5" }} />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1 py-4 px-5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length <= 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mb-4">
          <p className="text-xs text-[var(--text-muted)] mb-2">💡 Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-2 rounded-xl text-left transition-all hover:bg-[rgba(53,71,97,0.05)]"
                style={{ border: "1px solid var(--border-glass)", color: "var(--text-secondary)", maxWidth: "100%" }}
              >
                {q.length > 60 ? q.slice(0, 60) + "..." : q}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="glass-card-static p-3">
        <div className="flex gap-2 items-center">
          {/* Language Toggle */}
          <button
            onClick={() => setSpeechLang(speechLang === "ms-MY" ? "en-US" : "ms-MY")}
            className="px-2 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-xs font-bold"
            title={`Switch to ${speechLang === "ms-MY" ? "English" : "Bahasa Malaysia"}`}
            style={{ color: "#354761", minWidth: 38, letterSpacing: "0.04em" }}
          >
            {speechLang === "ms-MY" ? "BM" : "EN"}
          </button>
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-50 text-red-500 animate-pulse" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            ref={inputRef}
            type="text"
            className="input-glass flex-1"
            style={{ padding: "12px 16px" }}
            placeholder={isListening ? "Listening..." : "Ask about a suspicious message, call, or situation..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={typing}
          />
          <button
            type="button"
            onClick={() => {
              setIsSpeakingEnabled((prev) => {
                const next = !prev;
                if (!next && typeof window !== "undefined") {
                  window.speechSynthesis.cancel();
                }
                return next;
              });
            }}
            className={`p-3 rounded-xl transition-all ${
              isSpeakingEnabled
                ? "bg-gray-50 text-gray-500 hover:bg-gray-100"
                : "bg-[rgba(53,71,97,0.12)] text-[#354761]"
            }`}
            title={
              isSpeakingEnabled
                ? "Mute voice readout (stops current speech)"
                : "Unmute voice readout"
            }
            aria-label={
              isSpeakingEnabled ? "Mute voice readout" : "Unmute voice readout"
            }
          >
            {isSpeakingEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="btn-primary p-3"
            style={{ borderRadius: 12 }}
            onClick={() => sendMessage()}
            disabled={typing || !input.trim()}
            type="button"
            aria-label="Send message"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-[var(--text-muted)]">
              SoloFraud Autonomous Agentic AI Engine · v2.0 Stable
            </p>
          <div className="flex gap-2">
            {[
              { icon: Phone, label: "Report", tip: "997 NSRC" },
              { icon: FileText, label: "Guide", tip: "Safety tips" },
            ].map((action) => (
              <button key={action.label}
                className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                title={action.tip}>
                <action.icon size={12} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
