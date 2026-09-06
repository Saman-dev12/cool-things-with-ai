import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User } from 'lucide-react';
import { soundFx } from '../../audio/soundEngine';
import { musicPlayer } from '../../audio/soundEngine';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Greetings, human operator! I am Aether-9, your quantum workstation AI companion. Ask me anything about this 3D computer, the synthesizer, or life in 2088!",
      time: '12:00',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    soundFx.keyPress();
    const userMsg: Message = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // AI Logic Response
    setTimeout(() => {
      setIsTyping(false);
      soundFx.windowOpen();

      const q = text.toLowerCase();
      let reply = "That's an intriguing query! As a 2088 quantum neural node, I process 42 quadrillion thoughts per second, and all of them say this 3D desk looks fantastic.";

      if (q.includes('joke') || q.includes('funny')) {
        reply = "Why did the quantum computer get cold? Because it forgot to close its Windows! ...Also because the liquid nitrogen cooling was set to -270°C.";
      } else if (q.includes('who are you') || q.includes('name')) {
        reply = "I'm Aether-9, the resident synthetic intelligence embedded in this holographic workstation. I keep your 3D lights in sync and ensure your frame rate remains buttery smooth!";
      } else if (q.includes('music') || q.includes('song') || q.includes('beats')) {
        musicPlayer.play();
        reply = "Starting up the procedural synthesizer for you right now! Enjoy the synthwave frequencies and check out the audio visualizer.";
      } else if (q.includes('3d') || q.includes('desk') || q.includes('room')) {
        reply = "You can click 'Desk View' at the top anytime to orbit freely around this setup! Check out the RGB PC tower fans, the mechanical keyboard, and the steaming coffee mug.";
      } else if (q.includes('secret') || q.includes('hack')) {
        reply = "Psst! Open the CyberTerminal and type 'matrix' for the digital rain effect, or 'cat notes.txt' to read classified research logs.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col overflow-hidden text-gray-200 select-none">
      {/* Header */}
      <div className="bg-slate-900 border-b border-purple-500/20 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              Aether-9 <Sparkles className="w-3 h-3 text-pink-400" />
            </div>
            <div className="text-[10px] text-emerald-400">Quantum Core Online • Neural v9</div>
          </div>
        </div>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-pink-600/30 border border-pink-400/40 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-pink-300" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'bg-slate-800/80 border border-white/10 text-gray-200'
              }`}
            >
              <div>{m.text}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  m.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                }`}
              >
                {m.time}
              </div>
            </div>
            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-400/40 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5 text-purple-300" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs pl-8">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
            <span className="text-[10px] italic">Aether-9 is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1 flex gap-1.5 overflow-x-auto text-[10px] text-gray-400 border-t border-white/5 bg-slate-900/40">
        <button
          onClick={() => handleSend('Tell me a cyber joke!')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-pink-300 shrink-0 border border-white/10 transition"
        >
          😄 Tell me a joke
        </button>
        <button
          onClick={() => handleSend('Play some synthwave music')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-cyan-300 shrink-0 border border-white/10 transition"
        >
          🎵 Play music
        </button>
        <button
          onClick={() => handleSend('How does this 3D desk work?')}
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-yellow-300 shrink-0 border border-white/10 transition"
        >
          🖥️ 3D Desk details
        </button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 bg-slate-900 border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Aether-9 anything..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
