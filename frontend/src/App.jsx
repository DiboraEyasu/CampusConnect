import { useEffect, useState } from "react";
import Marketplace from "./Marketplace";
import "./App.css";

const starterPosts = [
  {
    id: 1,
    initials: "MK",
    name: "Mekdes K.",
    time: "12 min ago · Computer Science",
    content:
      "Anyone joining the Data Structures study session this afternoon? We’ll review trees and graphs together. Bring your questions 🌱",
    tags: ["Study group", "Computer Science"],
    likes: 24,
    comments: 8,
    color: "mint",
  },
  {
    id: 2,
    initials: "DA",
    name: "Daniel A.",
    time: "1 hour ago · Campus life",
    content:
      "A little reminder: the best campus memories often start with saying hello. What’s one thing you learned this week?",
    tags: ["Campus life"],
    likes: 17,
    comments: 4,
    color: "violet",
  },
];

const events = [
  { day: "30", month: "OCT", title: "Campus Tech Meetup", detail: "Thu · 3:00 PM · Innovation Hub", type: "Technology" },
  { day: "02", month: "NOV", title: "Study Circle: Algorithms", detail: "Sun · 10:00 AM · Library room 2", type: "Study group" },
  { day: "05", month: "NOV", title: "Student Creators Night", detail: "Wed · 5:30 PM · Main Hall", type: "Community" },
];

const groups = [
  { symbol: "⌘", title: "Code Circle", members: "248 members", tone: "group-green" },
  { symbol: "✳", title: "Design Corner", members: "126 members", tone: "group-blue" },
  { symbol: "∑", title: "Study Sprint", members: "391 members", tone: "group-gold" },
];

function Avatar({ initials, tone = "" }) {
  return <span className={`avatar ${tone}`}>{initials}</span>;
}

const navIconPaths = {
  Home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
  Explore: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4M8 13l2-4 4-2-2 4z"/></>,
  Groups: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  Events: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  Marketplace: <><path d="M3 9h18l-1.5-5h-15zM5 9v11h14V9M9 20v-6h6v6"/></>,
  Messages: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
};
function NavIcon({ label, size = 19 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{navIconPaths[label]}</svg>;
}
function HeartIcon({ filled = false, size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"/></svg>;
}
function MessageIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>;
}

function App() {
  // Authentication is kept in memory for this MVP; refreshing signs the student out.
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  
  const [events, setEvents] = useState([]);

  useEffect(() => {
  if (!token) return;

  const controller = new AbortController();

  async function loadEvents() {
    setEventsLoading(true);
    setEventsError("");

    try {
      const response = await fetch(
        "https://campusconnect-8-d1pg.onrender.com/api/events?upcoming=true&page=1&limit=10",
        { signal: controller.signal }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Could not load events.");
      }

      setEvents(data.data.events);
    } catch (error) {
      if (error.name !== "AbortError") {
        setEventsError(error.message || "Could not load events.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setEventsLoading(false);
      }
    }
  }

  loadEvents();

  return () => controller.abort();
}, [token]);

  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [draft, setDraft] = useState("");
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [liked, setLiked] = useState({});
  const [active, setActive] = useState("Home");
  const [joined, setJoined] = useState({});
  const [notice, setNotice] = useState("");
  const [postLikes, setPostLikes] = useState({});
  const [likeBusy, setLikeBusy] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [theme, setTheme] = useState(
      () => localStorage.getItem("campus-theme") || "light"
    );

    useEffect(() => {
      document.documentElement.dataset.theme = theme;
      localStorage.setItem("campus-theme", theme);
    }, [theme]);

    function toggleTheme() {
      setTheme((current) =>
        current === "light" ? "dark" : "light"
      );
    }

  async function submitLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginBusy(true);

    try {
      const response = await fetch("https://campusconnect-8-d1pg.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.status !== "success" || !data.token) {
        setLoginError(data.message || "Login failed. Please check your details and try again.");
        return;
      }

      setToken(data.token);
      setCurrentUser(data.user || null);
      setPassword("");
    } catch {
      setLoginError("Could not reach CampusConnect. Check that the backend is running on port 5000.");
    } finally {
      setLoginBusy(false);
    }
  }

  // Load real posts whenever a student successfully signs in.
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    async function loadPosts() {
      setPostsLoading(true);
      setPostsError("");
      try {
        const response = await fetch("https://campusconnect-8-d1pg.onrender.com/api/posts?page=1&limit=10", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.status !== "success" || !Array.isArray(data.posts)) {
          throw new Error(data.message || "Could not load posts.");
        }
        setPosts(data.posts);

        // Load public like information for every post.
        const likeResults = await Promise.all(
          data.posts.map(async (post) => {
            try {
              const likeResponse = await fetch(
                `https://campusconnect-8-d1pg.onrender.com/api/posts/${post._id}/likes`,
                { signal: controller.signal }
              );

              const likeData = await likeResponse.json();

              if (!likeResponse.ok || likeData.status !== "success") {
                throw new Error("Could not load likes.");
              }

              // authenticate middleware verifies JWT payload.sub; use that same identity.
              const userId = getAuthenticatedUserId(token);
              const likes = Array.isArray(likeData.likes) ? likeData.likes : [];

              return {
                postId: post._id,
                likeCount: Number(likeData.likeCount) || 0,
                likedByMe: Boolean(userId) && likes.some(
                  (like) => String(like.user?._id || like.user) === userId
                ),
              };
            } catch (error) {
              if (error.name === "AbortError") throw error;

              return {
                postId: post._id,
                likeCount: null,
                likedByMe: false,
                loadError: true,
              };
            }
          })
        );

        if (!controller.signal.aborted) {
          setPostLikes((previous) => ({
            ...previous,
            ...Object.fromEntries(
              likeResults.map((item) => [
                item.postId,
                item.loadError
                  ? { ...(previous[item.postId] || {}), likeLoadError: true }
                  : {
                      likeCount: item.likeCount,
                      likedByMe: item.likedByMe,
                      likeLoadError: false,
                    },
              ])
            ),
          }));
        }      } catch (error) {
        if (error.name !== "AbortError") {
          setPostsError(error.message || "Could not load posts. Check your connection.");
        }
      } finally {
        if (!controller.signal.aborted) setPostsLoading(false);
      }
    }
    loadPosts();
    return () => controller.abort();
}, [token, currentUser?._id]);
  function logout() {
    setToken("");
    setCurrentUser(null);
    setPassword("");
    setEmail("");
    setNotice("You have signed out.");
  }

  if (!token) {
    return (
      <main className="auth-screen">
        <section className="auth-brand-panel">
          <a className="brand auth-brand" href="#" onClick={(e) => e.preventDefault()}>
            <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V9m0 5c-5 0-8-3-8-8 5 0 8 3 8 8Zm0 2c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg></span>
            <span>campus<span className="brand-light">connect</span></span>
          </a>
          <div className="auth-message">
            <span className="eyebrow"><span className="online-pulse"/> YOUR CAMPUS, YOUR COMMUNITY</span>
            <h1>Good things<br/>happen <em>together.</em></h1>
            <p>A place to meet curious minds, share ideas, discover campus events, and find your community.</p>
            <div className="auth-perks">
              <span><i></i> Find your people</span>
              <span><i></i> Share what you know</span>
              <span><i></i> Make campus yours</span>
            </div>
          </div>
          <span className="auth-footnote">CAMPUSCONNECT · STUDENT COMMUNITY</span>
          <div className="auth-art" aria-hidden="true"><span className="auth-orb"/><span className="auth-art-ring">✳</span><span className="auth-art-spark">✳</span></div>
        </section>

        <section className="auth-form-panel">
          <form className="login-card" onSubmit={submitLogin}>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your<br/>campus community.</h2>
            <p className="login-intro">Pick up where your campus life left off.</p>

            <label className="login-label" htmlFor="login-email">Email address</label>
            <input id="login-email" className="login-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu"/>

            <div className="password-label-row"><label className="login-label" htmlFor="login-password">Password</label></div>
            <input id="login-password" className="login-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"/>

            {loginError && <div className="login-error" role="alert">{loginError}</div>}

            <button className="login-submit" type="submit" disabled={loginBusy}>
              {loginBusy ? "Signing you in..." : "Sign in"} <span>↗</span>
            </button>
            <p className="login-security"><span>⌑</span> Your connection is handled by CampusConnect API.</p>
            <div className="login-bottom">New to CampusConnect? <span>Registration UI comes next.</span></div>
          </form>
          <span className="auth-mobile-foot">CAMPUSCONNECT · STUDENT COMMUNITY</span>
        </section>
      </main>
    );
  }


function getAuthenticatedUserId(authToken) {
  try {
    const payloadPart = authToken.split(".")[1];
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    return String(payload.sub || "");
  } catch {
    return "";
  }
}

async function openComments(postId) {
  setActiveCommentsPostId(postId);
  setCommentsLoading(true);
  setCommentError("");
  setCommentDraft("");
  try {
    const response = await fetch(`https://campusconnect-8-d1pg.onrender.com/api/posts/${postId}/comments?page=1&limit=50`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.comments)) {
      throw new Error(data.message || "Unable to load comments.");
    }
    setCommentsByPost((previous) => ({ ...previous, [postId]: data.comments }));
  } catch (error) {
    setCommentError(error.message || "Unable to load comments. Check your connection.");
  } finally {
    setCommentsLoading(false);
  }
}

async function submitComment(event) {
  event.preventDefault();
  const content = commentDraft.trim();
  if (!activeCommentsPostId || !content || commentBusy) return;
  setCommentBusy(true);
  setCommentError("");
  try {
    const response = await fetch(`https://campusconnect-8-d1pg.onrender.com/api/posts/${activeCommentsPostId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== "success" || !data.comment) {
      throw new Error(data.message || "Could not publish your comment.");
    }
    setCommentsByPost((previous) => ({
      ...previous,
      [activeCommentsPostId]: [data.comment, ...(previous[activeCommentsPostId] || [])],
    }));
    setCommentDraft("");
  } catch (error) {
    setCommentError(error.message || "Could not publish your comment.");
  } finally {
    setCommentBusy(false);
  }
}

async function toggleLike(postId) {
  if (likeBusy[postId]) return;

  const currentLike = postLikes[postId];

  if (!currentLike) return;

  setLikeBusy((previous) => ({
    ...previous,
    [postId]: true,
  }));

  try {
    const method = currentLike.likedByMe ? "DELETE" : "PUT";

    const response = await fetch(
      `https://campusconnect-8-d1pg.onrender.com/api/posts/${postId}/like`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status !== "success") {
      throw new Error(data.message || "Could not update your like.");
    }

    
    // Refresh the real count and liked state from the database.
    const likesResponse = await fetch(
      `https://campusconnect-8-d1pg.onrender.com/api/posts/${postId}/likes`
    );

    const likesData = await likesResponse.json();

    if (!likesResponse.ok || likesData.status !== "success") {
      throw new Error("Like updated, but the latest count could not be loaded.");
    }

const userId = getAuthenticatedUserId(token);
    setPostLikes((previous) => ({
      ...previous,
      [postId]: {
        likeCount: likesData.likeCount,
        likedByMe: likesData.likes.some(
          (like) => String(like.user?._id || like.user) === String(userId)
        ),
      },
    }));
  } catch (error) {
    setNotice(error.message || "Something went wrong while updating your like.");
  } finally {
    setLikeBusy((previous) => ({
      ...previous,
      [postId]: false,
    }));
  }
}
 
async function publishPost(e) {
  e.preventDefault();

  const content = draft.trim();

  // Basic frontend validation
  if (!content) {
    setPublishError("Please write something before posting.");
    return;
  }

  if (content.length > 2000) {
    setPublishError("Your post cannot exceed 2000 characters.");
    return;
  }

  if (publishBusy) return;

  setPublishBusy(true);
  setPublishError("");
  setNotice("");

  try {
    const response = await fetch("https://campusconnect-8-d1pg.onrender.com/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status !== "success" || !data.post) {
      throw new Error(data.message || "Could not publish your post.");
    }

    // Add the real post returned by the backend
    setPosts((currentPosts) => [
      data.post,
      ...currentPosts.filter((post) => post._id !== data.post._id),
    ]);
    setPostLikes((previous) => ({
      ...previous,
      [data.post._id]: {
        likeCount: 0,
        likedByMe: false,
      },
    }));

    setDraft("");
    setNotice("Your post was published successfully!");
  } catch (error) {
    setPublishError(
      error.message || "Could not publish your post. Please try again."
    );
  } finally {
    setPublishBusy(false);
  }
}



function chooseNav(label) {
  setActive(label);

  if (label === "Home" || label === "Events") {
    setNotice("");
  } else {
    setNotice(
      `${label} is a preview section. We'll connect it after the main feed.`
    );
  }
}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); chooseNav("Home"); }}>
          <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20V9m0 5c-5 0-8-3-8-8 5 0 8 3 8 8Zm0 2c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg></span>
          <span>campus<span className="brand-light">connect</span></span>
        </a>

        <div className="campus-switch">
          <span className="campus-icon">⌂</span>
          <span><small>YOUR COMMUNITY</small><strong>Campus space</strong></span>
          <span className="chevron">⌄</span>
        </div>

        <p className="nav-label">MENU</p>
        <nav className="main-nav" aria-label="Main navigation">
          {["Home", "Explore", "Groups", "Events", "Marketplace", "Messages"].map((label) => (
            <button key={label} type="button" className={`nav-item ${active === label ? "selected" : ""}`} onClick={() => chooseNav(label)}>
              <span className="nav-symbol"><NavIcon label={label}/></span><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-groups">
          <div className="sidebar-heading"><span className="nav-label">YOUR GROUPS</span><button aria-label="Add a group" onClick={() => setNotice("Group creation will be added in a later milestone.")}>＋</button></div>
          <button className="group-link" onClick={() => chooseNav("Groups")}><i className="group-dot dot-lime"/> Computer Science</button>
          <button className="group-link" onClick={() => chooseNav("Groups")}><i className="group-dot dot-blue"/> Campus Creators</button>
          <button className="group-link" onClick={() => chooseNav("Groups")}><i className="group-dot dot-orange"/> Book Exchange</button>
        </div>

        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon">✦</span><strong>Make campus yours</strong><p>Find your people, share ideas, and grow together.</p><button onClick={() => chooseNav("Explore")}>Explore community <span>↗</span></button></div>
          <button className={`profile-mini ${active === "My Profile" ? "selected" : ""}`} onClick={() => chooseNav("My Profile")}>
            <Avatar initials={(currentUser?.name || "YO").split(/\\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()} tone="avatar-me"/><span className="profile-info"><strong>{currentUser?.name || "Your profile"}</strong><small>Signed in · Sign out above</small></span><span className="more">•••</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Community</span><b>/</b><strong>{active}</strong></div>
          <div className="top-actions">
            <label className="searchbox"><span>⌕</span><input aria-label="Search CampusConnect" placeholder="Search campus..." onChange={() => {}}/><kbd>⌘ K</kbd></label>
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotice("You’re all caught up on notifications.")}>♧<i className="notification-dot"/></button>
            <button className="top-avatar" title="Signed in — click to sign out" onClick={logout}>{(currentUser?.name || "YO").split(/\\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</button>
                        
            <button
              className="icon-button theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title="Switch theme"
            >
              {theme === "light" ? "☾" : "☀"}
            </button>

          </div>
        </header>

        <div className="content-grid">
          <section className="feed-column">
            
{active === "Events" ? (
  <section className="events-page">
    <div className="section-heading">
      <div>
        <span className="eyebrow">YOUR CAMPUS</span>
        <h2>Campus Events</h2>
        <p>Discover what's happening around campus.</p>
      </div>
    </div>

    {eventsLoading && (
      <div className="notice" role="status">
        Loading campus events...
      </div>
    )}

    {eventsError && (
      <div className="notice" role="alert">
        {eventsError}
      </div>
    )}

    {!eventsLoading && !eventsError && events.length === 0 && (
      <div className="notice">
        No upcoming events available.
      </div>
    )}

    <div className="events-page-list">
      {events.map((event) => (
        <article className="panel event-page-card" key={event._id}>
          <span className="eyebrow">
            {event.category || "CAMPUS EVENT"}
          </span>

          <h3>{event.title}</h3>

          {event.startAt && (
            <p>
              <strong>Date:</strong>{" "}
              {new Date(event.startAt).toLocaleString()}
            </p>
          )}

          {event.location && (
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          )}
        </article>
      ))}
    </div>
  </section>
) : (
  <>

            <div className="welcome-row">
              <div><div className="eyebrow"><span className="online-pulse"/> YOUR CAMPUS, YOUR COMMUNITY</div><h1>Good morning, <em>{currentUser?.name?.split(" ")[0] || "student"}.</em></h1><p>What’s happening around campus today?</p></div>

            </div>

            <div className="section-heading"><div><span className="eyebrow">THE CONVERSATION</span><h2>Campus feed <span className="live-label">LIVE</span></h2></div><button className="filter-button" onClick={() => setNotice("Showing the latest community posts.")}>Latest <span>⌄</span></button></div>

            <form className="composer panel" onSubmit={publishPost}>
              
<div className="composer-top">
  <Avatar
    initials={
      (currentUser?.name || "YO")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    tone="avatar-me"
  />

  <textarea
    aria-label="Write a campus post"
    value={draft}
    onChange={(e) => {
      setDraft(e.target.value);
      setPublishError("");
    }}
    maxLength={2000}
    placeholder="Share something with your campus..."
  />
</div>
    
<div className="composer-bottom">
  <div className="composer-tools">
    <button
      type="button"
      onClick={() =>
        setNotice("Image attachments will be supported in a later milestone.")
      }
    >
      <span className="tool-symbol photo">▧</span> Photo
    </button>

    <button
      type="button"
      onClick={() => ("Event sharing will be connected later.")}
    >
      <span className="tool-symbol event">▦</span> Event
    </button>

    <button
      type="button"
      onClick={() => setNotice("Group tagging will be added later.")}
    >
      <span className="tool-symbol tag">⌗</span> Tag group
    </button>
  </div>

  <div>
    <span>{draft.length}/2000 </span>

    <button
      className="primary-button"
      type="submit"
      disabled={!draft.trim() || publishBusy}
    >
      {publishBusy ? "Publishing..." : "Post"}
      {!publishBusy && <span> ↗</span>}
    </button>
  </div>
</div>
</form>
{publishError && (
  <div className="notice" role="alert">
    {publishError}
  </div>
)}
            {notice && <div className="notice" role="status"><span>✦</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

            {postsLoading && <div className="notice" role="status">Loading posts from CampusConnect…</div>}
            {postsError && <div className="notice" role="alert">{postsError} <button onClick={() => setToken((current) => current)}>Retry</button></div>}
            {!postsLoading && !postsError && posts.length === 0 && <div className="notice">No posts yet. Be the first to share with your campus.</div>}
            <div className="post-list">
              {posts.map((post) => {
                const authorName = post.author?.name || "CampusConnect student";
                const initials = authorName.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CC";
                const created = post.createdAt ? new Date(post.createdAt).toLocaleString() : "Date unavailable";
                return (
                  <article className="post-card panel" key={post._id}>
                    <div className="post-header"><Avatar initials={initials}/><div className="post-author"><strong>{authorName}</strong><span>{created}</span></div><button className="post-menu" aria-label="More post options" onClick={() => setNotice("Post options will be connected with the API.")}>•••</button></div>
                    <p className="post-content">{post.content}</p>
                    {post.imageUrl && <img className="post-image" src={post.imageUrl} alt="Post attachment" loading="lazy"/>}
                    <div className="post-divider"/>
                    <div className="post-actions">
                      <button
                        type="button"
                        onClick={() => toggleLike(post._id)}
                        disabled={likeBusy[post._id]}
                        className={postLikes[post._id]?.likedByMe ? "liked" : ""}
                      >
                        <HeartIcon filled={Boolean(postLikes[post._id]?.likedByMe)} />
                        {postLikes[post._id]?.likedByMe ? "Liked" : "Like"}
                        {" "}
                        ({postLikes[post._id]?.likeCount ?? 0})
                      </button>

                     <button
                        type="button"
                        onClick={() => activeCommentsPostId === post._id ? setActiveCommentsPostId(null) : openComments(post._id)}
                      >
                        <MessageIcon /> Comment
                      </button>
                      

                      <button
                        type="button"
                        className="share-action"
                        onClick={() => setNotice("Sharing will be added later.")}
                      >
                        <span>↗</span> Share
                      </button>
                    </div>                  
                    
                    </article>
                );
              })}
              {activeCommentsPostId && (
                <section className="comments-panel" aria-label="Post comments">
                  <div className="comments-panel-heading">
                    <h3>Discussion</h3>
                    <button type="button" className="comments-close" onClick={() => setActiveCommentsPostId(null)} aria-label="Close comments">×</button>
                  </div>
                  {commentsLoading && <p className="comments-muted">Loading comments…</p>}
                  {commentError && <p className="comments-error" role="alert">{commentError}</p>}
                  {!commentsLoading && !commentError && (commentsByPost[activeCommentsPostId] || []).length === 0 && <p className="comments-muted">No comments yet. Start the conversation.</p>}
                  <div className="comments-list">
                    {(commentsByPost[activeCommentsPostId] || []).map((comment) => (
                      <article className="comment-item" key={comment._id}>
                        <div className="comment-meta"><strong>{comment.author?.name || "CampusConnect student"}</strong><time>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}</time></div>
                        <p>{comment.content}</p>
                      </article>
                    ))}
                  </div>
                  <form className="comment-form" onSubmit={submitComment}>
                    <input aria-label="Write a comment" value={commentDraft} maxLength={1000} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Write a thoughtful comment…" />
                    <button type="submit" disabled={!commentDraft.trim() || commentBusy}>{commentBusy ? "Sending…" : "Send"}</button>
                  </form>
                </section>
              )}
            </div>
         
{!postsLoading && posts.length > 0 && (
  <div className="load-more">
    Showing {posts.length} posts · {posts.length} loaded on this page
  </div>
)}
  </>
)}
</section>


          <aside className="right-column">
            <section className="side-panel group-panel">
              <div className="side-title"><div><span className="eyebrow">FIND YOUR PEOPLE</span><h2>Popular groups</h2></div><button className="text-link" onClick={() => chooseNav("Groups")}>See all ↗</button></div>
              <div className="popular-groups">
                {groups.map((group) => <div className="popular-group" key={group.title}><div className={`group-art ${group.tone}`}><span>{group.symbol}</span><i>✳</i></div><div className="popular-group-info"><strong>{group.title}</strong><small>{group.members}</small></div><button className={`join-button ${joined[group.title] ? "is-joined" : ""}`} onClick={() => setJoined((old) => ({ ...old, [group.title]: !old[group.title] }))}>{joined[group.title] ? "Joined ✓" : "＋ Join"}</button></div>)}
              </div>
              <button className="create-group" onClick={() => setNotice("Group creation is planned after the core MVP.")}><span className="create-plus">＋</span><span><strong>Create a group</strong><small>Start something meaningful</small></span><b>↗</b></button>
            </section>

            <section className="side-panel events-panel">
              <div className="side-title"><div><span className="eyebrow">SAVE YOUR SPOT</span><h2>Upcoming events</h2></div><button className="text-link" onClick={() => chooseNav("Events")}>View all ↗</button></div>
              <div className="events-list">{events.map((event) => <button className="event-row" key={event.title} onClick={() => (`${event.title}: event details will be connected later.`)}><span className="event-date"><small>{event.month}</small><strong>{event.day}</strong></span><span className="event-copy"><strong>{event.title}</strong><small>{event.detail}</small><i>{event.type}</i></span><span className="event-arrow">↗</span></button>)}</div>
            </section>

            <section className="side-panel marketplace-panel">
              <div className="side-title"><div><span className="eyebrow">PASS IT FORWARD</span><h2>Campus marketplace</h2></div><span className="market-icon">◇</span></div>
              <div className="market-feature"><div className="book-stack"><span>BOOK</span><b>DSA</b><i>✳</i></div><div className="market-copy"><span className="market-tag">STUDENT PICKS</span><strong>Good finds.<br/>New beginnings.</strong><p>Give your books a second chapter.</p></div></div>
              <button className="market-button" onClick={() => chooseNav("Marketplace")}>Explore marketplace <span>→</span></button>
            </section>

            <div className="community-note"><span>✦</span><p><strong>A little campus kindness goes a long way.</strong><br/>Be curious. Be thoughtful. Build each other up.</p></div>
            <footer className="side-footer">About · Guidelines · Privacy <span>© CampusConnect</span></footer>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
