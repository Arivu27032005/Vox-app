import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, User, Mail, Calendar, CheckCircle, X } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(null)
  const navigate = useNavigate()

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate image size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB')
      return
    }

    // Validate image type
    if (!file.type.match('image.*')) {
      alert('Please select a valid image file (JPEG, PNG, etc.)')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = async () => {
      const base64Image = reader.result
      setSelectedImg(base64Image)
      try {
        await updateProfile({ profilePic: base64Image })
      } catch (error) {
        alert('Failed to update profile picture. Please try again.')
        console.error('Profile update error:', error)
      }
    }
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleClose = () => {
    navigate(-1)
  }

  return (
    <div className='min-h-screen pt-20 bg-base-100'>
      <div className='max-w-2xl mx-auto p-4'>
        <div className='bg-base-200 rounded-xl p-6 space-y-8 shadow-lg relative'>
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className='absolute top-4 right-4 p-1 rounded-full hover:bg-base-300 transition-colors'
            aria-label='Close profile'
            disabled={isUpdatingProfile}
          >
            <X className='w-5 h-5' />
          </button>

          {/* Header Section */}
          <div className='text-center pt-2'>
            <h1 className='text-2xl font-bold text-primary'>Profile Settings</h1>
            <p className='mt-2 text-base-content/80'>Manage your account information</p>
          </div>

          {/* Profile Picture Section */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative group'>
              <img
                src={selectedImg || authUser.profilePic || '/avatar.png'}
                alt='Profile'
                className='size-32 rounded-full object-cover border-4 border-primary/20 hover:border-primary/50 transition-all duration-300'
                onError={(e) => {
                  e.target.src = '/avatar.jpg' // Fallback image
                }}
              />
              <label
                htmlFor='avatar-upload'
                className={`
                  absolute bottom-0 right-0
                  bg-primary hover:bg-primary-focus
                  p-2 rounded-full cursor-pointer
                  transition-all duration-200 shadow-md
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                  group-hover:scale-110
                `}
                title="Change profile picture"
              >
                <Camera className='w-5 h-5 text-white'/>
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className='text-sm text-base-content/60'>
              {isUpdatingProfile ? (
                <span className='flex items-center gap-2'>
                  <span className='loading loading-spinner loading-xs'></span>
                  Uploading your new profile picture...
                </span>
              ) : (
                "Click the camera icon to upload your photo (max 2MB)"
              )}
            </p>
          </div>

          {/* Personal Information Section */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <div className='text-sm text-base-content/80 flex items-center gap-2'>
                <User className='w-4 h-4'/>
                Full Name
              </div>
              <div className='px-4 py-3 bg-base-100 rounded-lg border border-base-300'>
                {authUser?.fullname || 'Not specified'}
              </div>
            </div>
            
            <div className='space-y-1.5'>
              <div className='text-sm text-base-content/80 flex items-center gap-2'>
                <Mail className='w-4 h-4'/>
                Email Address
              </div>
              <div className='px-4 py-3 bg-base-100 rounded-lg border border-base-300'>
                {authUser?.email}
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className='bg-base-300 rounded-xl p-6'>
            <h2 className='text-lg font-medium mb-4 flex items-center gap-2'>
              <User className='w-5 h-5' />
              Account Information
            </h2>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between py-3 border-b border-base-content/10'>
                <span className='flex items-center gap-2 text-base-content/80'>
                  <Calendar className='w-4 h-4' />
                  Member Since
                </span>
                <span className='font-medium'>{formatDate(authUser.createdAt)}</span>
              </div>
              <div className='flex items-center justify-between py-3'>
                <span className='flex items-center gap-2 text-base-content/80'>
                  <CheckCircle className='w-4 h-4 text-success' />
                  Account Status
                </span>
                <span className='badge badge-success'>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
