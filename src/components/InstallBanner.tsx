import { useEffect, useState } from "react";

const KEY = "wsr-install-hint-v1";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const ios = Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

function deviceKind(): "ios" | "android" | "other" {
  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [hidden, setHidden] = useState(true);
  const [kind, setKind] = useState<"ios" | "android" | "other">("other");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(KEY) === "1") {
      setHidden(true);
      return;
    }
    setKind(deviceKind());
    setHidden(false);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    localStorage.setItem(KEY, "1");
    setHidden(true);
  }

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setHidden(true);
  }

  const how =
    kind === "ios"
      ? "Safari: tap Share, then Add to Home Screen. Chrome on iPhone cannot do this — open this page in Safari."
      : kind === "android"
        ? "Chrome: tap Install, or the menu (⋮) → Add to Home Screen."
        : "On a phone, open this page in Safari (iPhone) or Chrome (Android) and add it to the Home Screen.";

  return (
    <div className="banner install">
      <p>
        <strong>Add to Home Screen.</strong> {how}
      </p>
      <div className="install-actions">
        {installEvent ? (
          <button type="button" onClick={() => void install()}>
            Install
          </button>
        ) : null}
        <button type="button" className="ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
