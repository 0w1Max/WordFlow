import { navigate } from "../core/router.js";

export function renderReview() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div>
      <h2>Review page</h2>
      <button id="back">Back</button>
    </div>
  `;

  document.getElementById("back").onclick = () => {
    navigate("/");
  };
}
