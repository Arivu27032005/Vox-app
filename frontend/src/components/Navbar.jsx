import React from 'react'
import {Link} from 'react-router-dom'
import {LogOut, MessageSquare, User} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const Navbar = () => {
  const {logout, authUser} = useAuthStore()
  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  return (
    <header className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 backdrop-blur-md bg-opacity-90 shadow-sm'>
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          <div className='flex items-center gap-8'>
            <Link to="/" className='flex items-center gap-2.5 hover:opacity-80 transition-all group'>
              <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                <MessageSquare className="w-5 h-5 text-primary"/>
              </div>
              <h1 className='text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary'>
                Vox
              </h1>
            </Link>
          </div>
          
          <div className='flex items-center gap-2'>
            {authUser && (
              <>
                <Link 
                  to={'/profile'} 
                  className={`btn btn-sm gap-2 btn-ghost hover:bg-base-300/50`}
                >
                  <User className='size-5'/>
                  <span className='hidden sm:inline'>Profile</span>
                </Link>
                <button 
                  className='btn btn-sm gap-2 btn-ghost hover:bg-error/10 text-error hover:text-error'
                  onClick={handleLogout}
                >
                  <LogOut className='size-5'/>
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar