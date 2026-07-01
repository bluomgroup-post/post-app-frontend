import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Trash2 } from 'lucide-react';

const COLORS = {
  yellow: "#FFD600",
  green: "#00C853",
  red: "#FF1744",
  blue: "#2979FF",
  dark: "#0A0A0A",
  card: "#111111",
  text: "#FFFFFF",
  muted: "#666666",
};

const ACCENTS = [COLORS.yellow, COLORS.green, COLORS.red, COLORS.blue];

const HomeTab = ({ token, user, showToast, api }) => {
  const [posts, setPosts] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const d = await api("/posts", "GET", null, token);
      setPosts(d.posts || d);
      setLoading(false);
    } catch (e) {
      showToast(e.message, COLORS.red);
      setLoading(false);
    }
  };

  const handleLike = async (pid, color) => {
    try {
      await api(`/posts/${pid}/like`, "POST", { color }, token);
      loadPosts();
    } catch (e) {
      showToast(e.message, COLORS.red);
    }
  };

  const handleDelete = async (pid) => {
    try {
      await api(`/posts/${pid}`, "DELETE", null, token);
      showToast("Post deleted", COLORS.red);
      loadPosts();
    } catch (e) {
      showToast(e.message, COLORS.red);
    }
  };

  const handleComment = async (pid, text) => {
    try {
      await api(`/posts/${pid}/comments`, "POST", { text }, token);
      loadPosts();
    } catch (e) {
      showToast(e.message, COLORS.red);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>
        Loading posts... ⏳
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px" }}>
      {/* Header with Compose Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingTop: "8px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "4px" }}>
            Feed 🌍
          </h2>
          <p style={{ color: COLORS.muted, fontSize: "13px" }}>
            {posts.length} posts from your network
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          style={{
            background: COLORS.yellow,
            color: "#000",
            border: "none",
            borderRadius: "14px",
            padding: "12px 20px",
            fontWeight: "900",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "transform 0.2s",
          }}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
        >
          <Plus size={18} />
          NEW POST
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px",
          gridAutoRows: "auto",
        }}
      >
        {posts.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 20px",
              color: COLORS.muted,
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
            <p>No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post, idx) => (
            <BentoPostCard
              key={post.id}
              post={post}
              user={user}
              onLike={handleLike}
              onDelete={handleDelete}
              onComment={handleComment}
              isLarge={idx % 5 === 0}
            />
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          token={token}
          user={user}
          onClose={() => setShowCompose(false)}
          onPost={() => {
            setShowCompose(false);
            loadPosts();
            showToast("Posted! 🌍", COLORS.green);
          }}
          showToast={showToast}
          api={api}
        />
      )}
    </div>
  );
};

// Bento-style Post Card
const BentoPostCard = ({
  post,
  user,
  onLike,
  onDelete,
  onComment,
  isLarge,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const myLike = post.likes?.find((l) => l.user_id === user.id);

  const cardStyle = {
    background: COLORS.card,
    border: `2px solid ${post.accent || COLORS.yellow}`,
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    gridColumn: isLarge ? "span 2" : "span 1",
    gridRow: isLarge ? "span 2" : "span 1",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = COLORS.yellow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = post.accent || COLORS.yellow;
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "start", flex: 1 }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: post.avatar_bg || COLORS.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "20px",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {post.avatar_photo ? (
              <img
                src={post.avatar_photo}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              post.avatar_letter
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: "700", fontSize: "14px" }}>{post.user_name}</div>
            <div style={{ color: COLORS.muted, fontSize: "12px" }}>{post.user_handle}</div>
            {post.location && (
              <div style={{ color: COLORS.muted, fontSize: "11px", marginTop: "4px" }}>
                📍 {post.location}
              </div>
            )}
          </div>
        </div>
        {post.user_id === user.id && (
          <button
            onClick={() => onDelete(post.id)}
            style={{
              color: COLORS.red,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              padding: "4px",
            }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: isLarge ? "16px" : "14px",
          lineHeight: "1.6",
          color: COLORS.text,
          flexGrow: 1,
        }}
      >
        {post.content}
      </div>

      {/* Accent Bar */}
      <div
        style={{
          height: "4px",
          background: post.accent || COLORS.yellow,
          borderRadius: "2px",
          width: "40px",
        }}
      />

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: COLORS.muted,
        }}
      >
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
        {post.views && <span>{post.views.length} views</span>}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderTop: `1px solid #222`,
          paddingTop: "12px",
          justifyContent: "space-around",
        }}
      >
        <div style={{ display: "flex", gap: "4px" }}>
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => onLike(post.id, c)}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: c,
                border:
                  myLike?.color === c ? `2px solid ${COLORS.text}` : "2px solid transparent",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => (e.target.style.transform = "scale(0.9)")}
              onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
            />
          ))}
        </div>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: "none",
            border: "none",
            color: COLORS.muted,
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <MessageCircle size={16} />
          Comment
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ borderTop: `1px solid #222`, paddingTop: "12px", marginTop: "8px" }}>
          <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "8px" }}>
            {post.comments?.map((c, i) => (
              <div
                key={i}
                style={{
                  fontSize: "12px",
                  padding: "6px 0",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <span style={{ fontWeight: "700", color: COLORS.yellow }}>
                  {c.user_name}:{" "}
                </span>
                <span style={{ color: "#ccc" }}>{c.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Comment..."
              style={{
                flex: 1,
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#fff",
                fontSize: "12px",
                outline: "none",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && commentText.trim()) {
                  onComment(post.id, commentText);
                  setCommentText("");
                }
              }}
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  onComment(post.id, commentText);
                  setCommentText("");
                }
              }}
              style={{
                background: COLORS.yellow,
                color: "#000",
                border: "none",
                borderRadius: "6px",
                padding: "6px 10px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compose Modal
const ComposeModal = ({ token, user, onClose, onPost, showToast, api }) => {
  const [text, setText] = useState("");
  const [accent, setAccent] = useState(COLORS.yellow);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) {
      showToast("Write something!", COLORS.red);
      return;
    }
    setLoading(true);
    try {
      await api("/posts", "POST", { content: text, accent, location }, token);
      onPost();
    } catch (e) {
      showToast(e.message, COLORS.red);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: "24px",
          padding: "24px",
          width: "100%",
          maxWidth: "500px",
          border: `2px solid ${COLORS.yellow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontWeight: "900", fontSize: "20px" }}>✍️ New Post</span>
          <button
            onClick={onClose}
            style={{
              color: COLORS.muted,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: user.avatar_bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: "20px",
            }}
          >
            {user.avatar_letter}
          </div>
          <div>
            <div style={{ fontWeight: "700" }}>{user.name}</div>
            <div style={{ color: COLORS.muted, fontSize: "12px" }}>{user.handle}</div>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind? 🌍"
          style={{
            width: "100%",
            height: "120px",
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#fff",
            fontSize: "15px",
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            marginBottom: "12px",
          }}
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="📍 Location (optional)"
          style={{
            width: "100%",
            background: "#0a0a0a",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "10px 14px",
            color: "#fff",
            fontSize: "13px",
            outline: "none",
            marginBottom: "12px",
            fontFamily: "inherit",
          }}
        />

        {/* Accent Colors */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: c,
                border: accent === c ? `3px solid ${COLORS.text}` : "3px solid transparent",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <button
          onClick={handlePost}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: COLORS.yellow,
            color: "#000",
            fontWeight: "900",
            fontSize: "15px",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Posting..." : "SHARE GLOBALLY 🌍"}
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
