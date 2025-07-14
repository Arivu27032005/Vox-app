import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './skeleton/ChatHeader'
import MessageInput from './skeleton/MessageInput'
import { useAuthStore } from '../store/useAuthStore'
import MessageSkeleton from './skeleton/MessageSkeleton'
import { formatMessageTime } from '../lib/utilis'

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    setSelectedUser,
    unsubscribeFromMessages,
    subscribeToMessages,
    selectedGroup,
    setSelectedGroup
  } = useChatStore()
  
  const { authUser } = useAuthStore()
  const messageEndRef = useRef(null)

  // Close group chat when personal chat opens
  useEffect(() => {
    if (selectedUser && selectedGroup) {
      setSelectedGroup(null)
    }
  }, [selectedUser])

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id)
      subscribeToMessages()
      return () => unsubscribeFromMessages()
    }
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  if (!selectedUser) return null

  if (isMessagesLoading) return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <ChatHeader/>
      <MessageSkeleton/>
      <MessageInput/>
    </div>
  )

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader/>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div 
            key={message._id}
            className={`chat ${String(message.senderId) === String(authUser._id) ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img 
                  src={
                    message.senderId === authUser._id 
                      ? authUser.profilePic || "/avatar.jpg"
                      : selectedUser.profilePic || "/avatar.jpg"
                  } 
                  alt="profile pic" 
                  onError={(e) => {
                    e.target.src = "/avatar.jpg"
                  }}
                />
              </div>
            </div>
            <div className='chat-header flex items-center gap-2 mb-1'>
              <span className='font-medium text-sm'>
                {String(message.senderId) === String(authUser._id)
                  ? authUser.fullname || "You"
                  : selectedUser.fullname || "User"
                }
              </span>
              <time className='text-xs opacity-50'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className='chat-bubble flex flex-col'>
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Attachment" 
                  className='sm:max-w-[200px] rounded-md mb-2' 
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput/>
    </div>
  )
}

export default ChatContainer