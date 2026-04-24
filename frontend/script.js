// ─── API Configuration ──────────────────────────────────────────────────────
// For development: http://localhost:5000/api
// For production: Update to your Render backend URL
const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api"
  : "https://voting-system-backend-9xsy.onrender.com/api"; // Update with your Render URL

// ─── State ──────────────────────────────────────────────────────────────────
const state = {
  currentUser: null,          // voter object from backend
  selectedCandidateId: null,  // MongoDB _id of selected candidate
  selectedCandidateName: "",
  currentElectionId: null,    // MongoDB _id of active election
  lastTxHash: "",
  currentRole: "",            // ✅ FIX 1: always initialise so role is never undefined
};

// ─── DOM References ─────────────────────────────────────────────────────────
const views             = document.querySelectorAll(".view");
const alertBox          = document.getElementById("alertBox");
const registerHeading   = document.getElementById("registerHeading");
const candidateList     = document.getElementById("candidateList");
const castVoteButton    = document.getElementById("castVoteButton");
const goToVoteButton    = document.getElementById("goToVoteButton");
const modalOverlay      = document.getElementById("modalOverlay");
const modalTitle        = document.getElementById("modalTitle");
const modalMessage      = document.getElementById("modalMessage");
const modalActions      = document.getElementById("modalActions");
const dashboardName     = document.getElementById("dashboardName");
const dashboardRole     = document.getElementById("dashboardRole");
const dashboardWallet   = document.getElementById("dashboardWallet");
const voteStatusHeading = document.getElementById("voteStatusHeading");
const voteStatusCopy    = document.getElementById("voteStatusCopy");
const receiptId         = document.getElementById("receiptId");
const receiptCandidate  = document.getElementById("receiptCandidate");
const receiptStatus     = document.getElementById("receiptStatus");
const authShell         = document.getElementById("authShell");
const appShell          = document.getElementById("appShell");
const navItems          = document.querySelectorAll(".nav-item");
const electionSelector  = document.getElementById("electionSelector");
const electionSelectorWrap = document.getElementById("electionSelectorWrap");

// ─── API Helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────
function showView(viewId) {
  views.forEach((v) => v.classList.toggle("active", v.id === viewId));
  navItems.forEach((item) =>
    item.classList.toggle("active", item.dataset.viewTarget === viewId)
  );
  clearAlert();
}

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
}

function clearAlert() {
  alertBox.className = "alert hidden";
  alertBox.textContent = "";
}

function resetAuthForms() {
  document.getElementById("registerForm").reset();
  document.getElementById("signinForm").reset();
}

function showAuthenticatedApp(defaultView = "dashboardView") {
  document.body.classList.remove("auth-mode");
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  showView(defaultView);
}

function showAuthPortal(defaultView = "homeView") {
  document.body.classList.add("auth-mode");
  appShell.classList.add("hidden");
  authShell.classList.remove("hidden");
  showView(defaultView);
}

function openModal(title, message, actions) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalActions.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      action.variant === "secondary"
        ? "secondary-button wide-button"
        : "primary-button wide-button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      closeModal();
      if (action.onClick) action.onClick();
    });
    modalActions.appendChild(button);
  });

  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = loading ? "Please wait…" : button.dataset.originalText;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function renderDashboard() {
  const user = state.currentUser;

  dashboardName.textContent = user.name;
  dashboardRole.textContent = `Voter | Aadhar: ${user.aadharNumber}`;
  dashboardWallet.textContent = `Email: ${user.email}`;

  if (user.hasVoted) {
    voteStatusHeading.textContent = "Vote submitted";
    voteStatusCopy.textContent = "Your ballot has been recorded on the blockchain.";
    goToVoteButton.disabled = true;
    goToVoteButton.textContent = "Submission Complete";
  } else {
    voteStatusHeading.textContent = "Pending";
    voteStatusCopy.textContent = "You are eligible to cast your vote.";
    goToVoteButton.disabled = false;
    goToVoteButton.textContent = "Go to Official Ballot";
  }
}

// ─── Receipt ─────────────────────────────────────────────────────────────────
function renderReceipt() {
  if (state.lastTxHash) {
    receiptId.textContent = state.lastTxHash;
    receiptCandidate.textContent = state.selectedCandidateName || "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else if (state.currentUser && state.currentUser.lastVotedTxHash) {
    receiptId.textContent = state.currentUser.lastVotedTxHash;
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else {
    receiptId.textContent = "--";
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Pending";
  }
}

// ─── Ballot ───────────────────────────────────────────────────────────────────
async function loadElections() {
  const data = await apiFetch("/elections");
  return data.data || [];
}

async function loadBallot() {
  // ✅ FIX 2: Better loading state with spinner
  candidateList.innerHTML = `
    <div style="padding:2rem;text-align:center;color:var(--muted)">
      <p style="font-size:1rem;margin-bottom:0.5rem">⏳ Loading ballot…</p>
      <p style="font-size:0.8rem">This may take a moment if the server is waking up.</p>
    </div>`;

  let elections = [];
  try {
    elections = await loadElections();
  } catch (err) {
    // ✅ FIX 3: Retry button instead of silent failure
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">⚠️ Could not load elections. The server may be starting up.</p>
        <button onclick="loadBallot()" class="primary-button" style="padding:10px 24px;border-radius:12px">
          🔄 Retry
        </button>
      </div>`;
    return;
  }

  if (!elections.length) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--muted);margin-bottom:1rem">No elections found. Please check back later.</p>
        <button onclick="loadBallot()" class="secondary-button" style="padding:10px 24px;border-radius:12px">
          🔄 Refresh
        </button>
      </div>`;
    return;
  }

  // Show election selector if there are multiple
  if (elections.length > 1) {
    electionSelectorWrap.style.display = "block";
    electionSelector.innerHTML = elections
      .map((e) => `<option value="${e._id}">${e.title}</option>`)
      .join("");

    // use previously selected or default to first
    if (!state.currentElectionId) {
      state.currentElectionId = elections[0]._id;
    }
    electionSelector.value = state.currentElectionId;
  } else {
    electionSelectorWrap.style.display = "none";
    state.currentElectionId = elections[0]._id;
  }

  await renderCandidates(state.currentElectionId);
}

async function renderCandidates(electionId) {
  candidateList.innerHTML = "<p style='padding:1rem;color:var(--color-text-secondary)'>Loading candidates…</p>";

  try {
    const data = await apiFetch(`/candidates?electionId=${electionId}`);
    const candidates = data.candidates || [];

    if (!candidates.length) {
      candidateList.innerHTML = "<p style='padding:1rem;color:var(--color-text-secondary)'>No candidates registered for this election yet.</p>";
      return;
    }

    candidateList.innerHTML = "";
    candidateList.classList.toggle("scrollable", candidates.length > 4);

    candidates.forEach((candidate) => {
      const isNOTA = candidate.isNOTA || candidate.name === "None of the Above";
      const symbol = candidate.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");

      const card = document.createElement("button");
      card.type = "button";
      card.className = "candidate-card";
      if (isNOTA) {
        card.classList.add("nota");
      }
      card.dataset.candidateId = candidate._id;

      if (candidate._id === state.selectedCandidateId) {
        card.classList.add("selected");
      }

      card.innerHTML = `
        <div class="candidate-top">
          <div class="candidate-meta">
            <span class="card-overline">${isNOTA ? "Option" : "Candidate"}</span>
            <h3>${candidate.name}</h3>
            <p>${candidate.party || "Independent"}</p>
          </div>
          <div class="candidate-symbol">${symbol || "CA"}</div>
        </div>
        <div class="selection-row">
          <div class="selection-dot" aria-hidden="true"></div>
        </div>
      `;

      card.addEventListener("click", () => {
        state.selectedCandidateId = candidate._id;
        state.selectedCandidateName = `${candidate.name} (${candidate.party || "Independent"})`;
        renderCandidatesHighlight(candidates);
      });

      candidateList.appendChild(card);
    });

  } catch (err) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">⚠️ Could not load candidates: ${err.message}</p>
        <button onclick="renderCandidates('${electionId}')" class="primary-button" style="padding:10px 24px;border-radius:12px">
          🔄 Retry
        </button>
      </div>`;
  }
}

// Re-render just the selected highlight without re-fetching
function renderCandidatesHighlight(candidates) {
  document.querySelectorAll(".candidate-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.candidateId === state.selectedCandidateId);
  });
}

// ─── Role Selection ──────────────────────────────────────────────────────────
async function setRole(role) {
  state.currentRole = role;
  registerHeading.textContent =
    role === "candidate" ? "Register Candidate" : "Register Voter";

  document.getElementById("registerForm").reset();

  // Toggle field visibility based on role
  document.getElementById("aadharField").style.display = role === "voter" ? "" : "none";
  document.getElementById("dobField").style.display = role === "voter" ? "" : "none";
  document.getElementById("emailField").style.display = role === "voter" ? "" : "none";
  document.getElementById("partyField").style.display   = role === "candidate" ? "" : "none";
  document.getElementById("electionField").style.display = role === "candidate" ? "" : "none";

  // Set required attributes
  document.getElementById("registerAadhar").required = role === "voter";
  document.getElementById("registerDOB").required = role === "voter";
  document.getElementById("registerEmail").required  = role === "voter";
  document.getElementById("registerParty").required  = role === "candidate";
  document.getElementById("registerElection").required = role === "candidate";

  // Pre-load elections for candidate dropdown
  if (role === "candidate") {
    const elections = await loadElections();
    const select = document.getElementById("registerElection");
    if (elections.length) {
      select.innerHTML = elections
        .map((e) => `<option value="${e._id}">${e.title}</option>`)
        .join("");
    } else {
      select.innerHTML = "<option value=''>No elections available</option>";
    }
  }

  showView("registerFormView");
}

// ─── Registration ─────────────────────────────────────────────────────────────
document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  const name = document.getElementById("registerName").value.trim();

  try {
    if (state.currentRole === "voter") {
      const aadharNumber = document.getElementById("registerAadhar").value.trim();
      const dateOfBirth = document.getElementById("registerDOB").value;
      const email = document.getElementById("registerEmail").value.trim();

      // Validate Aadhar is 12 digits
      if (!/^\d{12}$/.test(aadharNumber)) {
        throw new Error("Aadhar number must be exactly 12 digits");
      }

      // Validate DOB is provided
      if (!dateOfBirth) {
        throw new Error("Date of birth is required");
      }

      // Calculate age and validate
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        throw new Error("You must be at least 18 years old to register as a voter");
      }

      if (dob > today) {
        throw new Error("Date of birth cannot be in the future");
      }

      await apiFetch("/voters", {
        method: "POST",
        body: JSON.stringify({ name, email, aadharNumber, dateOfBirth }),
      });

    } else {
      // candidate
      const party = document.getElementById("registerParty").value.trim();
      const electionId = document.getElementById("registerElection").value;

      await apiFetch("/candidates", {
        method: "POST",
        body: JSON.stringify({ name, party, electionId }),
      });
    }

    const registeredRole = state.currentRole; // ✅ FIX 2: capture role before reset
    event.target.reset();
    openModal(
      "Registration Complete",
      `${registeredRole === "voter" ? "Voter" : "Candidate"} registered successfully. You can now sign in with your ${registeredRole === "voter" ? "Aadhar number" : "credentials"}.`,
      [
        {
          // ✅ FIX 2: allow registering another person without navigating away
          label: registeredRole === "voter" ? "Register Another Voter" : "Register Another Candidate",
          onClick: () => {
            state.currentRole = registeredRole;
            document.getElementById("registerForm").reset();
            showView("registerFormView");
          }
        },
        {
          label: "Return to Welcome Page",
          variant: "secondary",
          onClick: () => showAuthPortal("homeView")
        }
      ]
    );

  } catch (err) {
    showAlert(err.message, "error");
  } finally {
    setLoading(submitBtn, false);
  }
});

// ─── Sign In ──────────────────────────────────────────────────────────────────
document.getElementById("signinForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  const aadharNumber = document.getElementById("signinAadhar").value.trim();

  try {
    // Validate Aadhar is 12 digits
    if (!/^\d{12}$/.test(aadharNumber)) {
      throw new Error("Aadhar number must be exactly 12 digits");
    }

    const data = await apiFetch(`/voters/lookup?aadharNumber=${encodeURIComponent(aadharNumber)}`);
    state.currentUser = data.voter;
    state.selectedCandidateId = null;
    state.lastTxHash = "";
    renderDashboard();
    showAuthenticatedApp("dashboardView");

    // u2705 FIX 1: Preload ballot in background after sign-in to wake up Render
    if (!state.currentUser.hasVoted) { loadBallot().catch(() => {}); }

  } catch (err) {
    showAlert(
      err.message === "Voter not found with this Aadhar number"
        ? "No voter found with this Aadhar number. Please register first."
        : err.message,
      "error"
    );
  } finally {
    setLoading(submitBtn, false);
  }
});

// ─── Navigation ───────────────────────────────────────────────────────────────
document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetView = button.dataset.viewTarget;

    if (["homeView", "registerChoiceView", "registerFormView", "signinView"].includes(targetView)) {
      resetAuthForms();
      state.selectedCandidateId = null;
      closeModal();
      // ✅ FIX 3: clear role when returning to choice screen so a fresh selection is always required
      if (targetView === "registerChoiceView" || targetView === "homeView") {
        state.currentRole = "";
      }
    }

    if (targetView === "dashboardView" && state.currentUser) {
      renderDashboard();
    }

    if (targetView === "ballotView" && state.currentUser && !state.currentUser.hasVoted) {
      state.selectedCandidateId = null;
      loadBallot();
    }

    if (targetView === "receiptView") {
      renderReceipt();
    }

    showView(targetView);
  });
});

// Role button clicks
document.querySelectorAll(".role-button").forEach((button) => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

// Election selector change
electionSelector.addEventListener("change", () => {
  state.currentElectionId = electionSelector.value;
  state.selectedCandidateId = null;
  renderCandidates(state.currentElectionId);
});

// Go to ballot button
goToVoteButton.addEventListener("click", () => {
  if (!state.currentUser || state.currentUser.hasVoted) return;
  state.selectedCandidateId = null;
  loadBallot();
  showAuthenticatedApp("ballotView");
});

// ─── Cast Vote ────────────────────────────────────────────────────────────────
castVoteButton.addEventListener("click", async () => {
  if (!state.selectedCandidateId) {
    openModal("Selection Required", "Please select one candidate before submitting the ballot.", [
      { label: "Return to Ballot", onClick: () => showAuthenticatedApp("ballotView") },
    ]);
    return;
  }

  setLoading(castVoteButton, true);

  try {
    const data = await apiFetch("/votes", {
      method: "POST",
      body: JSON.stringify({
        voterId: state.currentUser._id,
        candidateId: state.selectedCandidateId,
        electionId: state.currentElectionId,
      }),
    });

    // update local state
    state.currentUser.hasVoted = true;
    state.currentUser.lastVotedTxHash = data.txHash;
    state.lastTxHash = data.txHash;

    receiptId.textContent = data.txHash;
    receiptCandidate.textContent = state.selectedCandidateName || "--";
    receiptStatus.textContent = "Recorded on blockchain";

    renderDashboard();

    openModal("Vote Recorded Successfully", "Your vote has been submitted to the blockchain.", [
      { label: "View Receipt", onClick: () => showAuthenticatedApp("receiptView") },
      { label: "Back to Dashboard", variant: "secondary", onClick: () => showAuthenticatedApp("dashboardView") },
    ]);

  } catch (err) {
    openModal("Vote Failed", err.message, [
      { label: "Close", variant: "secondary", onClick: () => {} },
    ]);
  } finally {
    setLoading(castVoteButton, false);
  }
});

// ─── Sign Out ─────────────────────────────────────────────────────────────────
document.getElementById("signOutButton").addEventListener("click", () => {
  state.currentUser = null;
  state.selectedCandidateId = null;
  state.selectedCandidateName = "";
  state.lastTxHash = "";
  state.currentElectionId = null;
  state.currentRole = "";
  resetAuthForms();
  closeModal();
  showAuthPortal("homeView");
});

// ─── Init ─────────────────────────────────────────────────────────────────────
showAuthPortal("homeView");

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const ADMIN_AADHAR = "000000000000"; // 🔐 Change this to your admin Aadhar number

function isAdmin() {
  return state.currentUser && state.currentUser.aadharNumber === ADMIN_AADHAR;
}

function showAdminNav() {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin() ? "" : "none";
  });
}

async function loadAdminElections() {
  const list = document.getElementById("adminElectionList");
  list.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>Loading…</p>";
  try {
    const data = await apiFetch("/elections");
    const elections = data.data || [];
    if (!elections.length) {
      list.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>No elections yet. Create one above.</p>";
      return;
    }
    list.innerHTML = elections.map(e => `
      <div style="padding:12px 0;border-bottom:1px solid var(--line)">
        <strong style="font-size:1rem">${e.title}</strong>
        <p style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">
          Status: <b>${e.status}</b> &nbsp;|&nbsp;
          ${new Date(e.startDate).toLocaleDateString()} → ${new Date(e.endDate).toLocaleDateString()}
        </p>
      </div>
    `).join("");
  } catch (err) {
    list.innerHTML = `<p style='color:var(--danger);font-size:0.9rem'>Error: ${err.message}</p>`;
  }
}

document.getElementById("createElectionBtn").addEventListener("click", async () => {
  const title = document.getElementById("electionTitle").value.trim();
  const description = document.getElementById("electionDesc").value.trim();
  const startDate = document.getElementById("electionStart").value;
  const endDate = document.getElementById("electionEnd").value;
  const btn = document.getElementById("createElectionBtn");

  if (!title || !startDate || !endDate) {
    alert("Please fill in title, start date, and end date.");
    return;
  }
  if (new Date(endDate) <= new Date(startDate)) {
    alert("End date must be after start date.");
    return;
  }

  setLoading(btn, true);
  try {
    await apiFetch("/elections", {
      method: "POST",
      body: JSON.stringify({ title, description, startDate, endDate, status: "active" }),
    });
    // Clear form
    ["electionTitle","electionDesc","electionStart","electionEnd"].forEach(id => {
      document.getElementById(id).value = "";
    });
    await loadAdminElections();
    openModal("Election Created ✅", `"${title}" is now live. Candidates can register for it.`, [
      { label: "OK", onClick: () => {} }
    ]);
  } catch (err) {
    alert("Failed to create election: " + err.message);
  } finally {
    setLoading(btn, false);
  }
});

// Hook admin view into nav
const origShowView = showView;
document.querySelectorAll("[data-view-target='adminView']").forEach(btn => {
  btn.addEventListener("click", () => {
    loadAdminElections();
  });
});