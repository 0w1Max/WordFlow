import { navigate } from "../core/router.js";

export function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div>
      <h1>WordFlow</h1>
      <button id="reviewBtn">Start Review</button>
      <button id="addBtn">Add Word</button>
    </div>
  `;

  document.getElementById("reviewBtn").onclick = () => {
    navigate("/review");
  };

  document.getElementById("addBtn").onclick = () => {
    navigate("/add");
  };
}
