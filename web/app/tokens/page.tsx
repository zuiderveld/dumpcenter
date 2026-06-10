"use client";

import Link from "next/link";
import { useState } from "react";

type TokenRow = {
  id: string;
  label: string;
  created: string;
  preview: string;
};

export default function TokensPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [validateStatus, setValidateStatus] = useState("");

  const [adminKey, setAdminKey] = useState("");
  const [label, setLabel] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [newToken, setNewToken] = useState("");
  const [rows, setRows] = useState<TokenRow[]>([]);

  async function validate() {
    if (!token.trim()) return;
    setValidateStatus("Controleren...");
    try {
      const res = await fetch("/api/token/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidateStatus(`Geldig — label: ${data.label || "User"}`);
      } else {
        setValidateStatus("Ongeldige of verwijderde token.");
      }
    } catch (e) {
      setValidateStatus(`Fout: ${e}`);
    }
  }

  async function loadTokens() {
    if (!adminKey.trim()) {
      setAdminStatus("Vul admin key in.");
      return;
    }
    setAdminStatus("Laden...");
    try {
      const res = await fetch("/api/tokens", {
        headers: { "X-Admin-Key": adminKey.trim() },
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminStatus("Admin key ongeldig.");
        return;
      }
      setRows(Array.isArray(data) ? data : []);
      setAdminStatus(`${(data || []).length} token(s) geladen.`);
    } catch (e) {
      setAdminStatus(`Fout: ${e}`);
    }
  }

  async function create() {
    if (!adminKey.trim()) return;
    setAdminStatus("Token aanmaken...");
    setNewToken("");
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey.trim(), label: label.trim() || "User" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminStatus("Aanmaken mislukt (admin key?).");
        return;
      }
      setNewToken(data.token);
      setAdminStatus(`Nieuwe token voor: ${data.label}`);
      loadTokens();
    } catch (e) {
      setAdminStatus(`Fout: ${e}`);
    }
  }

  async function remove(id: string) {
    if (!adminKey.trim()) return;
    if (!confirm("Token permanent verwijderen? De CMD tool werkt dan niet meer met deze token.")) return;
    try {
      const res = await fetch(`/api/tokens/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey.trim() },
      });
      if (res.ok) {
        setAdminStatus("Token verwijderd.");
        loadTokens();
      } else {
        setAdminStatus("Verwijderen mislukt.");
      }
    } catch (e) {
      setAdminStatus(`Fout: ${e}`);
    }
  }

  return (
    <>
      <nav>
        <div className="wrap nav-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">DC</div>
            Dump<span>Center</span>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
        </div>
      </nav>

      <main className="wrap" style={{ padding: "36px 0 64px" }}>
        <div style={{ marginBottom: 22 }}>
          <div className="kicker">Access</div>
          <h1 className="hero-title" style={{ fontSize: 26 }}>
            Token Portal
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, maxWidth: 560 }}>
            Maak tokens aan, sla ze centraal op, en verwijder ze wanneer iemand geen toegang meer mag hebben.
          </p>
        </div>

        <div className="card">
          <div className="card-h">Token valideren</div>
          <div className="card-b">
            <label className="lbl">Access token</label>
            <input
              className="inp"
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Plak je token"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-green" onClick={validate}>
                Valideren
              </button>
              <button className="btn btn-ghost" onClick={() => setShowToken((v) => !v)}>
                {showToken ? "Verberg" : "Toon"}
              </button>
            </div>
            {validateStatus && (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>{validateStatus}</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">Admin — tokens beheren</div>
          <div className="card-b">
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
              Admin key staat in Vercel als <span className="mono">ADMIN_KEY</span> environment variable.
            </p>
            <div className="grid-2" style={{ marginBottom: 10 }}>
              <div>
                <label className="lbl">Admin key</label>
                <input
                  className="inp"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="ADMIN_KEY"
                />
              </div>
              <div>
                <label className="lbl">Label (nieuwe gebruiker)</label>
                <input
                  className="inp"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Gebruiker 1"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-green btn-sm" onClick={create}>
                Nieuwe token
              </button>
              <button className="btn btn-ghost btn-sm" onClick={loadTokens}>
                Tokens laden
              </button>
            </div>
            {newToken && (
              <div
                className="mono"
                style={{
                  marginTop: 12,
                  wordBreak: "break-all",
                  color: "var(--accent)",
                  fontSize: 12,
                  padding: 12,
                  background: "var(--surface2)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                {newToken}
              </div>
            )}
            <div className="token-list">
              {rows.map((r) => (
                <div className="token-row" key={r.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.label}</div>
                    <div className="mono" style={{ color: "var(--muted)", marginTop: 2, fontSize: 12 }}>
                      {r.preview} · {r.created}
                    </div>
                  </div>
                  <button className="btn btn-red btn-sm" onClick={() => remove(r.id)}>
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>
            {adminStatus && (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>{adminStatus}</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
