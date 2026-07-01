import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreatePost, PostCategory } from "../api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = [
  { id: "yellow", color: "#F5C518", label: "Yellow (Happy)" },
  { id: "green", color: "#22C55E", label: "Green (Calm)" },
  { id: "red", color: "#EF4444", label: "Red (Urgent)" },
  { id: "blue", color: "#3B82F6", label: "Blue (Cool)" },
];

export default function Create() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<PostCategory>("yellow" as PostCategory);
  
  const createPost = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl.trim()) {
      toast({
        title: "Hold on",
        description: "Post must contain text or an image.",
        variant: "destructive",
      });
      return;
    }
    
    createPost.mutate({
      data: {
        username: "You",
        content: content.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        category: category,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Your post is live.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to publish post.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto"
    >
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4">
        Create Post
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-wider text-black/60">
            Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as PostCategory)}
                className={`p-4 border-4 text-left flex flex-col items-start gap-2 transition-transform duration-100 ${
                  category === cat.id ? "scale-105" : "opacity-50 hover:opacity-100"
                }`}
                style={{ 
                  borderColor: cat.color,
                  backgroundColor: category === cat.id ? cat.color : "transparent",
                  color: category === cat.id ? "#000" : cat.color,
                }}
              >
                <div className="w-4 h-4 bg-current" />
                <span className="font-bold text-xs uppercase">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-wider text-black/60">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[150px] p-4 bg-transparent border-4 border-black focus:outline-none focus:border-black/80 resize-none font-medium text-lg placeholder:text-black/30"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-wider text-black/60">
            Image URL (Optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full p-4 bg-transparent border-4 border-black focus:outline-none focus:border-black/80 font-medium placeholder:text-black/30"
          />
          {imageUrl && (
            <div className="mt-4 border-2 border-white/20 p-2">
              <img src={imageUrl} alt="Preview" className="max-h-48 object-cover w-full opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createPost.isPending}
          className="w-full py-4 border-4 border-black bg-black text-white font-black uppercase text-xl hover:bg-transparent hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createPost.isPending ? (
            <>
              <Loader2 className="animate-spin w-6 h-6" />
              Publishing...
            </>
          ) : (
            "Publish"
          )}
        </button>
      </form>
    </motion.div>
  );
}
