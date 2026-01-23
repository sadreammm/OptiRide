import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import faviconUrl from "@/assets/favicon.ico";

const existingFavicon = document.querySelector("link[rel='icon']");
const favicon = existingFavicon || document.createElement("link");
favicon.rel = "icon";
favicon.href = faviconUrl;
if (!existingFavicon) {
	document.head.appendChild(favicon);
}

createRoot(document.getElementById("root")).render(
	<App />
);

