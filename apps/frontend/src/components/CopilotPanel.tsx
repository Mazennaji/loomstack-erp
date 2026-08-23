import { useState, type FormEvent, useRef, useEffect } from 'react';
import { useCopilot } from '../hooks/useCopilot';
import loomBot from '../assets/loom-bot.png';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const copilot = useCopilot();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    copilot.mutate(input, {
      onSuccess: (data) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply || 'No response.' },
        ]);
      },
      onError: () => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Something went wrong. Try again in a moment.' },
        ]);
      },
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close LOOM' : 'Ask LOOM'}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-surface shadow-lg ring-1 ring-line transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="var(--color-navy)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ) : (
          <img src={loomBot} alt="LOOM" className="h-12 w-12 object-contain" />
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 flex h-[520px] w-96 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          style={{ animation: 'copilotRise 0.24s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <div className="relative flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-soft">
              <img src={loomBot} alt="" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <div className="font-display text-sm font-600 tracking-tight">LOOM</div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-done" />
                Online · LoomStack AI
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-lg border border-dashed border-line bg-paper/50 p-4">
                <p className="text-sm text-ink">Hi, I'm LOOM 👋</p>
                <p className="mt-1 text-sm text-muted">
                  Ask me about stock levels, MRP suggestions, or demand forecasts.
                </p>
                <div className="mt-3 space-y-1.5 font-mono text-[11px] text-muted/70">
                  <div>→ what's low on stock?</div>
                  <div>→ what should I produce next?</div>
                  <div>→ forecast demand for GADGET-X</div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ' +
                  (m.role === 'user'
                    ? 'ml-auto bg-navy text-surface'
                    : 'border border-line bg-paper text-ink')
                }
              >
                {m.content}
              </div>
            ))}

            {copilot.isPending && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-soft">
                  <img src={loomBot} alt="" className="h-5 w-5 object-contain" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask LOOM…"
                className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal-soft"
              />
              <button
                type="submit"
                disabled={copilot.isPending || !input.trim()}
                aria-label="Send"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-surface transition-colors hover:bg-navy/90 disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M14 8L2 2l2 6-2 6 12-6z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}