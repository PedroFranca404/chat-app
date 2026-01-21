import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
import { handleLogout, ValidateUser } from "../services/Auth";
import { handleGetFriends, handleSendFriendRequest, handleGetFriendRequests, handleAcceptFriendRequest, handleRejectFriendRequest, Friend, FriendRequest } from "../services/Friends";
import {
  Conversation,
  handleCreateConversation,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  handleUpdateConversation
} from "../services/Conversations";
import { ViewType, ChatMap } from "./chat/types";
import { useWebSocket } from "./chat/hooks/useWebSocket";
import { useFetchConversations, useFetchMessages } from "./chat/hooks/useConversations";
import { useInitialFriends } from "./chat/hooks/useFriends";
import { Sidebar } from "./chat/components/Sidebar";
import { ChatHeader } from "./chat/components/ChatHeader";
import { MessageList } from "./chat/components/MessageList";
import { MessageInput } from "./chat/components/MessageInput";
import { FriendsView } from "./chat/components/FriendsView";
import { GroupCreationModal } from "./chat/components/GroupCreationModal";
import { GroupEditModal } from "./chat/components/GroupEditModal";
import { RightSidebar } from "./chat/components/RightSidebar";

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
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

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

  const { fetchConversations } = useFetchConversations(setConversations);
  useFetchMessages(activeChat, currentUser, setMessages);
  useWebSocket({ currentUser, wsBaseUrl, setMessages });
  useInitialFriends(setFriends);

  const activeConversation = conversations.find(c => c.id === activeChat);

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

  const handleEditClick = (msg: any) => {
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

  const handleOpenCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true);
    setGroupCreationStep('select-friends');
    setSelectedFriendIds(new Set());
    setNewGroupName("");
  };

  const handleOpenEditGroupModal = () => {
    if (activeConversation) {
      setEditGroupName(activeConversation.name);
      setEditGroupDesc(activeConversation.description || "");
      setEditGroupAvatar(activeConversation.avatar_url || "");
      setIsEditGroupModalOpen(true);
    }
  };

  if (currentView === "chat" && !activeChat && !friends && conversations.length === 0) return null;

  console.log("Rendering conversations:", conversations.map(c => c.id));

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-200 font-sans">
      <Sidebar
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        conversations={conversations}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        friends={friends}
        onLogout={onLogout}
        onCreateGroup={handleOpenCreateGroupModal}
        setConversations={setConversations}
      />

      {currentView === "friends" ? (
        <FriendsView
          friendSearchQuery={friendSearchQuery}
          setFriendSearchQuery={setFriendSearchQuery}
          isAddingFriend={isAddingFriend}
          friendError={friendError}
          friendSuccess={friendSuccess}
          pendingRequests={pendingRequests}
          friends={friends}
          onAddFriendSubmit={handleAddFriendSubmit}
          onAcceptRequest={handleAccept}
          onRejectRequest={handleReject}
          onStartChat={startChatWithFriend}
        />
      ) : activeConversation ? (
        <>
          <main className="flex-1 flex flex-col relative bg-[#050505]">
            <ChatHeader
              activeConversation={activeConversation}
              currentUser={currentUser}
              friends={friends}
            />

            <MessageList
              messages={messages[activeChat!] || []}
              activeConversation={activeConversation}
              currentUser={currentUser}
              editingMessageId={editingMessageId}
              editContent={editContent}
              setEditContent={setEditContent}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onUpdateMessage={handleUpdateMessage}
              onCancelEdit={handleCancelEdit}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={handleSendMessageUI}
            />
          </main>

          <RightSidebar
            activeConversation={activeConversation}
            currentUser={currentUser}
            friends={friends}
            onEditGroup={handleOpenEditGroupModal}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          Select a conversation to start chatting
        </div>
      )}

      <GroupCreationModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        friends={friends}
        groupCreationStep={groupCreationStep}
        setGroupCreationStep={setGroupCreationStep}
        selectedFriendIds={selectedFriendIds}
        toggleFriendSelection={toggleFriendSelection}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        isCreatingGroup={isCreatingGroup}
        onCreateGroup={handleCreateGroup}
      />

      <GroupEditModal
        isOpen={isEditGroupModalOpen}
        onClose={() => setIsEditGroupModalOpen(false)}
        editGroupName={editGroupName}
        setEditGroupName={setEditGroupName}
        editGroupDesc={editGroupDesc}
        setEditGroupDesc={setEditGroupDesc}
        editGroupAvatar={editGroupAvatar}
        setEditGroupAvatar={setEditGroupAvatar}
        isUpdatingGroup={isUpdatingGroup}
        onUpdateGroup={handleUpdateGroupSubmit}
      />
    </div>
  );
}
