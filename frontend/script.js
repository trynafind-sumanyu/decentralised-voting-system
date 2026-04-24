// ─── API Configuration ──────────────────────────────────────────────────────
// For development: http://localhost:5000/api
// For production: Update to your Render backend URL
const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api"
  : "https://decentralised-voting-system-eta.vercel.app/"; // Update with your Render URL

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
  try {
    const data = await apiFetch("/elections");
    const elections = data.data || [];
    return elections;
  } catch (err) {
    showAlert("Could not load elections: " + err.message, "error");
    return [];
  }
}

async function loadBallot() {
  candidateList.innerHTML = "<p style='padding:1rem;color:var(--color-text-secondary)'>Loading candidates…</p>";

  const elections = await loadElections();

  if (!elections.length) {
    candidateList.innerHTML = "<p style='padding:1rem;color:var(--color-text-secondary)'>No elections found.</p>";
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
    candidateList.innerHTML = `<p style='padding:1rem;color:var(--color-text-danger)'>Error: ${err.message}</p>`;
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