import React from 'react'
import {MessageSquare, ArrowRight, Sparkles} from "lucide-react"

const NoChatSelected = () => {
  return (
    <div className='w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-base-100/50 to-base-200/30'>
        <div className='max-w-md text-center space-y-6 relative'>
            
            <Sparkles className="absolute -top-5 -left-5 text-yellow-400/30 w-8 h-8 animate-pulse" />
            <Sparkles className="absolute -bottom-5 -right-5 text-primary/30 w-8 h-8 animate-pulse delay-300" />
            
            <div className='flex justify-center gap-4 mb-4'>
                <div className='relative'>
                    <div className='w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce shadow-lg'>
                        <MessageSquare className='w-8 h-8 text-primary'/>
                    </div>
                    <div className='absolute -bottom-2 -right-2 bg-primary text-primary-content rounded-full p-1'>
                        <ArrowRight className='w-4 h-4' />
                    </div>
                </div>
            </div>
            
            <h2 className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary'>
                Welcome to Vox
            </h2>
            
            <p className='text-base-content/60 mb-6'>
                Select a conversation type from the sidebar to start chatting
            </p>
            
            <div className='flex justify-center gap-2 text-xs text-base-content/40'>
                <span className='px-2 py-1 bg-base-200/50 rounded-full'>Tip: Click on a contact</span>
                <span className='px-2 py-1 bg-base-200/50 rounded-full'>Or create a group</span>
            </div>
        </div>
    </div>
  )
}

export default NoChatSelected
