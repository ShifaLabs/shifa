"use client";

import { memo, useEffect, useRef } from "react";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function ChatPanel({ messages, inputValue, onInputChange, onSend }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto pr-1">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "max-w-[82%] rounded-2xl px-3 py-2",
              msg.mine
                ? "ml-auto bg-primary/20 text-foreground"
                : "bg-muted/60 text-foreground/90",
            )}
          >
            <p className="mb-1 text-[11px] text-muted-foreground">{msg.sender}</p>
            <p className="text-sm">{msg.text}</p>
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {msg.timestamp}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSend();
          }}
          aria-label="Type a chat message"
          placeholder="Type a message"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onSend}
          className="rounded-xl border border-primary/40 bg-primary/20 px-3 text-sm text-primary-foreground hover:bg-primary/30"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default memo(ChatPanel);
