import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-200 opacity-30 rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-2 border-gold-300 opacity-40 rounded-full animate-bounce-subtle"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 border-2 border-primary-300 opacity-25 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <Sparkles className="absolute top-1/4 right-1/4 h-8 w-8 text-gold-400 opacity-50 animate-pulse" />
        <Sparkles className="absolute bottom-1/3 left-1/4 h-6 w-6 text-primary-400 opacity-40 animate-bounce-subtle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fade-in-down">
          <Link to="/" className="inline-flex items-center gap-4 text-3xl font-bold mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center shadow-elegant group-hover:shadow-elegant-lg transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
              <span className="text-white text-2xl font-black relative z-10">CBS</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="block text-gradient-primary font-black tracking-tight">Charmé</span>
              <span className="block text-xs text-gray-600 font-semibold tracking-widest uppercase">For the C-Girlies</span>
            </div>
          </Link>
          <h2 className="text-4xl font-black text-gray-900 mb-3">Welcome Back! ✨</h2>
          <p className="text-gray-600 text-lg font-medium">Sign in to continue your jewelry journey</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <SignIn 
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl',
                formFieldInput: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-lg placeholder-gray-400',
                identityPreview: 'bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 border-2 border-primary-200',
                socialButtonsBlockButton: 'w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 text-gray-700 font-semibold',
                card: 'bg-white rounded-3xl shadow-elegant-lg border border-gray-100 p-8 w-full max-w-md',
                headerTitle: 'text-2xl font-bold text-gray-900 text-center mb-2',
                headerSubtitle: 'text-gray-600 text-center mb-6',
                dividerLine: 'bg-gradient-to-r from-transparent via-gray-300 to-transparent',
                dividerText: 'text-gray-500 font-medium px-4',
                footerAction: 'text-center mt-6',
                footerActionText: 'text-gray-600',
                footerActionLink: 'text-primary-600 hover:text-primary-500 font-semibold transition-colors'
              }
            }}
          />
        </div>

        {/* Back to homepage link */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link 
            to="/" 
            className="text-gray-600 hover:text-primary-600 font-medium transition-colors group inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignInPage