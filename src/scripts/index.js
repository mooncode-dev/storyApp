import "../styles/styles.css";
import App from "./pages/app";
import "virtual:pwa-register";
import { registerSW } from "virtual:pwa-register";

// ==============================
// REGISTER SERVICE WORKER
// ==============================
registerSW({
  onOfflineReady() {
    console.log("Aplikasi siap bekerja secara offline!");
  },
});

// ==============================
// UPDATE NAVIGATION
// ==============================
function updateNav() {
  const authNav = document.querySelector("#auth-nav");
  if (!authNav) return;

  const token = localStorage.getItem("token");

  if (token) {
    authNav.innerHTML = `
      <a href="javascript:void(0)" id="logout-btn" class="nav-link">Logout</a>
    `;

    document.querySelector("#logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("Berhasil Logout");
      window.location.hash = "#/login";
      updateNav();
    });
  } else {
    authNav.innerHTML = `
      <a href="#/login" class="nav-link">Login / Register</a>
    `;
  }
}

// ==============================
// SAFE RENDER (ANTI BLANK OFFLINE)
// ==============================
async function safeRender(app) {
  const content = document.querySelector("#main-content");

  try {
    // Jika offline, tampilkan UI offline
    if (!navigator.onLine) {
      content.innerHTML = `
        <section class="offline">
          <h2>Kamu sedang offline</h2>
          <p>Konten akan dimuat otomatis saat koneksi kembali.</p>
        </section>
      `;
      return;
    }

    // Online → render normal
    await app.renderPage();
  } catch (err) {
    console.error("Render gagal:", err);

    content.innerHTML = `
      <section class="error">
        <h2>Terjadi kesalahan</h2>
        <p>Coba refresh saat koneksi stabil.</p>
      </section>
    `;
  }
}

// ==============================
// APP INIT
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  updateNav();
  await safeRender(app);

  window.addEventListener("hashchange", async () => {
    updateNav();
    await safeRender(app);
  });
});

// ==============================
// PUSH NOTIFICATION (OPTIONAL)
// ==============================
const PUBLIC_VAPID_KEY = "MASUKKAN_PUBLIC_KEY_DARI_API_DI_SINI";

async function subscribeUser() {
  const registration = await navigator.serviceWorker.ready;
  await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });
}

// ==============================
// AUTO SYNC OFFLINE STORIES
// ==============================
import { StoryDb } from "./utils/db";
import { addStory } from "./data/api";

window.addEventListener("online", async () => {
  const pendingStories = await StoryDb.getAllStories();

  if (pendingStories.length === 0) return;

  for (const story of pendingStories) {
    const formData = new FormData();
    formData.append("description", story.description);
    formData.append("photo", story.photo);
    if (story.lat) formData.append("lat", story.lat);
    if (story.lon) formData.append("lon", story.lon);

    try {
      const response = await addStory(formData);
      if (!response.error) {
        await StoryDb.deleteStory(story.id);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi:", err);
      return;
    }
  }

  alert("Koneksi kembali. Cerita offline berhasil di-upload.");
  window.location.reload();
});
