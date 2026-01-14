import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Hash,
  Search,
  CheckCheck,
  LogOut,
  Code,
  Users,
  Heart,
  CircleUserRound,
  MoreVertical,
  UserPlus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { handleLogout, ValidateUser } from "../services/Auth";
import { SettingsComponent } from "../components/settings";
import { handleGetFriends, handleSendFriendRequest, handleGetFriendRequests, handleAcceptFriendRequest, handleRejectFriendRequest, Friend, FriendRequest } from "../services/Friends";

type UserStatus = "online" | "busy" | "offline" | string;
type ViewType = "chat" | "friends";

interface User {
  id: number;
  name: string;
  handle: string;
  status: UserStatus;
  avatar: string | null;
  isGroup?: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  time: string;
  read: boolean;
}

type ChatMap = Record<number, Message[]>;

const USERS: User[] = [
  {
    id: 1,
    name: "Mock User 1",
    handle: "@mock1",
    status: "online",
    avatar: "assets/images/profile_pic_1.jpg",
  },
];

const MOCK_CHATS: ChatMap = {
  1: [
    {
      id: 1,
      text: "Msg 1",
      sender: "1",
      time: "10:23 AM",
      read: true,
    },
    {
      id: 2,
      text: "Msg 2",
      sender: "me",
      time: "10:24 AM",
      read: true,
    },
    {
      id: 3,
      text: "Msg 3",
      sender: "1",
      time: "10:45 AM",
      read: true,
    },
  ],
};

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const validUser = await ValidateUser();
    if (!validUser)
      throw redirect({
        to: "/login",
      });
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [activeChat, setActiveChat] = useState<number>(1);
  const [messages, setMessages] = useState<ChatMap>(MOCK_CHATS);
  const [inputText, setInputText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState<string>("");
  const [isAddingFriend, setIsAddingFriend] = useState<boolean>(false);
  const [friendError, setFriendError] = useState<string>("");
  const [friendSuccess, setFriendSuccess] = useState<string>("");
  const [isLoadingFriends, setIsLoadingFriends] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  const onLogout = () => {
    handleLogout();
    navigate({ to: "/login" });
  };

  const activeUser = USERS.find((u) => u.id === activeChat);
  const currentMessages = messages[activeChat] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentView === "chat") {
      scrollToBottom();
    }
  }, [currentMessages, activeChat, currentView]);

  useEffect(() => {
    if (currentView === "friends") {
      const loadFriendsData = async () => {
        setIsLoadingFriends(true);
        setIsLoadingRequests(true);
        try {
          const [friendsList, requestsList] = await Promise.all([
            handleGetFriends(),
            handleGetFriendRequests(),
          ]);
          setFriends(friendsList);
          setPendingRequests(requestsList);
        } catch (err) {
          console.error("Failed to load friends data:", err);
        } finally {
          setIsLoadingFriends(false);
          setIsLoadingRequests(false);
        }
      };
      loadFriendsData();
    }
  }, [currentView]);

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearchQuery.trim()) return;

    setIsAddingFriend(true);
    setFriendError("");
    setFriendSuccess("");

    try {
      await handleSendFriendRequest(friendSearchQuery.trim());
      setFriendSuccess(`Friend request sent to ${friendSearchQuery.trim()}!`);
      setFriendSearchQuery("");
    } catch (err: any) {
      setFriendError(err.message || "Failed to send friend request");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await handleAcceptFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      const friendsList = await handleGetFriends();
      setFriends(friendsList);
    } catch (err: any) {
      setFriendError(err.message || "Failed to accept request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await handleRejectFriendRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      setFriendError(err.message || "Failed to reject request");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMessage],
    }));
    setInputText("");
  };

  if (currentView === "chat" && !activeUser) return null;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-200 font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-80 flex flex-col border-r border-white/5 bg-zinc-900/20 backdrop-blur-md relative z-50">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Code size={16} />
            </div>
            <span className="font-semibold tracking-tight text-white">
              Chat App
            </span>
          </div>
          <button
            onClick={onLogout}
            className="text-zinc-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="px-5 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-zinc-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-hidden focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>

        <div className="px-3 mb-2">
          <button
            onClick={() => setCurrentView("friends")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
              currentView === "friends"
                ? "bg-white/5 border border-white/5"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 transition-colors group-hover:border-indigo-500/50">
              <Users size={18} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">Friends</div>
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <h3 className="text-[10px] font-mono uppercase text-zinc-600 px-3 mb-2 tracking-widest">
            Direct Messages
          </h3>
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                setActiveChat(user.id);
                setCurrentView("chat");
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentView === "chat" && activeChat === user.id
                  ? "bg-white/5 border-white/5"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="relative">
                {user.isGroup ? (
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                    <Hash size={18} />
                  </div>
                ) : (
                  <img
                    src={user.avatar || ""}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl grayscale group-hover:grayscale-0 transition-all"
                  />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">
                  {user.name}
                </div>
                <div className="text-xs font-mono text-zinc-600 truncate">
                  {user.handle}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-indigo-500 to-purple-500 border border-white/10" />
            <div className="flex-1">
              <div className="text-sm text-white font-medium">My username</div>
              <div className="text-[10px] text-emerald-500 font-mono">
              <button
                className="w-full flex items-center gap-2 py-0 rounded-lg text-sm transition text-zinc-300 cursor-default"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-emerald-500`}
                />
                <span className="flex-1 text-left text-[10px] font-mono">Online</span>
              </button>

              </div>
            </div>
            <SettingsComponent />
          </div>
        </div>
      </aside>

      {currentView === "friends" ? (
        <main className="flex-1 flex flex-col bg-[#050505] relative animate-in fade-in duration-300 overflow-y-auto">
          <div className="flex flex-col items-center text-zinc-500 p-8 max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <Users size={40} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-2">
              Friends List
            </h2>
            <p className="max-w-md text-center text-sm mb-8">
              Here you can manage your friends, see pending requests, or find
              new people to connect with.
            </p>

            {/* Search / Add Friend Box */}
            <form onSubmit={handleAddFriendSubmit} className="w-full max-w-md mb-8">
              <div className="relative group">
                <UserPlus className="absolute left-3 top-3 text-zinc-600 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter username to add..."
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-24 text-sm focus:outline-none focus:border-indigo-500/50 transition-all text-white placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={isAddingFriend || !friendSearchQuery.trim()}
                  className="absolute right-2 top-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isAddingFriend ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Add
                    </>
                  )}
                </button>
              </div>
              {/* Error / Success Messages */}
              {friendError && (
                <div className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <X size={14} />
                  {friendError}
                </div>
              )}
              {friendSuccess && (
                <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                  <Check size={14} />
                  {friendSuccess}
                </div>
              )}
            </form>

            {/* Pending Friend Requests */}
            {pendingRequests.length > 0 && (
              <div className="w-full max-w-md mb-8">
                <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-3 tracking-widest">
                  Friend Requests ({pendingRequests.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {request.sender_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          {request.sender_name}
                        </div>
                        <div className="text-xs text-zinc-600 font-mono">
                          wants to be friends
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          title="Accept"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-2 rounded-lg bg-zinc-700 hover:bg-red-600 text-white transition-colors"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="w-full max-w-md">
              <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-3 tracking-widest">
                Your Friends ({friends.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {isLoadingFriends ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-24 bg-zinc-800 rounded-full animate-pulse" />
                        <div className="h-2 w-16 bg-zinc-800/50 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No friends yet</p>
                    <p className="text-xs mt-1">Add someone using the search box above!</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {friend.name}
                        </div>
                        <div className="text-xs text-zinc-600 font-mono">
                          @{friend.name.toLowerCase().replace(/\s+/g, "")}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-zinc-500">Chat →</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      ) : activeUser ? (
        <>
          <main className="flex-1 flex flex-col relative bg-[#050505]">
            {/* CHAT HEADER */}
            <div className="sticky top-0 z-20 px-4 pt-4 bg-[#050505]">
              <div className="h-16 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium text-white">
                    {activeUser.name}
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-zinc-400">
                    {activeUser.isGroup ? "GROUP" : "DM"}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-zinc-400">
                  <Heart className="w-5 h-5 hover:text-indigo-400 cursor-pointer transition-colors" />
                  <CircleUserRound className="w-5 h-5 hover:text-indigo-400 cursor-pointer transition-colors" />
                  <MoreVertical className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
              {currentMessages.map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full mb-6 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-6 py-3.5 rounded-2xl text-sm ${
                          isMe
                            ? "bg-zinc-800/50 border border-indigo-500/20 text-indigo-50"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-300"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-zinc-600">
                          {msg.time}
                        </span>
                        {isMe && (
                          <CheckCheck
                            size={12}
                            className={
                              msg.read ? "text-emerald-500" : "text-zinc-600"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-white/5 bg-[#050505]">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 px-4"
              >
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-hidden text-zinc-200 h-8"
                  placeholder="Write a message..."
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 text-white rounded-xl"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="w-72 bg-[#050505] border-l border-white/5 hidden xl:flex flex-col">
            <div className="p-6 flex flex-col items-center border-b border-white/5">
              <div className="w-24 h-24 rounded-2xl p-1 border border-white/10 mb-4 bg-zinc-900/50">
                {activeUser.isGroup ? (
                  <div className="w-full h-full bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Hash className="text-zinc-500" />
                  </div>
                ) : (
                  <img
                    src={activeUser.avatar!}
                    className="w-full h-full rounded-xl object-cover grayscale"
                    alt="profile"
                  />
                )}
              </div>
              <h2 className="text-lg font-medium text-white">
                {activeUser.name}
              </h2>
              <p className="text-sm font-mono text-zinc-500 mt-1">
                {activeUser.handle}
              </p>

              <div className="flex gap-4 mt-6 w-full">
                <button className="flex-1 py-2 bg-blackred hover:bg-darkred border border-red-900 rounded-lg text-xs font-mono text-zinc-300 transition-colors">
                  BLOCK
                </button>
                <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-zinc-300 transition-colors">
                  MUTE
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
              {/* Properties */}
              <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-4 tracking-widest">
                Properties
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-zinc-500">User ID</span>
                  <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                    #{activeUser.id * 8392}
                  </span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm text-zinc-500">Status</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-sm border border-white/5 ${activeUser.status === "online" ? "text-emerald-400 bg-emerald-400/10" : activeUser.status === "busy" ? "text-amber-400 bg-amber-400/10" : "text-zinc-400 bg-zinc-800"}`}
                  >
                    {activeUser.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Joined</span>
                  <span className="text-xs font-mono text-zinc-300">
                    Oct 24, 2025
                  </span>
                </div>
              </div>

              {/* Activity Map */}
              <h3 className="text-[10px] font-mono uppercase text-zinc-600 mt-10 mb-4 tracking-widest">
                Activity Map
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(35)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xs ${Math.random() > 0.7 ? "bg-indigo-500/40 shadow-[0_0_5px_rgba(99,102,241,0.2)]" : "bg-zinc-800/50"}`}
                  />
                ))}
              </div>

              {/* Shared Media */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-mono uppercase text-zinc-600 mb-3 tracking-widest">
                  Shared Media
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-zinc-900 rounded-lg border border-white/5 hover:border-white/20 transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
