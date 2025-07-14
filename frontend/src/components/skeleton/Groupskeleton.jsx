import React from 'react'

const GroupMessageSkeleton = () => {
    const skeletonMessages = Array(6).fill(null)
    
    return (
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {skeletonMessages.map((_, idx) => {
                // Alternate between different message types
                const isCurrentUser = idx % 2 === 1;
                const isImportant = idx % 3 === 0;
                const hasImage = idx % 4 === 0;
                
                return (
                    <div key={idx} className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}>
                        {/* Avatar */}
                        <div className='chat-image avatar'>
                            <div className='size-10 rounded-full'>
                                <div className='skeleton w-full h-full rounded-full'/>
                            </div>
                        </div>
                        
                        {/* Sender name and role */}
                        <div className='chat-header mb-1 flex items-center gap-2'>
                            <div className='skeleton h-4 w-16'/>
                            {!isCurrentUser && (
                                <div className='skeleton h-3 w-8 rounded-full'/>
                            )}
                        </div>
                        
                        {/* Message bubble - different types */}
                        <div className={`chat-bubble bg-transparent p-0 ${
                            isImportant ? 'border-l-4 border-warning' : ''
                        }`}>
                            {hasImage ? (
                                <div className='skeleton h-32 w-[200px] rounded-md'/>
                            ) : (
                                <div className='skeleton h-16 w-[200px]'/>
                            )}
                        </div>
                        
                        {/* Message status/time */}
                        <div className='chat-footer'>
                            <div className='skeleton h-3 w-12'/>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default GroupMessageSkeleton