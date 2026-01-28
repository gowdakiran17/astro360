import React from 'react';

const CosmicBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dark Space Base */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-500" />

            {/* Nebula Gradients (Animated) */}
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
            <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slower" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />

            {/* Stars (Static for performance, or subtle twinkle) */}
            <div className="absolute inset-0 opacity-20 dark:opacity-40"
                style={{
                    backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0))',
                    backgroundSize: '300px 300px'
                }}
            />
        </div>
    );
};

export default CosmicBackground;
