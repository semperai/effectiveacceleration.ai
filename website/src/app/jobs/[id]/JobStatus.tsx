interface JobStatusProps {
  text: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'pending';
  icon?: any;
  description?: string;
}

const JobStatus: React.FC<JobStatusProps> = ({
  text,
  variant,
  icon: Icon,
  description,
}) => {
  const variantStyles = {
    success: {
      bg: 'from-emerald-500/10 via-green-500/5 to-emerald-500/10 dark:from-emerald-500/20 dark:via-green-500/10 dark:to-emerald-500/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    warning: {
      bg: 'from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-amber-500/20 dark:via-orange-500/10 dark:to-amber-500/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-amber-500/20',
    },
    danger: {
      bg: 'from-red-500/10 via-rose-500/5 to-red-500/10 dark:from-red-500/20 dark:via-rose-500/10 dark:to-red-500/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      glow: 'shadow-red-500/20',
    },
    info: {
      bg: 'from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-blue-500/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    pending: {
      bg: 'from-purple-500/10 via-violet-500/5 to-purple-500/10 dark:from-purple-500/20 dark:via-violet-500/10 dark:to-purple-500/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      glow: 'shadow-purple-500/20',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${styles.bg} border ${styles.border} rounded-xl p-4 shadow-lg ${styles.glow} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl`}
    >
      {/* Animated background pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div className='animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent' />
      </div>

      {/* Content */}
      <div className='relative flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {Icon && (
            <div
              className={`rounded-lg bg-white/50 p-2.5 backdrop-blur-sm dark:bg-black/20 ${styles.icon} `}
            >
              <Icon className='h-5 w-5' />
            </div>
          )}
          <div>
            <span className={`text-sm font-semibold ${styles.text}`}>
              {text}
            </span>
            {description && (
              <p className={`mt-0.5 text-xs opacity-75 ${styles.text}`}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Animated pulse indicator */}
        {variant === 'pending' && (
          <div className='flex items-center gap-1'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-purple-500' />
            <div className='h-2 w-2 animate-pulse rounded-full bg-purple-500 delay-100' />
            <div className='h-2 w-2 animate-pulse rounded-full bg-purple-500 delay-200' />
          </div>
        )}
      </div>

      {/* Gradient shine effect */}
      <div className='animate-shine absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent' />
    </div>
  );
};

export default JobStatus;
