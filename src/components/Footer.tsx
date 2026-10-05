// Shown on every page, matching Ballpark Projector's footer: who built it,
// and that it is an unofficial fan project using other people's logos.
export function Footer() {
  return (
    <footer className="border-t border-rule pt-5">
      <p className="text-sm">
        Built by{" "}
        <a href="https://wtrolinger.me" className="underline decoration-rule underline-offset-4 hover:decoration-ink">
          Will Trolinger
        </a>
      </p>
      <p className="mt-1 text-xs text-ink-dim">
        Unofficial fan project. Not affiliated with MLB, the NFL or the NCAA. Team logos from ESPN.
      </p>
    </footer>
  );
}
