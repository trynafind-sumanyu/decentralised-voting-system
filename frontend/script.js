const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://voting-system-backend-9xsy.onrender.com/api";

const ADMIN_TOKEN_KEY = "voting_admin_token";

const state = {
  currentUser: null,
  selectedCandidateId: null,
  selectedCandidateName: "",
  currentElectionId: null,
  lastTxHash: "",
  currentRole: "",
  adminToken: localStorage.getItem(ADMIN_TOKEN_KEY) || "",
  adminUser: null,
};

const views = document.querySelectorAll(".view");
const alertBox = document.getElementById("alertBox");
const registerHeading = document.getElementById("registerHeading");
const candidateList = document.getElementById("candidateList");
const castVoteButton = document.getElementById("castVoteButton");
const goToVoteButton = document.getElementById("goToVoteButton");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalActions = document.getElementById("modalActions");
const dashboardName = document.getElementById("dashboardName");
const dashboardRole = document.getElementById("dashboardRole");
const dashboardWallet = document.getElementById("dashboardWallet");
const voteStatusHeading = document.getElementById("voteStatusHeading");
const voteStatusCopy = document.getElementById("voteStatusCopy");
const receiptId = document.getElementById("receiptId");
const receiptCandidate = document.getElementById("receiptCandidate");
const receiptStatus = document.getElementById("receiptStatus");
const authShell = document.getElementById("authShell");
const appShell = document.getElementById("appShell");
const navItems = document.querySelectorAll(".nav-item");
const voterOnlyNavItems = document.querySelectorAll(".voter-only");
const adminOnlyNavItems = document.querySelectorAll(".admin-only");
const electionSelector = document.getElementById("electionSelector");
const electionSelectorWrap = document.getElementById("electionSelectorWrap");
const adminUsernameDisplay = document.getElementById("adminUsernameDisplay");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLogoutButton = document.getElementById("adminLogoutButton");

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function showView(viewId) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.viewTarget === viewId);
  });
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
  adminLoginForm.reset();
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = loading ? "Please wait..." : button.dataset.originalText;
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function openModal(title, message, actions) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalActions.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.variant === "secondary"
      ? "secondary-button wide-button"
      : "primary-button wide-button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      closeModal();
      if (action.onClick) {
        action.onClick();
      }
    });
    modalActions.appendChild(button);
  });

  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function showAuthenticatedApp(defaultView = "dashboardView") {
  document.body.classList.remove("auth-mode");
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  updateAdminUI();
  showView(defaultView);
}

function showAuthPortal(defaultView = "homeView") {
  document.body.classList.add("auth-mode");
  appShell.classList.add("hidden");
  authShell.classList.remove("hidden");
  showView(defaultView);
}

function persistAdminSession(token, admin) {
  state.adminToken = token;
  state.adminUser = admin;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  updateAdminUI();
}

function clearAdminSession() {
  state.adminToken = "";
  state.adminUser = null;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  updateAdminUI();
}

function isAdminAuthenticated() {
  return Boolean(state.adminToken && state.adminUser);
}

function updateAdminUI() {
  const adminVisible = isAdminAuthenticated();
  adminOnlyNavItems.forEach((element) => {
    element.style.display = adminVisible ? "" : "none";
  });

  voterOnlyNavItems.forEach((element) => {
    element.style.display = state.currentUser ? "" : "none";
  });

  adminUsernameDisplay.textContent = state.adminUser?.username || "-";
}

async function verifyStoredAdminSession() {
  if (!state.adminToken) {
    updateAdminUI();
    return false;
  }

  try {
    const data = await apiFetch("/admin/session", {
      headers: {
        Authorization: `Bearer ${state.adminToken}`,
      },
    });
    state.adminUser = data.admin;
    updateAdminUI();
    return true;
  } catch (error) {
    clearAdminSession();
    return false;
  }
}

function getAdminHeaders() {
  return state.adminToken
    ? { Authorization: `Bearer ${state.adminToken}` }
    : {};
}

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

function renderReceipt() {
  if (state.lastTxHash) {
    receiptId.textContent = state.lastTxHash;
    receiptCandidate.textContent = state.selectedCandidateName || "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else if (state.currentUser?.lastVotedTxHash) {
    receiptId.textContent = state.currentUser.lastVotedTxHash;
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else {
    receiptId.textContent = "--";
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Pending";
  }
}

async function loadElections() {
  const data = await apiFetch("/elections");
  return data.data || [];
}

async function renderCandidates(electionId) {
  candidateList.innerHTML = "<p style='padding:1rem;color:var(--muted)'>Loading candidates...</p>";

  try {
    const data = await apiFetch(`/candidates?electionId=${encodeURIComponent(electionId)}`);
    const candidates = data.candidates || [];

    if (!candidates.length) {
      candidateList.innerHTML = "<p style='padding:1rem;color:var(--muted)'>No candidates registered for this election yet.</p>";
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
        .map((part) => part[0].toUpperCase())
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
        document.querySelectorAll(".candidate-card").forEach((candidateCard) => {
          candidateCard.classList.toggle(
            "selected",
            candidateCard.dataset.candidateId === state.selectedCandidateId
          );
        });
      });

      candidateList.appendChild(card);
    });
  } catch (error) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">Could not load candidates: ${error.message}</p>
        <button type="button" id="retryCandidatesButton" class="primary-button" style="padding:10px 24px;border-radius:12px">
          Retry
        </button>
      </div>
    `;
    document.getElementById("retryCandidatesButton").addEventListener("click", () => {
      renderCandidates(electionId);
    });
  }
}

async function loadBallot() {
  candidateList.innerHTML = `
    <div style="padding:2rem;text-align:center;color:var(--muted)">
      <p style="font-size:1rem;margin-bottom:0.5rem">Loading ballot...</p>
      <p style="font-size:0.8rem">This may take a moment if the server is waking up.</p>
    </div>
  `;

  let elections = [];
  try {
    elections = await loadElections();
  } catch (error) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">Could not load elections. The server may be starting up.</p>
        <button type="button" id="retryBallotButton" class="primary-button" style="padding:10px 24px;border-radius:12px">
          Retry
        </button>
      </div>
    `;
    document.getElementById("retryBallotButton").addEventListener("click", loadBallot);
    return;
  }

  if (!elections.length) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--muted);margin-bottom:1rem">No elections found. Please check back later.</p>
      </div>
    `;
    return;
  }

  if (elections.length > 1) {
    electionSelectorWrap.style.display = "block";
    electionSelector.innerHTML = elections
      .map((election) => `<option value="${election._id}">${election.title}</option>`)
      .join("");

    if (!state.currentElectionId || !elections.some((election) => election._id === state.currentElectionId)) {
      state.currentElectionId = elections[0]._id;
    }
    electionSelector.value = state.currentElectionId;
  } else {
    electionSelectorWrap.style.display = "none";
    state.currentElectionId = elections[0]._id;
  }

  await renderCandidates(state.currentElectionId);
}

async function setRole(role) {
  state.currentRole = role;
  registerHeading.textContent = role === "candidate" ? "Register Candidate" : "Register Voter";
  document.getElementById("registerForm").reset();

  document.getElementById("aadharField").style.display = role === "voter" ? "" : "none";
  document.getElementById("dobField").style.display = role === "voter" ? "" : "none";
  document.getElementById("emailField").style.display = role === "voter" ? "" : "none";
  document.getElementById("partyField").style.display = role === "candidate" ? "" : "none";
  document.getElementById("electionField").style.display = role === "candidate" ? "" : "none";

  document.getElementById("registerAadhar").required = role === "voter";
  document.getElementById("registerDOB").required = role === "voter";
  document.getElementById("registerEmail").required = role === "voter";
  document.getElementById("registerParty").required = role === "candidate";
  document.getElementById("registerElection").required = role === "candidate";

  if (role === "candidate") {
    const elections = await loadElections();
    const select = document.getElementById("registerElection");
    if (elections.length) {
      select.innerHTML = elections
        .map((election) => `<option value="${election._id}">${election.title}</option>`)
        .join("");
    } else {
      select.innerHTML = "<option value=''>No elections available</option>";
    }
  }

  showView("registerFormView");
}

async function loadAdminElections() {
  const list = document.getElementById("adminElectionList");
  list.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>Loading...</p>";

  try {
    const data = await apiFetch("/elections");
    const elections = data.data || [];

    if (!elections.length) {
      list.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>No elections yet. Create one above.</p>";
      return;
    }

    list.innerHTML = elections.map((election) => `
      <div style="padding:12px 0;border-bottom:1px solid var(--line)">
        <strong style="font-size:1rem">${election.title}</strong>
        <p style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">
          Status: <b>${election.status}</b> | ${new Date(election.startDate).toLocaleDateString()} to ${new Date(election.endDate).toLocaleDateString()}
        </p>
        <p style="margin:6px 0 0;font-size:0.82rem;color:var(--muted)">${election.description || "No description provided."}</p>
      </div>
    `).join("");
  } catch (error) {
    list.innerHTML = `<p style='color:var(--danger);font-size:0.9rem'>Error: ${error.message}</p>`;
  }
}

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

      if (!/^\d{12}$/.test(aadharNumber)) {
        throw new Error("Aadhar number must be exactly 12 digits");
      }

      if (!dateOfBirth) {
        throw new Error("Date of birth is required");
      }

      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
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
      const party = document.getElementById("registerParty").value.trim();
      const electionId = document.getElementById("registerElection").value;

      await apiFetch("/candidates", {
        method: "POST",
        body: JSON.stringify({ name, party, electionId }),
      });
    }

    const registeredRole = state.currentRole;
    event.target.reset();
    openModal(
      "Registration Complete",
      `${registeredRole === "voter" ? "Voter" : "Candidate"} registered successfully.`,
      [
        {
          label: registeredRole === "voter" ? "Register Another Voter" : "Register Another Candidate",
          onClick: () => {
            state.currentRole = registeredRole;
            document.getElementById("registerForm").reset();
            showView("registerFormView");
          },
        },
        {
          label: "Return to Welcome Page",
          variant: "secondary",
          onClick: () => showAuthPortal("homeView"),
        },
      ]
    );
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    setLoading(submitBtn, false);
  }
});

document.getElementById("signinForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  const aadharNumber = document.getElementById("signinAadhar").value.trim();

  try {
    if (!/^\d{12}$/.test(aadharNumber)) {
      throw new Error("Aadhar number must be exactly 12 digits");
    }

    const data = await apiFetch(`/voters/lookup?aadharNumber=${encodeURIComponent(aadharNumber)}`);
    state.currentUser = data.voter;
    state.selectedCandidateId = null;
    state.selectedCandidateName = "";
    state.lastTxHash = "";
    renderDashboard();
    showAuthenticatedApp("dashboardView");

    if (!state.currentUser.hasVoted) {
      loadBallot().catch(() => {});
    }
  } catch (error) {
    showAlert(
      error.message === "Voter not found with this Aadhar number"
        ? "No voter found with this Aadhar number. Please register first."
        : error.message,
      "error"
    );
  } finally {
    setLoading(submitBtn, false);
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  try {
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;
    const data = await apiFetch("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    persistAdminSession(data.token, data.admin);
    await loadAdminElections();
    showAuthenticatedApp("adminView");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    setLoading(submitBtn, false);
  }
});

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetView = button.dataset.viewTarget;

    if (["homeView", "registerChoiceView", "registerFormView", "signinView", "adminLoginView"].includes(targetView)) {
      closeModal();
      if (targetView === "homeView" || targetView === "registerChoiceView") {
        state.currentRole = "";
      }
    }

    if (targetView === "dashboardView" && state.currentUser) {
      renderDashboard();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "ballotView" && state.currentUser && !state.currentUser.hasVoted) {
      state.selectedCandidateId = null;
      await loadBallot();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "receiptView") {
      renderReceipt();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "adminView") {
      const validSession = await verifyStoredAdminSession();
      if (!validSession) {
        showAuthPortal("adminLoginView");
        showAlert("Please sign in as admin to continue.", "error");
        return;
      }
      await loadAdminElections();
      showAuthenticatedApp("adminView");
      return;
    }

    showView(targetView);
  });
});

document.querySelectorAll(".role-button").forEach((button) => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

electionSelector.addEventListener("change", () => {
  state.currentElectionId = electionSelector.value;
  state.selectedCandidateId = null;
  renderCandidates(state.currentElectionId);
});

goToVoteButton.addEventListener("click", async () => {
  if (!state.currentUser || state.currentUser.hasVoted) {
    return;
  }

  state.selectedCandidateId = null;
  await loadBallot();
  showAuthenticatedApp("ballotView");
});

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
  } catch (error) {
    openModal("Vote Failed", error.message, [
      { label: "Close", variant: "secondary", onClick: () => {} },
    ]);
  } finally {
    setLoading(castVoteButton, false);
  }
});

document.getElementById("createElectionBtn").addEventListener("click", async () => {
  const btn = document.getElementById("createElectionBtn");
  const title = document.getElementById("electionTitle").value.trim();
  const description = document.getElementById("electionDesc").value.trim();
  const startDate = document.getElementById("electionStart").value;
  const endDate = document.getElementById("electionEnd").value;

  if (!isAdminAuthenticated()) {
    openModal("Admin Sign-In Required", "Please sign in again before creating an election.", [
      { label: "Open Admin Login", onClick: () => showAuthPortal("adminLoginView") },
    ]);
    return;
  }

  if (!title || !startDate || !endDate) {
    openModal("Missing Details", "Please fill in the title, start date, and end date.", [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    openModal("Invalid Dates", "End date must be after start date.", [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
    return;
  }

  setLoading(btn, true);
  try {
    await apiFetch("/elections", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ title, description, startDate, endDate }),
    });

    ["electionTitle", "electionDesc", "electionStart", "electionEnd"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    await loadAdminElections();
    openModal("Election Created", `"${title}" is now available for candidate registration.`, [
      { label: "Stay Here", onClick: () => showAuthenticatedApp("adminView") },
    ]);
  } catch (error) {
    if (error.message.includes("Admin session")) {
      clearAdminSession();
    }
    openModal("Creation Failed", error.message, [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
  } finally {
    setLoading(btn, false);
  }
});

adminLogoutButton.addEventListener("click", () => {
  clearAdminSession();
  if (!state.currentUser) {
    showAuthPortal("homeView");
    return;
  }
  showAuthenticatedApp("dashboardView");
});

document.getElementById("signOutButton").addEventListener("click", () => {
  state.currentUser = null;
  state.selectedCandidateId = null;
  state.selectedCandidateName = "";
  state.lastTxHash = "";
  state.currentElectionId = null;
  state.currentRole = "";
  closeModal();
  resetAuthForms();
  if (isAdminAuthenticated()) {
    showAuthenticatedApp("adminView");
    return;
  }
  showAuthPortal("homeView");
});

closeModal();
showAuthPortal("homeView");
verifyStoredAdminSession();
