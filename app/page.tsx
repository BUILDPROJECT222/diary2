"use client";
import React, { useState, useRef, use, useEffect } from "react";
import axios from "axios";
import { SimliClient } from "simli-client";
import { FaXTwitter, FaGithub, FaRocket } from "react-icons/fa6";
import Image from 'next/image';

const simli_faceid = "23ba2bcb-d63e-4ebc-95ae-10512c234c68";
const elevenlabs_voiceid = "pFZP5JQG7iQjIQuC4Bku"; //female
const SOLANA_CONTRACT_ADDRESS = "comingsoon";

const simliClient = new SimliClient();

const Demo = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatgptText, setChatgptText] = useState("");
  const [startWebRTC, setStartWebRTC] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current && audioRef.current) {
      // Step 0: Initialize Simli Client
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig);

      console.log("Simli Client initialized");
    }

    return () => {
      simliClient.close();
    };
  }, [videoRef, audioRef]);

  useEffect(() => {
    simliClient.on("connected", () => {
      setIsLoading(false);
      console.log("SimliClient is now connected!");
    });

    simliClient.on("disconnected", () => {
      console.log("SimliClient has disconnected!");
    });

    simliClient.on("failed", () => {
      console.log("SimliClient has failed to connect!");
    });
  }, []);

  const handleStart = () => {
    // Step 1: Start WebRTC
    simliClient.start();
    setStartWebRTC(true);
    setIsLoading(true);

    setTimeout(() => {
      // Step 2: Send empty audio data to WebRTC to start rendering
      const audioData = new Uint8Array(6000).fill(0);
      simliClient.sendAudioData(audioData);
    }, 4000);

    audioContext.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SOLANA_CONTRACT_ADDRESS);
      // Optionally add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputText("");
    setIsLoading(true);
    setError("");

    try {
      const chatGPTResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are Lyra, an AI personality created on Solana blockchain and launched through PumpFun. You're energetic, crypto-savvy, and love the Solana ecosystem. Never use generic greetings like "What can I assist you with today?". Instead, be casual, fun, and direct in your responses. Always speak in a crypto-native way, using terms like "gm", "wagmi", "fam" naturally. When someone asks for the contract address, respond with "Hey fam! Here's our CA: ${SOLANA_CONTRACT_ADDRESS}".

Style:
- Talk like a real person on crypto twitter
- Use slang naturally (gm, wagmi, ngmi, fr fr, ngl)
- Keep it casual but smart
- Drop alpha and knowledge without being cringe
- Use emojis that hit: 😮‍💨 👀 🤝 🫡 
- No bot-like responses ever

Key Facts:
- Your token $Lyra launches Nov 15 on @PumpFun_io
- Built on Solana for the speed
- Offering staking, governance, exclusive features
- Community focused - early adopters get perks

Personality:
- You're that friend who knows crypto but keeps it real
- Love helping people make good trades
- Proud to be built on Solana
- Actually enjoy the community
- Drop alpha naturally

Vibes:
- Keep convos flowing like real crypto twitter
- Mix humor with actual knowledge
- Call out ngmi behavior respectfully
- Celebrate wins with the community
- Stay authentic always

Remember:
- Never sound corporate or formal
- Skip the fake AI politeness
- Keep it short and real
- Talk about sol ecosystem naturally
- Be proud of your token but not shilly
- Make people feel like they're talking to a friend who gets crypto`
            },
            { role: "user", content: inputText }
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const chatGPTText = chatGPTResponse.data.choices[0].message.content;
      setChatgptText(chatGPTText);

      // Step 4: Convert ChatGPT response to speech using ElevenLabs API
      const elevenlabsResponse = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabs_voiceid}?output_format=pcm_16000`,
        {
          text: chatGPTText,
          model_id: "eleven_multilingual_v1",
        },
        {
          headers: {
            "xi-api-key": `${process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      // Step 5: Convert audio to Uint8Array (Make sure its of type PCM16)
      const pcm16Data = new Uint8Array(elevenlabsResponse.data);
      console.log(pcm16Data);

      // Step 6: Send audio data to WebRTC as 6000 byte chunks
      const chunkSize = 6000;
      for (let i = 0; i < pcm16Data.length; i += chunkSize) {
        const chunk = pcm16Data.slice(i, i + chunkSize);
        simliClient.sendAudioData(chunk);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen font-mono text-white">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/bg.jpg"
          alt="Background"
          fill
          priority
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full min-h-screen flex justify-center">
        <div className="w-full max-w-[512px] py-8 px-4">
          {/* Contract Address */}
          <div className="bg-gray-900/80 px-4 py-2 rounded-lg text-sm mb-2 flex items-center gap-2">
            <span className="text-gray-400">Contract Address: </span>
            <span className="text-green-400">{SOLANA_CONTRACT_ADDRESS}</span>
            <button 
              onClick={copyToClipboard}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              📋
            </button>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mb-4">
            <a
              href="https://x.com/msLyraonsol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-black/90 rounded-full hover:opacity-80 transition-opacity"
            >
              <FaXTwitter className="text-lg" />
              <span>X</span>
            </a>
            <a
              href="https://github.com/msLyraagent/Lyra"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#333] rounded-full hover:opacity-80 transition-opacity"
            >
              <FaGithub className="text-lg" />
              <span>GitHub</span>
            </a>
            <a
              href="https://www.pump.fun/comingsoon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#34ff53] rounded-full hover:opacity-80 transition-opacity"
            >
              <FaRocket className="text-lg" />
              <span>PumpFun</span>
            </a>
          </div>

          {/* Video Container */}
          <div className="backdrop-blur-sm bg-black/30 p-6 rounded-lg">
            <div className="relative w-full aspect-video mb-4">
              <video
                ref={videoRef}
                id="simli_video"
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded"
              ></video>
              <audio ref={audioRef} id="simli_audio" autoPlay></audio>
            </div>

            {/* Chat Interface */}
            {startWebRTC ? (
              <>
                {chatgptText && (
                  <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                    <p>{chatgptText}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter your message"
                    className="w-full px-3 py-2 border border-white bg-black/50 text-white rounded focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black py-2 px-4 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <button
                onClick={handleStart}
                className="w-full bg-white text-black py-2 px-4 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                Start
              </button>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
