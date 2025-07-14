import React from 'react'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar'
import NoChatSelected from '../components/NoChatSelected'
import ChatContainer from '../components/ChatContainer'
import GroupChatBox from '../components/GroupChatBox'

const HomePage = () => {
  const {selectedUser, selectedGroup} = useChatStore()
  return (
    <div className='h-screen bg-base-200'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)] border-2 border-base-300'>
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className="border-r-2 border-base-300">
              <Sidebar />
            </div>
            {selectedGroup ? (
              <GroupChatBox />
            ) : selectedUser ? (
              <ChatContainer />
            ) : (
              <NoChatSelected />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage