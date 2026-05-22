interface LogoProps {
  className?: string
  size?: number
  variant?: 'full' | 'icon'
  dark?: boolean
}

export function SIGLogo({ className = '', size = 32, variant = 'full', dark = false }: LogoProps) {
  const textColor = dark ? '#ffffff' : '#0f172a'
  const subColor = dark ? 'rgba(255,255,255,0.55)' : '#64748b'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#6366f1" />
        <path
          d="M16 6 L26 11 L26 21 L16 26 L6 21 L6 11 Z"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
        <path
          d="M16 10 L22 13.5 L22 20.5 L16 24 L10 20.5 L10 13.5 Z"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1.5"
        />
        <text x="16" y="19.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="white" fontFamily="system-ui, sans-serif">
          SIG
        </text>
      </svg>

      {variant === 'full' && (
        <div>
          <div style={{ color: textColor }} className="text-sm font-black tracking-tight leading-none">
            SIGCYA
          </div>
          <div style={{ color: subColor }} className="text-[10px] font-medium leading-none mt-0.5">
            Integrated Management
          </div>
        </div>
      )}
    </div>
  )
}
