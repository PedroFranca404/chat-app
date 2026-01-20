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
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
  ArrowLeft
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
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleHideConversation,
  handleLeaveConversation,
  handleUpdateConversation
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
  const wsBaseUrl = import.meta.env.VITE_WS_URL;

  const [currentView, setCurrentView] = useState<ViewType>("chat");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMap>({});
  const [inputText, setInputText] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState<string>("");
  const [isAddingFriend, setIsAddingFriend] = useState<boolean>(false);
  const [friendError, setFriendError] = useState<string>("");
  const [friendSuccess, setFriendSuccess] = useState<string>("");
  const [isLoadingFriends, setIsLoadingFriends] = useState<boolean>(false);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState<boolean>(false);
  const [groupCreationStep, setGroupCreationStep] = useState<'select-friends' | 'group-details'>('select-friends');
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);

  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState<boolean>(false);
  const [editGroupName, setEditGroupName] = useState<string>("");
  const [editGroupDesc, setEditGroupDesc] = useState<string>("");
  const [editGroupAvatar, setEditGroupAvatar] = useState<string>("");
  const [isUpdatingGroup, setIsUpdatingGroup] = useState<boolean>(false);

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
      const wsUrl = `${wsBaseUrl}?client_id=${currentUser.client_id}`;

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
            const existingIndex = chatMsgs.findIndex(m => m.id === msg.id);
            if (existingIndex !== -1) {
              const updatedMsgs = [...chatMsgs];
              updatedMsgs[existingIndex] = mappedMsg;
              return { ...prev, [msg.conversation_id]: updatedMsgs };
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
      const msgs = (await handleGetMessages(chatId)).reverse();
      const mappedMessages: MessageUI[] = msgs.map(m => ({
        id: m.id,
        text: m.content,
        sender: m.sender_id === currentUser.id ? "me" : m.sender_id,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true
      })).reverse();

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
        setIsLoadingRequests(true);
        if (friends.length === 0) setIsLoadingFriends(true);

        try {
          // Always fetch requests as they are dynamic
          const requestsList = await handleGetFriendRequests();
          setPendingRequests(requestsList);

          // Only fetch friends if we don't have them (or force refresh logic could go here)
          // We rely on the initial mount fetch for the base list.
          if (friends.length === 0) {
            const friendsList = await handleGetFriends();
            setFriends(friendsList);
          }
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

  const handleEditClick = (msg: MessageUI) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.text);
  };

  const handleDeleteClick = async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await handleDeleteMessage(messageId, currentUser.client_id);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !editingMessageId) return;

    try {
      await handleEditMessage(editingMessageId, editContent, currentUser.client_id);
      setEditingMessageId(null);
      setEditContent("");
    } catch (err) {
      console.error("Failed to edit message", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedFriendIds.size < 2) return;
    setIsCreatingGroup(true);
    try {
      // Get usernames from IDs
      const selectedFriends = friends.filter(f => selectedFriendIds.has(f.id));
      const usernames = selectedFriends.map(f => f.name);

      const newConv = await handleCreateConversation(newGroupName.trim(), true, usernames);

      setConversations(prev => [newConv, ...prev]);
      setActiveChat(newConv.id);
      setCurrentView("chat");

      // Close modal
      setIsCreateGroupModalOpen(false);
      setGroupCreationStep('select-friends');
      setSelectedFriendIds(new Set());
      setNewGroupName("");
    } catch (err) {
      console.error("Failed to create group", err);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleUpdateGroupSubmit = async () => {
    if (!activeChat || !editGroupName.trim()) return;
    setIsUpdatingGroup(true);
    try {
      const updatedConv = await handleUpdateConversation(
        activeChat,
        editGroupName.trim(),
        editGroupDesc.trim(),
        editGroupAvatar.trim()
      );

      setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
      setIsEditGroupModalOpen(false);
    } catch (err) {
      console.error("Failed to update group", err);
      alert("Failed to update group. Please try again.");
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    const newSelected = new Set(selectedFriendIds);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriendIds(newSelected);
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
        if (other.user?.name) return { name: other.user.name, isGroup: false };
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
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${currentView === "friends"
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
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[10px] font-mono uppercase text-zinc-600 tracking-widest">
              Conversations
            </h3>
            <button
              onClick={() => {
                setIsCreateGroupModalOpen(true);
                setGroupCreationStep('select-friends');
                setSelectedFriendIds(new Set());
                setNewGroupName("");
              }}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {conversations.map((conv) => {
            const info = getDisplayInfo(conv);
            return (
              <div key={conv.id} className="relative group/item">
                <button
                  onClick={() => {
                    setActiveChat(conv.id);
                    setCurrentView("chat");
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === "chat" && activeChat === conv.id
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
                    <div className="text-sm font-medium text-white truncate w-32">
                      {info.name}
                    </div>
                    <div className="text-xs font-mono text-zinc-600 truncate">
                      {info.isGroup ? "Group Chat" : "DM"}
                    </div>
                  </div>
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (conv.is_group) {
                       if (window.confirm("Are you sure you want to LEAVE this group? This action cannot be undone.")) {
                          try {
                             await handleLeaveConversation(conv.id);
                             setConversations(prev => prev.filter(c => c.id !== conv.id));
                             if (activeChat === conv.id) setActiveChat(null);
                          } catch (err) {
                             console.error("Failed to leave group", err);
                             alert("Failed to leave group. Please try again.");
                          }
                       }
                    } else {
                       if (window.confirm("Are you sure you want to hide this conversation?")) {
                         try {
                           await handleHideConversation(conv.id);
                           setConversations(prev => prev.filter(c => c.id !== conv.id));
                           if (activeChat === conv.id) setActiveChat(null);
                         } catch (err) {
                           console.error("Failed to hide conversation", err);
                         }
                       }
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all z-10"
                  title={conv.is_group ? "Leave Group" : "Hide Conversation"}
                >
                  {conv.is_group ? <LogOut size={14} /> : <X size={14} />}
                </button>
              </div>
            )
          })}
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
                  {isAddingFriend ? <Loader2 size={16} className="animate-spin" /> : "Add"}
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
                      <button onClick={() => handleAccept(r.id)}><Check size={18} className="text-emerald-500" /></button>
                      <button onClick={() => handleReject(r.id)}><X size={18} className="text-red-500" /></button>
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
              {(messages[activeChat!] || []).map((msg, i) => {
                const isMe = msg.sender === "me";
                const prevMsg = i > 0 ? messages[activeChat!][i - 1] : null;
                const nextMsg = i < messages[activeChat!].length - 1 ? messages[activeChat!][i + 1] : null;

                const isFirstInSeq = !prevMsg || prevMsg.sender !== msg.sender;
                const isLastInSeq = !nextMsg || nextMsg.sender !== msg.sender;

                if ((msg as any).type === 'system') {
                    return (
                        <div key={msg.id} className="w-full flex justify-center my-4">
                            <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-full border border-zinc-800">
                                {msg.content}
                            </span>
                        </div>
                    );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${isLastInSeq ? "mb-6" : "mb-1"} ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && activeConversation?.is_group && isFirstInSeq && (() => {
                        const senderId = msg.sender;
                        const sender = activeConversation.participants?.find(p => p.user_id === senderId)?.user;
                        return (
                          <div className="flex items-center gap-2 mb-1 ml-1 mt-2">
                            <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden bg-zinc-800 border border-zinc-700">
                              {sender?.avatar_url ? (
                                <img src={sender.avatar_url} alt={sender.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px] font-medium text-indigo-400">
                                  {sender?.name?.[0]?.toUpperCase() || "?"}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500 font-medium">{sender?.name || "Unknown"}</span>
                          </div>
                        );
                      })()}
                      <div
                        className={`px-6 py-3.5 rounded-2xl text-sm ${isMe
                          ? "bg-zinc-800/50 border border-indigo-500/20 text-indigo-50 " + (isFirstInSeq ? "rounded-tr-2xl" : "rounded-tr-md") + " " + (isLastInSeq ? "rounded-br-2xl" : "rounded-br-md")
                          : "bg-zinc-900 border border-zinc-800 text-zinc-300 " + (isFirstInSeq ? "rounded-tl-2xl" : "rounded-tl-md") + " " + (isLastInSeq ? "rounded-bl-2xl" : "rounded-bl-md")
                          }`}
                      >
                        {editingMessageId === msg.id ? (
                          <form onSubmit={handleUpdateMessage} className="flex flex-col gap-2 min-w-[200px]">
                            <input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-zinc-200 w-full"
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={handleCancelEdit} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
                              <button type="submit" className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                            </div>
                          </form>
                        ) : (
                          <div className="relative group/bubble">
                            {msg.text}
                            {isMe && msg.text !== "Message Erased" && (
                              <div className="absolute -right-6 top-0 hidden group-hover/bubble:flex flex-col gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1 shadow-lg z-10">
                                <button
                                  onClick={() => handleEditClick(msg)}
                                  className="text-zinc-500 hover:text-indigo-400 p-1 rounded"
                                  title="Edit"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(msg.id)}
                                  className="text-zinc-500 hover:text-red-400 p-1 rounded"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {isLastInSeq && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-zinc-600">
                            {msg.time}
                          </span>
                        </div>
                      )}
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

          {/* Right Sidebar */}
          <aside className="w-72 bg-[#050505] border-l border-white/5 hidden xl:flex flex-col">
            <div className="p-6 flex flex-col items-center border-b border-white/5 relative group/sidebar">
               {/* Edit Button for Admins */}
               {activeConversation && activeConversation.is_group &&
                activeConversation.participants?.find(p => p.user_id === (currentUser as any).id)?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setEditGroupName(activeConversation.name);
                      setEditGroupDesc(activeConversation.description || "");
                      setEditGroupAvatar(activeConversation.avatar_url || "");
                      setIsEditGroupModalOpen(true);
                    }}
                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    title="Edit Group"
                  >
                    <Edit2 size={16} />
                  </button>
               )}

              <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center overflow-hidden bg-zinc-900 border border-zinc-800">
                 {activeConversation && activeConversation.avatar_url ? (
                    <img src={activeConversation.avatar_url} alt={activeConversation.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800/50">
                       {activeConversation?.name ? (
                          <span className="text-3xl font-bold text-zinc-500">{activeConversation.name[0].toUpperCase()}</span>
                       ) : <Hash className="text-zinc-600" size={32} />}
                    </div>
                 )}
              </div>
              <h2 className="text-lg font-medium text-white text-center">{getDisplayInfo(activeConversation).name}</h2>
              {activeConversation?.description && (
                <p className="text-sm text-zinc-500 text-center mt-2 px-2">{activeConversation.description}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
               <h3 className="text-xs font-mono text-zinc-600 uppercase mb-4 px-2">
                 Members ({activeConversation?.participants?.length || 0})
               </h3>
               <div className="space-y-2">
                 {activeConversation?.participants?.map(p => (
                   <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        {p.user?.avatar_url ? (
                          <img src={p.user.avatar_url} className="w-full h-full rounded-full" />
                        ) : (
                           <span className="text-xs font-medium text-indigo-400">
                             {p.user?.name?.[0].toUpperCase() || "?"}
                           </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium flex items-center gap-2">
                          {p.user?.name || "Unknown"}
                          {p.role === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </aside>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          Select a conversation to start chatting
        </div>
      )}
      {/* Group Creation Modal */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                {groupCreationStep === 'select-friends' ? "New Group Chat" : "Group Details"}
              </h3>
              <button
                onClick={() => setIsCreateGroupModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {groupCreationStep === 'select-friends' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                    <input
                      placeholder="Search friends..."
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-zinc-500 uppercase px-1 mb-2">Friends</div>
                     {friends.map(friend => {
                       const isSelected = selectedFriendIds.has(friend.id);
                       return (
                         <div
                           key={friend.id}
                           onClick={() => toggleFriendSelection(friend.id)}
                           className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                             isSelected
                               ? "bg-indigo-500/10 border-indigo-500/50"
                               : "bg-zinc-800/20 border-transparent hover:bg-zinc-800/50"
                           }`}
                         >
                           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                             {friend.name[0].toUpperCase()}
                           </div>
                           <div className="flex-1 text-sm font-medium text-white">
                             {friend.name}
                           </div>
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                             isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                           }`}>
                             {isSelected && <Check size={12} className="text-white" />}
                           </div>
                         </div>
                       )
                     })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      {newGroupName ? (
                        <span className="text-2xl font-bold text-white max-w-full truncate px-2">
                           {newGroupName[0].toUpperCase()}
                        </span>
                      ) : (
                        <Users size={32} className="text-zinc-600" />
                      )}
                    </div>
                    <div className="text-sm text-zinc-500">Group Avatar</div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Group Name</label>
                    <input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Project Team"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                      autoFocus
                    />
                  </div>

                  <div className="bg-zinc-800/30 rounded-xl p-3 border border-white/5">
                    <div className="text-xs font-mono text-zinc-500 uppercase mb-2">Members ({selectedFriendIds.size})</div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedFriendIds).map(id => {
                        const f = friends.find(friend => friend.id === id);
                        if (!f) return null;
                        return (
                          <span key={id} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
                            {f.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
              {groupCreationStep === 'select-friends' ? (
                <>
                  <button
                    onClick={() => setIsCreateGroupModalOpen(false)}
                    className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                   <button
                    onClick={() => setGroupCreationStep('group-details')}
                    disabled={selectedFriendIds.size < 2}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </>
              ) : (
                 <>
                  <button
                    onClick={() => setGroupCreationStep('select-friends')}
                    className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                   <ArrowLeft size={14} /> Back
                  </button>
                   <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || isCreatingGroup}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                  >
                    {isCreatingGroup ? <Loader2 size={14} className="animate-spin" /> : "Create Group"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Group Modal */}
      {isEditGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Edit Group Details</h3>
              <button
                onClick={() => setIsEditGroupModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-mono text-zinc-500 uppercase">Group Name</label>
                 <input
                   value={editGroupName}
                   onChange={(e) => setEditGroupName(e.target.value)}
                   className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-mono text-zinc-500 uppercase">Description</label>
                 <textarea
                   value={editGroupDesc}
                   onChange={(e) => setEditGroupDesc(e.target.value)}
                   className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                   placeholder="Add a group description..."
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-mono text-zinc-500 uppercase">Avatar URL</label>
                 <input
                   value={editGroupAvatar}
                   onChange={(e) => setEditGroupAvatar(e.target.value)}
                   placeholder="https://example.com/image.png"
                   className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                 />
               </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditGroupModalOpen(false)}
                className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroupSubmit}
                disabled={isUpdatingGroup || !editGroupName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
              >
                {isUpdatingGroup ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
