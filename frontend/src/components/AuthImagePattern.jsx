const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 p-12">
      <div className="max-w-md text-center space-y-8">
        <div className="grid grid-cols-3 gap-3 mb-8 mx-auto w-48">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl transition-all duration-300 ${
                i % 2 === 0 
                  ? "bg-primary/20 hover:bg-primary/30" 
                  : "bg-primary/10 hover:bg-primary/20"
              }`}
            />
          ))}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-content">{title}</h2>
          <p className="text-base-content/80 text-lg leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {[...Array(3)].map((_, i) => (
            <span 
              key={i} 
              className="inline-block h-2 w-2 rounded-full bg-primary/30"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthImagePattern
