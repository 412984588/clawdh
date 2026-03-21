import { useState, useCallback } from "react";

type ClipboardStatus = "idle" | "copied" | "error";

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  status: ClipboardStatus;
  isCopied: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Copy text to clipboard with status feedback.
 * Automatically resets to "idle" after the timeout.
 *
 * @param resetAfterMs  Time in ms before status resets to idle (default: 2000)
 *
 * @example
 * const { copy, isCopied } = useClipboard()
 *
 * <button onClick={() => copy(apiKey)}>
 *   {isCopied ? 'Copied!' : 'Copy API Key'}
 * </button>
 */
export function useClipboard(resetAfterMs = 2000): UseClipboardReturn {
  const [status, setStatus] = useState<ClipboardStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          // Modern clipboard API (HTTPS required)
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for HTTP or older browsers
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const success = document.execCommand("copy");
          document.body.removeChild(textarea);
          if (!success) throw new Error("execCommand copy failed");
        }

        setStatus("copied");
        setError(null);

        if (resetAfterMs > 0) {
          setTimeout(reset, resetAfterMs);
        }

        return true;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setStatus("error");
        setError(e);

        if (resetAfterMs > 0) {
          setTimeout(reset, resetAfterMs);
        }

        return false;
      }
    },
    [reset, resetAfterMs]
  );

  return {
    copy,
    status,
    isCopied: status === "copied",
    error,
    reset,
  };
}

/**
 * Read from clipboard (requires user gesture + permissions).
 *
 * @example
 * const { read, text } = useClipboardRead()
 * <button onClick={read}>Paste from clipboard</button>
 */
export function useClipboardRead(): { read: () => Promise<void>; text: string | null; error: Error | null } {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async () => {
    try {
      const content = await navigator.clipboard.readText();
      setText(content);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  return { read, text, error };
}
