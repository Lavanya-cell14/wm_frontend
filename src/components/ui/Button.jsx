import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm";
  
  const variants = {
    primary: "bg-[#0071C1] hover:bg-blue-700 text-white focus:ring-[#0071C1]",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 shadow-none",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
    icon: "h-10 w-10 p-2 justify-center",
  };

  // Prevent conflicts between variant default styles and custom classes
  let variantStyle = variants[variant];
  if (className.includes('bg-')) {
    variantStyle = variantStyle
      .split(' ')
      .filter(cls => !cls.startsWith('bg-') && !cls.startsWith('hover:bg-'))
      .join(' ');
  }
  if (className.includes('text-')) {
    variantStyle = variantStyle
      .split(' ')
      .filter(cls => !cls.startsWith('text-') && !cls.startsWith('hover:text-'))
      .join(' ');
  }
  if (className.includes('border-') || className.includes('border-none')) {
    variantStyle = variantStyle
      .split(' ')
      .filter(cls => !cls.startsWith('border'))
      .join(' ');
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyle} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}
