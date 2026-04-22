"use client";

export default function Skeleton({ variant = "text", className = "", width = "100%", height = "auto", count = 1 }) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded";
  
  const variants = {
    text: "h-4 rounded",
    title: "h-6 rounded",
    avatar: "w-10 h-10 rounded-full",
    card: "h-64 rounded-xl",
    button: "h-10 rounded-lg",
    badge: "h-6 w-16 rounded-full"
  };

  const skeletonClass = `${baseClasses} ${variants[variant]} ${className}`;
  const style = {
    width: width,
    height: height !== "auto" ? height : undefined,
    animation: "shimmer 1.5s ease-in-out infinite"
  };

  if (count === 1) {
    return <div className={skeletonClass} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={skeletonClass} style={style} />
      ))}
    </>
  );
}

// Card Skeleton Component for Browse/MyItems pages
export function CardSkeleton({ className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Image skeleton */}
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse" 
           style={{ animation: "shimmer 1.5s ease-in-out infinite" }} />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton variant="title" width="80%" />
        
        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="75%" />
        </div>
        
        {/* Meta info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Skeleton variant="avatar" className="w-6 h-6" />
            <Skeleton variant="text" width="60px" />
          </div>
          <Skeleton variant="badge" />
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <Skeleton variant="button" width="32px" height="32px" className="rounded-lg" />
          <Skeleton variant="button" width="32px" height="32px" className="rounded-lg" />
          <Skeleton variant="button" width="32px" height="32px" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// List Item Skeleton for Admin dashboard
export function ListItemSkeleton({ className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Skeleton variant="avatar" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" width="60%" />
          <Skeleton variant="text" width="80%" />
          <div className="flex items-center space-x-4">
            <Skeleton variant="text" width="100px" />
            <Skeleton variant="text" width="80px" />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Skeleton variant="button" width="36px" height="36px" className="rounded-lg" />
          <Skeleton variant="button" width="36px" height="36px" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton for dashboards
export function StatCardSkeleton({ className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="title" width="60%" />
        </div>
      </div>
    </div>
  );
}