import MotionDiv from "@/components/Shared/MotionDiv/MotionDiv";
import React from "react";

export default function BlogDetailsLoading() {
  return (
    <MotionDiv key={1}>
      <div className="container mx-auto px-4 py-8 animate-pulse">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

        {/* Meta Skeleton (date + views) */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>

        {/* Description Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Tags Skeleton */}
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-24"></div>
        </div>
      </div>
    </MotionDiv>
  );
}
