import { useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthImagePattern from '../components/AuthImagePattern'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  })
  const { signup, isSigningUp } = useAuthStore()

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      toast.error("Full name is required")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      signup(formData)
    }
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2 bg-base-100'>
      {/* Form Section */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className='w-full max-w-md space-y-6'>
          {/* Header */}
          <div className='text-center'>
            <div className='flex flex-col items-center gap-3 mb-4'>
              <div className='size-14 rounded-xl bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20'>
                <MessageSquare className='size-7 text-primary'/>
              </div>
              <h1 className='text-2xl font-bold'>Create Account</h1>
              <p className='text-base-content/70'>Get started with your free account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Full Name Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Full Name</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='size-5 text-base-content/40'/>
                </div>
                <input 
                  type='text'
                  className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50'
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                  disabled={isSigningUp}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='size-5 text-base-content/40'/>
                </div>
                <input 
                  type='email'
                  className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50'
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isSigningUp}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='size-5 text-base-content/40'/>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50'
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={isSigningUp}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className='size-5 text-base-content/60'/>
                  ) : (
                    <Eye className='size-5 text-base-content/60'/>
                  )}
                </button>
              </div>
              <label className='label'>
                <span className='label-text-alt text-base-content/50'>Minimum 6 characters</span>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type='submit' 
              className='btn btn-primary w-full mt-4'
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className='size-5 animate-spin mr-2'/>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className='text-center pt-4'>
            <p className='text-base-content/60'>
              Already have an account?{' '}
              <Link to="/login" className='link link-primary font-medium'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Image Pattern Section */}
      <AuthImagePattern
        title="Join our Community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  )
}

export default SignUpPage