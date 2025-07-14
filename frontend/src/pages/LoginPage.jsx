import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState(null)
  const { login, isLoggingIn } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await login(formData)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-base-100 to-base-200'>
      {/* Login Form Section */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className='w-full max-w-md space-y-8 bg-base-100 p-8 rounded-xl shadow-lg'>
          {/* Header */}
          <div className='text-center'>
            <div className='flex flex-col items-center gap-2 group mb-6'>
              <div className='size-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300'>
                <MessageSquare className='size-8 text-primary' />
              </div>
              <h1 className='text-3xl font-bold mt-4 text-primary'>Welcome Back</h1>
              <p className='text-base-content/70'>Sign in to continue to your account</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='alert alert-error p-3 flex items-start gap-3'>
              <AlertCircle className='size-5 flex-shrink-0' />
              <span className='text-sm'>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Email Address</span>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='size-5 text-base-content/40' />
                </div>
                <input
                  type='email'
                  className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50'
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoggingIn}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='form-control'>
              <label className='label'>
                <span className='label-text font-medium'>Password</span>
                <Link to="/forgot-password" className='label-text-alt link link-hover text-sm'>
                  Forgot password?
                </Link>
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='size-5 text-base-content/40' />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className='input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50'
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoggingIn}
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary transition-colors'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? (
                    <EyeOff className='size-5 text-base-content/60 hover:text-primary' />
                  ) : (
                    <Eye className='size-5 text-base-content/60 hover:text-primary' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              className='btn btn-primary w-full h-12 rounded-lg shadow-md hover:shadow-lg transition-all'
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className='size-5 animate-spin mr-2' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className='text-center pt-4 border-t border-base-content/10'>
            <p className='text-base-content/70'>
              Don't have an account?{' '}
              <Link to="/signup" className='link link-primary font-medium'>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Side Section */}
      <div className='hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary to-primary-focus text-primary-content'>
        <div className='max-w-md text-center space-y-6'>
          <h2 className='text-4xl font-bold'>Welcome Back!</h2>
          <p className='text-xl opacity-90'>
            We're so excited to see you again! Sign in to access your personalized dashboard.
          </p>
          <div className='flex justify-center'>
            <div className='w-32 h-1 bg-primary-content/30 rounded-full'></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage