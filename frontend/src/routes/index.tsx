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
import {
  Conversation,
  Message,
  handleGetConversations,
  handleCreateConversation,
  handleGetMessages,
  handleSendMessage
} from "../services/Conversations";

type ViewType = "chat" | "friends";

type ChatMap = Record<string, MessageUI[]>;

interface MessageUI {
  id: string;
  text: string;
  sender: string;
  time: string;
  read: boolean;
}

export const Route = createFileRoute("/")({
  component: RouteComponent,
  loader: async () => {
    const validUser = await ValidateUser();
    if (!validUser)
      throw redirect({
        to: "/login",
      });
    return { user: validUser };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user: currentUser } = Route.useLoaderData();

  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMap>({});
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

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const convs = await handleGetConversations();
      const uniqueConvs = Array.from(new Map(convs.map(c => [c.id, c])).values());
      setConversations(uniqueConvs);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeChat);
    useEffect(() => {
      if (!currentUser) return;

      let ws: WebSocket | null = null;
      const timer = setTimeout(() => {
          const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
          const wsUrl = `${protocol}//localhost:8080/ws?client_id=${currentUser.client_id}`;

          ws = new WebSocket(wsUrl);

          ws.onopen = () => {
            console.log("Connected to WebSocket");
          };

          ws.onmessage = (event) => {
            try {
              const msg: Message = JSON.parse(event.data);
              const mappedMsg: MessageUI = {
                 id: msg.id,
                 text: msg.content,
                 sender: msg.sender_id === currentUser.id ? "me" : msg.sender_id,
                 time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                 read: true
              };

              setMessages(prev => {
                const chatMsgs = prev[msg.conversation_id] || [];
                 if (msg.sender_id === currentUser.id) {
                     return { ...prev, [msg.conversation_id]: [...chatMsgs, mappedMsg] };
                 }
                 return { ...prev, [msg.conversation_id]: [...chatMsgs, mappedMsg] };
              });
            } catch (e) {
              console.error("WS Message Error", e);
            }
          };

          ws.onclose = () => {
            console.log("Disconnected from WebSocket");
          };
      }, 50);

      return () => {
        clearTimeout(timer);
        if (ws) {
            ws.close();
        }
      };
    }, [currentUser]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat]);

  const fetchMessages = async (chatId: string) => {
    try {
      const msgs = await handleGetMessages(chatId);
      const mappedMessages: MessageUI[] = msgs.map(m => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === currentUser.id ? "me" : m.sender_id,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      }));

      setMessages(prev => ({
        ...prev,
        [chatId]: mappedMessages
      }));
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const onLogout = () => {
    handleLogout();
    navigate({ to: "/login" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (currentView === "chat") {
      scrollToBottom();
    }
  }, [messages, activeChat, currentView]);

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

  const handleSendMessageUI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const content = inputText;
    setInputText("");

    try {
      await handleSendMessage(activeChat, content, currentUser.client_id);
    } catch (err) {
      console.error("Failed to send message", err);
      setInputText(content);
    }
  };

  const startChatWithFriend = async (friend: Friend) => {
    try {
      let existingConv = conversations.find(c =>
        !c.is_group &&
        c.participants.some(p => p.user_id === friend.id)
      );

      if (existingConv) {
        setActiveChat(existingConv.id);
        setCurrentView("chat");
      } else {
        const newConv = await handleCreateConversation("", false, [friend.name]);
        await fetchConversations();
        setActiveChat(newConv.id);
        setCurrentView("chat");
      }
    } catch (err) {
      console.error("Error starting chat", err);
    }
  };

  const getConversationDisplay = (conv: Conversation) => {
    if (conv.is_group) {
      return {
        name: conv.name || "Group Chat",
        avatar: null,
        handle: `${conv.participants.length} members`
      };
    }

    const otherParticipant = conv.participants.find(p => p.user_id !== (currentUser as any).id);

    return {
      name: conv.name || "Chat",
      avatar: null,
      handle: conv.is_group ? "Group" : "DM"
    };
  };

  useEffect(() => {
    handleGetFriends().then(setFriends).catch(console.error);
  }, []);

  const getDisplayInfo = (conv: Conversation) => {
    if (conv.participants && conv.participants.length > 0) {
       if (conv.is_group) return { name: conv.name, isGroup: true };

       const other = conv.participants.find(p => p.user_id !== (currentUser as any).id);
       if (other) {
         const friend = friends.find(f => f.id === other.user_id);
         return { name: friend ? friend.name : "Unknown User", isGroup: false };
       }
    }
    return { name: conv.name || "Conversation", isGroup: conv.is_group };
  };

  if (currentView === "chat" && !activeChat && !friends && conversations.length === 0) return null;

  console.log("Rendering conversations:", conversations.map(c => c.id));

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-200 font-sans">
      {/* SIDEBAR */}
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
          {conversations.map((conv) => {
             const info = getDisplayInfo(conv);
             return (
            <button
              key={conv.id}
              onClick={() => {
                setActiveChat(conv.id);
                setCurrentView("chat");
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentView === "chat" && activeChat === conv.id
                  ? "bg-white/5 border-white/5"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="relative">
                {info.isGroup ? (
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                    <Hash size={18} />
                  </div>
                ) : (
                  <img
                    src={"https://github.com/shadcn.png"}
                    alt={info.name}
                    className="w-10 h-10 rounded-xl grayscale group-hover:grayscale-0 transition-all"
                  />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">
                  {info.name}
                </div>
                <div className="text-xs font-mono text-zinc-600 truncate">
                  {info.isGroup ? "Group Chat" : "DM"}
                </div>
              </div>
            </button>
          )})}
        </div>

        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3">
             {/* Current User Profile Footer */}
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
             <div className="flex-1">
               <div className="text-sm text-white font-medium">{(currentUser as any).name || "Me"}</div>
               <div className="text-[10px] text-emerald-500 font-mono">
                  Online
               </div>
             </div>
             <SettingsComponent />
          </div>
        </div>
      </aside>

      {currentView === "friends" ? (
        <main className="flex-1 flex flex-col bg-[#050505] relative animate-in fade-in duration-300 overflow-y-auto">
          <div className="flex flex-col items-center text-zinc-500 p-8 max-w-2xl mx-auto w-full">
            {/* ... Friend View Content ... */}
            <h2 className="text-2xl font-medium text-white mb-2">Friends List</h2>
             {/* Simplified for brevity in replacement, but keeping core logic */}
             <form onSubmit={handleAddFriendSubmit} className="w-full max-w-md mb-8 mt-6">
                 {/* Input ... */}
                 <div className="relative group">
                    <UserPlus className="absolute left-3 top-3 text-zinc-600 w-5 h-5" />
                    <input
                      value={friendSearchQuery}
                      onChange={(e) => setFriendSearchQuery(e.target.value)}
                      placeholder="Enter username to add..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-24 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <button type="submit" className="absolute right-2 top-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg">
                      {isAddingFriend ? <Loader2 size={16} className="animate-spin"/> : "Add"}
                    </button>
                 </div>
                 {friendSuccess && <div className="text-emerald-400 text-sm mt-2">{friendSuccess}</div>}
                 {friendError && <div className="text-red-400 text-sm mt-2">{friendError}</div>}
             </form>

             {/* Pending Requests */}
             {pendingRequests.length > 0 && (
                <div className="w-full max-w-md mb-8">
                   <h3 className="text-xs font-mono text-zinc-600 mb-2 uppercase">Requests</h3>
                   {pendingRequests.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-2">
                         <span className="text-white text-sm">{r.sender_name}</span>
                         <div className="flex gap-2">
                            <button onClick={() => handleAccept(r.id)}><Check size={18} className="text-emerald-500"/></button>
                            <button onClick={() => handleReject(r.id)}><X size={18} className="text-red-500"/></button>
                         </div>
                      </div>
                   ))}
                </div>
             )}

             {/* Friends List */}
             <div className="w-full max-w-md">
                <h3 className="text-xs font-mono text-zinc-600 mb-2 uppercase">Friends ({friends.length})</h3>
                {friends.map(f => (
                   <div key={f.id} className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-2 hover:border-zinc-700 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                        {f.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{f.name}</div>
                      </div>
                      <button
                        onClick={() => startChatWithFriend(f)}
                        className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Chat →
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </main>
      ) : activeConversation ? (
        <>
          <main className="flex-1 flex flex-col relative bg-[#050505]">
            {/* CHAT HEADER */}
            <div className="sticky top-0 z-20 px-4 pt-4 bg-[#050505]">
              <div className="h-16 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium text-white">
                    {getDisplayInfo(activeConversation).name}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                   {/* Icons */}
                   <MoreVertical size={20} />
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
              {(messages[activeChat!] || []).map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full mb-6 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
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
                onSubmit={handleSendMessageUI}
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

          {/* Right Sidebar - Simplified */}
           <aside className="w-72 bg-[#050505] border-l border-white/5 hidden xl:flex flex-col">
              <div className="p-6 flex flex-col items-center border-b border-white/5">
                 <div className="w-24 h-24 bg-zinc-900 rounded-2xl mb-4 flex items-center justify-center">
                    <Hash className="text-zinc-600"/>
                 </div>
                 <h2 className="text-lg font-medium text-white">{getDisplayInfo(activeConversation).name}</h2>
              </div>
           </aside>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500">
           Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
