import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Bookmark, AlertCircle } from "lucide-react";
import { useListPosts, PostCategory } from "../api";

const CATEGORY_COLORS = {
  yellow: "#F5C518",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
};

export default function Home() {
  const [filter, setFilter] = useState<string>("All");
  
  const { data, isLoading, error } = useListPosts(
    filter !== "All" ? { category: filter.toLowerCase() as any } : undefined,
    { query: { enabled: true } }
  );

  const posts = data?.posts || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap gap-3 mb-8">
        {["All", "Yellow", "Green", "Red", "Blue"].map((cat) => {
          const isSelected = filter === cat;
          const color = cat !== "All" ? CATEGORY_COLORS[cat.toLowerCase() as keyof typeof CATEGORY_COLORS] : "#ffffff";
          
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 border-2 font-bold uppercase text-xs tracking-wider transition-all duration-200 ${
                isSelected ? "bg-white text-black border-white" : "bg-transparent text-white border-white/20 hover:border-white"
              }`}
              style={isSelected && cat !== "All" ? { backgroundColor: color, borderColor: color, color: "#000" } : {}}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 border-2 border-white/20 bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-6 border-4 border-red-500 flex flex-col items-center justify-center space-y-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="text-xl font-bold uppercase">Failed to load</h3>
            <p className="text-white/60">Could not connect to the feed.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="p-12 border-2 border-dashed border-white/20 text-center flex flex-col items-center">
          <h3 className="text-2xl font-black uppercase mb-2">No Posts Yet</h3>
          <p className="text-white/60 mb-6">Be the first to share something.</p>
          <Link href="/create" className="border-2 border-white px-6 py-3 bg-white text-black font-bold uppercase hover:bg-transparent hover:text-white transition-colors">
            Create Post
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => {
          const catColor = CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS];
          
          return (
            <motion.div 
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-4 bg-white group"
              style={{ borderColor: catColor }}
            >
              <div className="p-4 border-b-2 flex items-center justify-between" style={{ borderColor: catColor }}>
                <span className="font-bold uppercase tracking-tight">{post.username}</span>
                <span 
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: catColor }}
                />
              </div>
              
              <Link href={`/post/${post.id}`} className="block p-6 hover:bg-white/5 transition-colors cursor-pointer">
                {post.content && (
                  <p className="text-lg md:text-xl font-medium leading-snug whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
                {post.imageUrl && (
                  <div className="mt-4 border-2 border-white/20">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-96" />
                  </div>
                )}
              </Link>
              
              <div className="p-4 border-t-2 flex items-center gap-6 text-sm font-bold" style={{ borderColor: catColor }}>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>{post.likesCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>{post.commentsCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  <span>{post.savesCount}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
