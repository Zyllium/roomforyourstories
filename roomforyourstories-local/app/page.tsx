"use client";
import { useEffect, useState } from "react";
export default function Home() {
  const [story, setStory] = useState("");
  const [consent, setConsent] = useState(true);
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [website, setWebsite] = useState("");
  useEffect(() => {
    setRequestId(crypto.randomUUID());
    fetch("/api/share")
      .then((r) => r.json())
      .then((d) => setReady((d as { ready: boolean }).ready))
      .catch(() => setReady(false));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story, consent, requestId, website }),
      });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(d.error || "Could not submit.");
      setStory("");
      setPosted(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Connection unavailable. Your text is still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell">
      <header>
        <a className="brand" href="/">
          YOU ARE HEARD<span>MY VOICE</span>
        </a>
        <nav>
          <a href="/stories">Read stories</a>
        </nav>
      </header>
      <section className="workspace">
        <aside>
          <div className="eyebrow">A place for your words</div>
          <h1>
            Your story.
            <br />
            In your own voice.
          </h1>
          <p>
            Share with the You Are Heard community. 
            <br/>
            This website was created so that people can anonymously share their experiences of sexual trauuma. 
            <br/>
            As a surviour, I would like to show others that it does get better, and you can make a difference.
          </p>
          <div className="aside-note">
            <span className="note-line" />
            <p>
              No name. No email.
              <br />
              Share only what you choose.
            </p>
          </div>
        </aside>
        <div className="card">
          {posted ? (
            <div className="success" role="status">
              <div className="success-mark">✓</div>
              <h2>Your story has been shared.</h2>
              <p>
                It is now posted in the public stories page. Your name and contact
                details were not requested.
              </p>
              <button
                onClick={() => {
                  setPosted(false);
                  setConsent(true);
                  setRequestId(crypto.randomUUID());
                }}
              >
                Share another story
              </button>
            </div>
          ) : (
            <>
              <div className="card-heading">
                <h2>Share your story</h2>
                <span>01 / WRITE</span>
              </div>
              <p className="intro">
                Your story will be publicly readable on this website. Do not include identifying details if you want
                your post to stay anonymous. Please do not include any full names or addresses.
              </p>
              {ready === false && (
                <div className="notice" role="status">
                  Submissions are not open yet. Please come back later.
                </div>
              )}
              <form onSubmit={submit}>
                <label htmlFor="story">Your words</label>
                <textarea
                  id="story"
                  placeholder="Start wherever you feel comfortable…"
                  value={story}
                  onChange={(e) => {
                    setStory(e.target.value);
                    if (error) {
                      setError("");
                      setRequestId(crypto.randomUUID());
                    }
                  }}
                  required
                />
                <div className="under-field">
                  <span>No identifying information is required.</span>
                </div>
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                </div>
                
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy || !ready || !story.trim() || !consent}
                >
                  {busy ? "Sharing your story…" : "Share my story"}
                </button>
                <p className="fine">Stories are stored in our website database. Hosting providers may process technical connection data.</p>
              </form>
            </>
          )}
        </div>
      </section>
      <footer>
        <span>MY VOICE / YOU ARE HEARD</span>
        <span>Take your time. You decide what to share.</span>
      </footer>
    </main>
  );
}
