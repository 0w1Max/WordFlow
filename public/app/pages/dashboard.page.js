import { navigate } from "../core/router.js";
import { request } from "../core/api.js";

export async function renderDashboard() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div>
      <h1>WordFlow</h1>
      <p>Loading...</p>
    </div>
  `;

  try {
    const words = await request("/words");

    app.innerHTML = `
      <div>
        <h1>WordFlow</h1>

        <p>Total words: ${words.length}</p>

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

  } catch (e) {

    app.innerHTML = `
      <div>
        <h1>WordFlow</h1>
        <p>Error loading data</p>
      </div>
    `;
  }
}