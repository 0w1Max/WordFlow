import { navigate } from "../core/router.js";

export function renderAddWord() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div>
      <h2>Add Word</h2>
      <button id="back">Back</button>
    </div>
  `;

  document.getElementById("back").onclick = () => {
    navigate("/");
  };
}
