import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <nav>
        <div className="wrap nav-inner">
          <div className="logo">
            <div className="logo-mark">DC</div>
            Dump<span>Center</span>
          </div>
          <Link href="/tokens" className="btn btn-green btn-sm">
            Token Portal →
          </Link>
        </div>
      </nav>

      <main className="wrap" style={{ padding: "72px 0 64px" }}>
        <div className="kicker">Dump Center</div>
        <h1 className="hero-title">
          CMD tool lokaal.
          <br />
          <span style={{ color: "var(--accent)" }}>Tokens op Vercel.</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 12, maxWidth: 560 }}>
          De dump-tool draait via <span className="mono">dumper.bat</span> op je PC. Tokens worden
          centraal opgeslagen op Vercel — verwijder een token en de CMD tool werkt direct niet meer.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/tokens" className="btn btn-green">
            Beheer tokens →
          </Link>
        </div>

        <div className="card" style={{ marginTop: 32 }}>
          <div className="card-h">CMD setup</div>
          <div className="card-b">
            <div className="cmd">
              {`dumper.bat config --api https://jouw-app.vercel.app
dumper.bat login --token <TOKEN>
dumper.bat list --target IP:PORT
dumper.bat dump --target IP:PORT --all`}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
