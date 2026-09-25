import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Send, User, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { MediaItem } from '../types';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
  hasLiked?: boolean;
  isSpoiler?: boolean;
  verified?: boolean;
}

interface CommunityReviewsProps {
  media: MediaItem;
}

export const CommunityReviews: React.FC<CommunityReviewsProps> = ({ media }) => {
  const mediaId = media.id;
  const storageKey = `perkvex_reviews_${mediaId}`;

  // Default seed reviews so the movie always has community buzz
  const getDefaultReviews = (): Review[] => {
    const title = media.title || media.name || 'this movie';
    return [
      {
        id: `seed-1-${mediaId}`,
        author: 'Alex_Cinema',
        rating: 5,
        date: '2 hours ago',
        comment: `Server 1 buffer is unbelievable! 1080p full bitrate with zero buffering. Absolutely loved ${title}!`,
        likes: 19,
        verified: true,
      },
      {
        id: `seed-2-${mediaId}`,
        author: 'SarahM_Film',
        rating: 5,
        date: '5 hours ago',
        comment: 'The audio mixing and subtitles were completely synchronized. Great cinema experience on Perkvex.',
        likes: 12,
        verified: true,
      },
      {
        id: `seed-3-${mediaId}`,
        author: 'MarcusV',
        rating: 4,
        date: '1 day ago',
        comment: 'Solid storyline and pacing. Definitely recommend watching this in theater mode!',
        likes: 8,
        verified: false,
      },
    ];
  };

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return getDefaultReviews();
  });

  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem('perkvex_reviewer_name') || '';
  });
  const [newComment, setNewComment] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Sync to localStorage
  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = newComment.trim();
    if (!cleanComment) return;

    const finalAuthor = authorName.trim() || 'Perkvex Member';
    try {
      localStorage.setItem('perkvex_reviewer_name', finalAuthor);
    } catch {
      // ignore
    }

    const newReview: Review = {
      id: `user-${Date.now()}`,
      author: finalAuthor,
      rating: selectedRating,
      date: 'Just now',
      comment: cleanComment,
      likes: 1,
      hasLiked: true,
      isSpoiler,
      verified: true,
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    setNewComment('');
    setIsSpoiler(false);
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  const handleLike = (id: string) => {
    const updated = reviews.map((r) => {
      if (r.id === id) {
        if (r.hasLiked) {
          return { ...r, likes: r.likes - 1, hasLiked: false };
        }
        return { ...r, likes: r.likes + 1, hasLiked: true };
      }
      return r;
    });
    saveReviews(updated);
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <section className="bg-[#18181b] border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl">
      {/* Section Header & Rating Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-600/20 text-red-500 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Community Reviews & Discussions</span>
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-semibold rounded-full">
                {reviews.length} Reviews
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Share your thoughts and read what worldwide viewers say about this title
            </p>
          </div>
        </div>

        {/* Aggregate Score Card */}
        <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="text-base font-black text-white">{avgRating}</span>
            <span className="text-xs text-zinc-500">/ 5</span>
          </div>
          <span className="h-4 w-px bg-zinc-700" />
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Streamers
          </span>
        </div>
      </div>

      {/* Write a Review Input Card */}
      <form onSubmit={handleSubmitReview} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Star Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-300 font-semibold mr-1">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(star)}
                className="p-0.5 text-zinc-600 transition hover:scale-110 cursor-pointer"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`w-5 h-5 ${
                    (hoverRating || selectedRating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-zinc-600'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-amber-400 ml-1.5">
              {hoverRating || selectedRating} / 5 Stars
            </span>
          </div>

          {/* Nickname Field */}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your nickname (e.g. CinemaFan)..."
              maxLength={25}
              className="bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 w-44"
            />
          </div>
        </div>

        {/* Comment Textarea */}
        <textarea
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={`What did you think of ${media.title || media.name || 'this movie'}? Quality, audio, story...`}
          className="w-full bg-black/60 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-600 transition"
          required
        />

        {/* Footer with Spoiler checkbox & Submit Button */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Contains Spoiler
            </span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-red-950/40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post Review</span>
          </button>
        </div>

        {justSubmitted && (
          <p className="text-xs text-emerald-400 font-semibold animate-in fade-in">
            ✓ Your review has been posted successfully! Thank you for contributing.
          </p>
        )}
      </form>

      {/* Reviews List */}
      <div className="space-y-3 pt-2">
        {reviews.map((rev) => {
          const isRevealed = revealedSpoilers[rev.id];
          return (
            <div
              key={rev.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 hover:border-zinc-700 transition"
            >
              {/* Reviewer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {rev.author.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded font-medium">
                          Verified Streamer
                        </span>
                      )}
                      {rev.isSpoiler && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-950 border border-amber-500/30 text-amber-400 rounded font-medium">
                          Spoiler
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{rev.date}</span>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              {rev.isSpoiler && !isRevealed ? (
                <div
                  onClick={() => toggleSpoiler(rev.id)}
                  className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 cursor-pointer hover:bg-zinc-800/50 transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Review contains spoilers. Click to reveal.
                  </span>
                  <span className="text-[11px] underline">Show</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                  {rev.comment}
                </p>
              )}

              {/* Helpful Like Counter */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => handleLike(rev.id)}
                  className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    rev.hasLiked
                      ? 'bg-red-600/20 text-red-400 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 ${rev.hasLiked ? 'fill-red-400' : ''}`} />
                  <span>Helpful ({rev.likes})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
