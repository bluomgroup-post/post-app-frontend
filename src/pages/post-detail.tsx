import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Bookmark, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useGetPost, useListComments, useAddComment, useToggleLike, useToggleSave, useDeletePost } from "../api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORY_COLORS = {
  yellow: "#F5C518",
  green: "#22C55E",
  red: "#EF4444",
  blue: "#3B82F6",
};

export default function PostDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: post, isLoading: isLoadingPost } = useGetPost(postId, { query: { enabled: !!postId } });
  const { data: commentsData, isLoading: isLoadingComments } = useListComments(postId, { query: { enabled: !!postId } });
  
  const addComment = useAddComment();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();

  const [commentContent, setCommentContent] = useState("");

  const handleLike = () => {
    toggleLike.mutate({ id: postId, data: { userId: "me" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      }
    });
  };

  const handleSave = () => {
    toggleSave.mutate({ id: postId, data: { userId: "me" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this post?")) {
      deletePost.mutate({ id: postId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
          setLocation("/");
        }
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    addComment.mutate({
      id: postId,
      data: {
        userId: "me",
        username: "You",
        content: commentContent.trim(),
      }
    }, {
      onSuccess: () => {
        setCommentContent("");
        queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      }
    });
  };

  if (isLoadingPost) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-white/50" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black uppercase">Post not found</h2>
        <button onClick={() => setLocation("/")} className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black font-bold uppercase transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS];
  const comments = commentsData?.comments || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-12"
    >
      <button 
        onClick={() => setLocation("/")}
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-white/70 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      {/* Post content */}
      <div className="border-4 bg-white" style={{ borderColor: catColor }}>
        <div className="p-4 border-b-2 flex items-center justify-between" style={{ borderColor: catColor }}>
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-tight text-lg">{post.username}</span>
            <span className="text-white/40 text-xs font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span 
              className="px-3 py-1 text-xs font-black uppercase text-black"
              style={{ backgroundColor: catColor }}
            >
              {post.category}
            </span>
            <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          {post.content && (
            <p className="text-xl md:text-2xl font-medium leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}
          {post.imageUrl && (
            <div className="mt-8 border-4 border-white/20">
              <img src={post.imageUrl} alt="Post content" className="w-full h-auto" />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t-2 flex items-center gap-8" style={{ borderColor: catColor }}>
          <button 
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className="flex items-center gap-2 font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
          >
            <Heart className={`w-6 h-6 ${toggleLike.isPending ? 'opacity-50' : ''}`} />
            <span className="text-lg">{post.likesCount}</span>
          </button>
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/50">
            <MessageSquare className="w-6 h-6" />
            <span className="text-lg">{post.commentsCount}</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={toggleSave.isPending}
            className="flex items-center gap-2 font-bold uppercase tracking-wider hover:text-blue-500 transition-colors ml-auto"
          >
            <Bookmark className={`w-6 h-6 ${toggleSave.isPending ? 'opacity-50' : ''}`} />
            <span className="text-lg">{post.savesCount}</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black uppercase border-b-2 border-white/20 pb-4">
          Comments ({post.commentsCount})
        </h3>

        <form onSubmit={handleCommentSubmit} className="flex gap-4">
          <input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-4 bg-transparent border-2 border-white focus:outline-none focus:border-white/80 font-medium placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={addComment.isPending || !commentContent.trim()}
            className="px-8 border-2 border-white bg-white text-black font-bold uppercase hover:bg-transparent hover:text-white transition-colors disabled:opacity-50"
          >
            {addComment.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Post"}
          </button>
        </form>

        <div className="space-y-4 pt-4">
          {isLoadingComments ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 border-2 border-white/10 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-2 border-black/20 p-4 bg-black/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold uppercase text-sm">{comment.username}</span>
                  <span className="text-white/40 text-xs font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-medium text-white/90">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-white/40 font-bold uppercase py-8 border-2 border-dashed border-white/20">
              No comments yet
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
