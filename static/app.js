const state = {
  lastScore: null,
  lastListing: null,
  lastCosts: null,
};

function $(sel) {
  return document.querySelector(sel);
}

function money(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString()}`;
}

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $(`#panel-${btn.dataset.tab}`).classList.add("active");
    if (btn.dataset.tab === "inventory") loadInventory();
  });
});

const freeBox = $('#score-form [name="free"]');
const priceInput = $('#score-form [name="price"]');
freeBox.addEventListener("change", () => {
  if (freeBox.checked) {
    priceInput.value = "0";
  }
});

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

function formListing(form) {
  const fd = new FormData(form);
  const num = (k) => {
    const v = fd.get(k);
    if (v === "" || v == null) return null;
    return Number(v);
  };
  const free = fd.get("free") === "on";
  return {
    title: String(fd.get("title") || ""),
    description: String(fd.get("description") || ""),
    price: free ? 0 : Number(fd.get("price") || 0),
    free,
    couch_type: String(fd.get("couch_type") || "unknown"),
    condition: String(fd.get("condition") || "unknown"),
    material: String(fd.get("material") || "unknown"),
    brand_hint: String(fd.get("brand_hint") || ""),
    distance_miles: num("distance_miles"),
    pets_or_smoke: fd.get("pets_or_smoke") === "on",
    dimensions: {
      length_in: num("length_in"),
      depth_in: num("depth_in"),
      height_in: num("height_in"),
      modular: String(fd.get("couch_type")) === "sectional",
      pieces: String(fd.get("couch_type")) === "sectional" ? 3 : 1,
    },
  };
}

function renderScore(data) {
  const fitClass = data.fit.fits ? "yes" : "no";
  const fitText = data.fit.fits
    ? `Fits trailer · ${data.fit.orientation || "ok"}`
    : "Does not fit trailer";
  const profitClass = data.estimated_profit_mid >= 0 ? "pos" : "neg";
  const reasons = (data.reasons || []).map((r) => `<li>${escapeHtml(r)}</li>`).join("");
  const warnings = (data.warnings || []).map((w) => `<li>${escapeHtml(w)}</li>`).join("");
  const tips = (data.fit.tips || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");

  $("#score-result").classList.remove("empty");
  $("#score-result").innerHTML = `
    <div class="grade-row">
      <div class="grade ${escapeHtml(data.grade)}">${escapeHtml(data.grade)}</div>
      <div>
        <div class="score-num">${data.score}/100 deal score</div>
        <span class="fit-badge ${fitClass}">${escapeHtml(fitText)}</span>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><span>Est. profit (mid)</span><strong class="${profitClass}">${money(data.estimated_profit_mid)}</strong></div>
      <div class="metric"><span>All-in cost</span><strong>${money(data.all_in_cost)}</strong></div>
      <div class="metric"><span>Resale range</span><strong>${money(data.valuation.low)}–${money(data.valuation.high)}</strong></div>
      <div class="metric"><span>List / ask</span><strong>${money(data.recommended_list_price)} / ${money(data.recommended_ask_price)}</strong></div>
    </div>
    ${reasons ? `<div class="list-block"><h3>Why</h3><ul>${reasons}</ul></div>` : ""}
    ${warnings ? `<div class="list-block warn"><h3>Watch-outs</h3><ul>${warnings}</ul></div>` : ""}
    ${tips ? `<div class="list-block"><h3>Haul tips</h3><ul>${tips}</ul></div>` : ""}
    <p class="muted" style="margin:0.85rem 0 0;font-size:0.85rem">Fit confidence: ${escapeHtml(data.fit.confidence)}. Valuation is heuristic comps — adjust to your local market.</p>
  `;
  $("#save-to-inventory").disabled = false;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

$("#score-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const listing = formListing(form);
  const fd = new FormData(form);
  const body = {
    listing,
    gas_cost: Number(fd.get("gas_cost") || 0),
    cleaning_cost: Number(fd.get("cleaning_cost") || 0),
    other_cost: Number(fd.get("other_cost") || 0),
    labor_hours: Number(fd.get("labor_hours") || 0),
    labor_rate: Number(fd.get("labor_rate") || 0),
  };
  try {
    const data = await api("/api/score", { method: "POST", body: JSON.stringify(body) });
    state.lastScore = data;
    state.lastListing = listing;
    state.lastCosts = body;
    renderScore(data);
  } catch (err) {
    $("#score-result").classList.remove("empty");
    $("#score-result").innerHTML = `<p class="muted">Score failed: ${escapeHtml(err.message)}</p>`;
  }
});

$("#save-to-inventory").addEventListener("click", async () => {
  if (!state.lastScore || !state.lastListing) return;
  const s = state.lastScore;
  try {
    await api("/api/inventory", {
      method: "POST",
      body: JSON.stringify({
        listing: state.lastListing,
        status: "watching",
        buy_price: s.buy_price,
        all_in_cost: s.all_in_cost,
        list_price: s.recommended_list_price,
        score: s.score,
        grade: s.grade,
        estimated_profit: s.estimated_profit_mid,
        notes: "",
      }),
    });
    $("#save-to-inventory").textContent = "Saved";
    setTimeout(() => {
      $("#save-to-inventory").textContent = "Save to inventory";
    }, 1500);
  } catch (err) {
    alert("Could not save: " + err.message);
  }
});

$("#hunt-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    location: String(fd.get("location") || ""),
    max_price: Number(fd.get("max_price") || 75),
    radius_miles: Number(fd.get("radius_miles") || 40),
    free_only: fd.get("free_only") === "on",
    query: "couch",
  };
  try {
    const data = await api("/api/search-links", { method: "POST", body: JSON.stringify(body) });
    const fb = (data.facebook || [])
      .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
      .join("");
    const cl = (data.craigslist || [])
      .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`)
      .join("");
    const tips = (data.tips || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    $("#hunt-results").innerHTML = `
      <div class="link-group">
        <h2>Facebook Marketplace</h2>
        <div class="link-list">${fb}</div>
      </div>
      <div class="link-group">
        <h2>Craigslist</h2>
        <div class="link-list">${cl}</div>
        <p class="tips">If the Craigslist subdomain looks wrong, open craigslist.org and pick your city, then search furniture.</p>
      </div>
      <div class="link-group">
        <h2>Playbook</h2>
        <ul class="tips">${tips}</ul>
      </div>
    `;
  } catch (err) {
    $("#hunt-results").innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
  }
});

const STATUSES = [
  "watching",
  "contacted",
  "scheduled",
  "picked_up",
  "cleaning",
  "listed",
  "sold",
  "passed",
];

async function loadInventory() {
  try {
    const data = await api("/api/inventory");
    const s = data.summary || {};
    $("#inventory-summary").innerHTML = `
      <div class="stat"><span>Deals tracked</span><strong>${s.count || 0}</strong></div>
      <div class="stat"><span>Sold</span><strong>${s.sold_count || 0}</strong></div>
      <div class="stat"><span>Realized profit</span><strong>${money(s.realized_profit || 0)}</strong></div>
      <div class="stat"><span>Capital in stock</span><strong>${money(s.capital_in_active_inventory || 0)}</strong></div>
    `;
    if (!data.items?.length) {
      $("#inventory-list").innerHTML = `<p class="muted">No inventory yet. Score a deal and hit Save.</p>`;
      return;
    }
    $("#inventory-list").innerHTML = data.items
      .map((item) => {
        const title = item.listing?.title || "Untitled";
        const opts = STATUSES.map(
          (st) =>
            `<option value="${st}" ${item.status === st ? "selected" : ""}>${st.replaceAll("_", " ")}</option>`
        ).join("");
        return `
        <article class="inv-card" data-id="${escapeHtml(item.id)}">
          <header>
            <h3>${escapeHtml(title)}</h3>
            <div class="inv-meta">${item.grade || "—"} · ${item.score ?? "—"}/100 · buy ${money(item.buy_price)} · est ${money(item.estimated_profit)}</div>
          </header>
          <div class="inv-actions">
            <select class="status-select">${opts}</select>
            <input class="sold-input" type="number" min="0" step="1" placeholder="Sold $" value="${item.sold_price ?? ""}" style="max-width:7rem" />
            <button type="button" class="btn small save-inv">Update</button>
            <button type="button" class="btn small del-inv">Delete</button>
          </div>
        </article>`;
      })
      .join("");

    $("#inventory-list").querySelectorAll(".save-inv").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest(".inv-card");
        const id = card.dataset.id;
        const status = card.querySelector(".status-select").value;
        const soldRaw = card.querySelector(".sold-input").value;
        const payload = { status };
        if (soldRaw !== "") {
          payload.sold_price = Number(soldRaw);
          if (status !== "sold") payload.status = "sold";
        }
        await api(`/api/inventory/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
        loadInventory();
      });
    });
    $("#inventory-list").querySelectorAll(".del-inv").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.closest(".inv-card").dataset.id;
        if (!confirm("Delete this item?")) return;
        await api(`/api/inventory/${id}`, { method: "DELETE" });
        loadInventory();
      });
    });
  } catch (err) {
    $("#inventory-list").innerHTML = `<p class="muted">${escapeHtml(err.message)}</p>`;
  }
}

async function init() {
  try {
    const health = await api("/api/health");
    if (health.default_city) {
      $("#hunt-location").value = health.default_city;
      $("#hunt-location").placeholder = health.default_city;
    }
  } catch {
    /* app may still work for static bits */
  }
}

init();
