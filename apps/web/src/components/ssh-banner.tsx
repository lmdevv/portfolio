import clsx from "clsx/lite";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconCheck, IconCopy, IconTerminal2, IconX } from "@tabler/icons-react";

const SEEN_KEY = "ssh-banner-seen";
const SHOW_DELAY_MS = 1200;
const VISIBLE_MS = 10_000;
const COPIED_MS = 2000;

export default function SshBanner({ command }: { command: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setIsVisible(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  function copy() {
    navigator.clipboard.writeText(command).then(
      () => setIsCopied(true),
      () => {},
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ filter: "blur(20px)", opacity: 0, y: -16 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          exit={{ filter: "blur(20px)", opacity: 0, y: -16 }}
          transition={{ ease: "easeInOut", duration: 0.4 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="fixed z-40 top-4 inset-x-4 sm:top-8 sm:left-auto sm:right-8 sm:w-md overflow-hidden rounded-2xl border border-zinc-100/10 bg-zinc-900/70 backdrop-blur-md shadow-2xl"
        >
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="flex items-center gap-2 text-zinc-300">
                <IconTerminal2 size={20} className="shrink-0 text-zinc-100" aria-hidden />
                you can SSH into this site btw
              </p>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-white hover:bg-zinc-100/20 cursor-pointer transition-colors"
              >
                <IconX size={16} aria-hidden />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl bg-zinc-950/80 pl-4 pr-1 py-1 font-mono text-sm">
              <code className="select-all text-zinc-100 truncate">
                <span className="text-zinc-500 select-none">$ </span>
                {command}
              </code>
              <button
                type="button"
                onClick={copy}
                aria-label={isCopied ? "Copied" : "Copy command"}
                className={clsx(
                  "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans cursor-pointer transition-colors",
                  isCopied
                    ? "text-zinc-900 bg-zinc-100"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-100/20",
                )}
              >
                {isCopied ? (
                  <IconCheck size={16} aria-hidden />
                ) : (
                  <IconCopy size={16} aria-hidden />
                )}
                {isCopied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div
            onAnimationEnd={() => setIsVisible(false)}
            style={{
              animationDuration: `${VISIBLE_MS}ms`,
              animationPlayState: isPaused ? "paused" : "running",
            }}
            className="h-0.5 origin-left bg-zinc-100/40 animate-countdown"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
