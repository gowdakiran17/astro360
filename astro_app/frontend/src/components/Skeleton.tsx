import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'shimmer' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'shimmer',
}) => {
    const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded',
        rounded: 'rounded-xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        shimmer: 'animate-shimmer bg-[length:200%_100%]',
        none: '',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;

// Preset Skeleton Components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`premium-card space-y-4 ${className}`}>
        <div className="flex items-center space-x-3">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={12} />
            </div>
        </div>
        <Skeleton variant="rounded" height={120} />
        <div className="space-y-2">
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
        </div>
    </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`premium-card ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="rounded" width={80} height={24} />
        </div>
        <Skeleton variant="rounded" height={300} className="aspect-square" />
    </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({
    rows = 5,
    className = ''
}) => (
    <div className={`premium-card ${className}`}>
        <Skeleton variant="text" width={150} height={20} className="mb-4" />
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="20%" height={14} />
                    <Skeleton variant="text" width="25%" height={14} />
                    <Skeleton variant="text" width="15%" height={14} />
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonDashboard: React.FC = () => (
    <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
            <SkeletonChart />
            <SkeletonCard />
        </div>
        <div className="col-span-12 lg:col-span-8 xl:col-span-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
            <SkeletonTable rows={7} />
        </div>
        <div className="col-span-12 xl:col-span-3 space-y-6">
            <SkeletonCard />
            <SkeletonCard />
        </div>
    </div>
);
