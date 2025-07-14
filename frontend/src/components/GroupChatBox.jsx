import React, { useEffect, useState, useRef } from "react"
import GroupSettings from "./GroupSettings"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"
import GroupMessageInput from "./skeleton/GroupMessageInput"
import ImportantMessageWrapper from "./ImportantMessage/ImportantMessageWrapper"
import GroupIdentityForm from "./skeleton/GroupIdentityForm"
import GroupChatSkeleton from "./skeleton/Groupskeleton"

const GroupChatBox = () => {
  const {
    messages,
    selectedGroup,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    setSelectedGroup,
    isLoading,
    isMessagesLoading,
  } = useChatStore()

  const { authUser } = useAuthStore()
  const [showSettings, setShowSettings] = useState(false)
  const scrollRef = useRef(null)
  const containerRef = useRef(null)
  const [isNearBottom, setIsNearBottom] = useState(true)

  const currentMember = selectedGroup?.members?.find(
    (m) => String(m.user?._id || m.user) === String(authUser._id)
  )
  const hasIdentity = currentMember?.displayName && currentMember?.userId
  const currentRole = currentMember?.role || "Member"

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsNearBottom(nearBottom)
  }

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id)
      subscribeToGroupMessages()
      return () => unsubscribeFromGroupMessages()
    }
  }, [selectedGroup?._id])

  useEffect(() => {
    setShowSettings(false)
  }, [selectedGroup?._id])

  useEffect(() => {
    if (isNearBottom && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (!selectedGroup) return null
  if (!hasIdentity) return <GroupIdentityForm groupId={selectedGroup._id} />

  const isImportantMessage = (msg) => {
    const type = msg?.messageType?.toLowerCase()
    return type === "strictreply" || type === "shouldreply"
  }

  const renderNormalMessage = (message) => {
    const sender = message?.sender
    if (!sender) return null

    const member = selectedGroup?.members?.find(m => 
      String(m.user?._id || m.user) === String(sender._id || sender)
    )
    const displayName = member?.displayName || sender.displayName || "Member"

    return (
      <div
        key={message._id}
        className={`chat ${
          String(sender._id || sender) === String(authUser._id)
            ? "chat-end"
            : "chat-start"
        }`}
      >
        <div className="chat-image avatar">
          <div className="size-10 rounded-full border">
            <img
              src={sender.profilePic || "/avatar.jpg"}
              alt="profile pic"
              onError={(e) => {
                e.target.src = "/avatar.jpg"
              }}
            />
          </div>
        </div>

        <div className="chat-header mb-1 font-semibold text-sm">
          {displayName}
          <time className="text-xs opacity-50 ml-2">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>

        <div className="chat-bubble flex flex-col">
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-md mb-2"
              onError={(e) => {
                e.target.style.display = "none"
              }}
            />
          )}
          {message.text && <p>{message.text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col p-4 relative">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-lg font-bold">
            {selectedGroup.name}
          </div>
          <div className="text-sm text-zinc-400">
            Group Chat • Role: {currentRole}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="btn btn-sm btn-outline"
            disabled={isLoading}
          >
            ⚙️ Settings
          </button>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={() => setSelectedGroup(null)}
            title="Close Group Chat"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
      </div>

      {isLoading ? (
        <GroupChatSkeleton />
      ) : showSettings ? (
        <>
          <GroupSettings />
          <button
            className="mt-4 btn btn-sm"
            onClick={() => setShowSettings(false)}
          >
            Close Settings
          </button>
        </>
      ) : (
        <>
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto space-y-2"
          >
            {isMessagesLoading && messages.length === 0 ? (
              <GroupChatSkeleton />
            ) : (
              <>
                {messages.map((message) =>
                  isImportantMessage(message) ? (
                    <ImportantMessageWrapper
                      key={`${message._id}-${message.updatedAt || message.createdAt}`}
                      messageData={message}
                      fallbackRenderer={() => renderNormalMessage(message)}
                    />
                  ) : (
                    renderNormalMessage(message)
                  )
                )}
                <div ref={scrollRef} />
              </>
            )}
          </div>
          <GroupMessageInput />
        </>
      )}
    </div>
  )
}

export default GroupChatBox