import React from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface FeedBackCardProps {
  name: string;
  location: string;
  avatar: string;
  rating: number; // Dynamic rating from user
  content: string;
}

const FeedBackCard: React.FC<FeedBackCardProps> = ({
  name,
  location,
  avatar,
  rating,
  content,
}) => {
  return (
    <div className="bg-card border border-border-card rounded-[24px] p-6 shadow-card max-w-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border-subtle shrink-0">
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-text-main font-bold text-base leading-tight">{name}</h4>
            <p className="text-text-muted text-xs mt-0.5">{location}</p>
          </div>
        </div>

        {/* Dynamic Rating */}
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              fill={i < rating ? "var(--accent-gold)" : "none"}
              strokeWidth={1.5}
              className={i < rating ? "text-accent-gold" : "text-gray-200"}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-text-main text-[13px] leading-[1.6] font-medium">
          {content}
        </p>
      </div>
    </div>
  );
};

export default FeedBackCard;
