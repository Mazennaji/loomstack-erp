import { useState, type FormEvent, useRef, useEffect } from 'react';
import { useCopilot } from '../hooks/useCopilot';
import logo from '../assets/logo.png';

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
        aria-label={open ? 'Close copilot' : 'Open copilot'}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-surface shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v7a2.5 2.5 0 01-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 014 12.5v-7z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 flex h-[520px] w-96 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          style={{ animation: 'copilotRise 0.24s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <div className="relative flex items-center gap-2.5 border-b border-line px-4 py-3">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-signal" />
            <img src={logo} alt="" className="h-6 w-6" />
            <div>
              <div className="font-display text-sm font-600 tracking-tight">Copilot</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                LoomStack ERP
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-lg border border-dashed border-line bg-paper/50 p-4">
                <p className="text-sm text-muted">
                  Ask about stock levels, MRP suggestions, or demand forecasts.
                </p>
                <div className="mt-3 space-y-1.5 font-mono text-[11px] text-muted/70">
                  <div>→ what's low on stock?</div>
                  <div>→ what should I produce next?</div>
                  <div>→ forecast demand for BIKE-01</div>
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
              <div className="flex items-center gap-1.5 px-1 text-muted">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
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