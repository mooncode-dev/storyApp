import { sendSubscriptionToServer } from '../../data/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <article>
          <h2 tabindex="0">Tentang Story App</h2>
          <p>Aplikasi ini adalah platform berbagi cerita yang memungkinkan pengguna untuk:</p>
          <ul>
            <li>Melihat cerita dari berbagai lokasi melalui peta interaktif.</li>
            <li>Mengunggah foto dan menyertakan koordinat lokasi.</li>
            <li>Menjelajahi konten dengan aksesibilitas yang optimal.</li>
          </ul>

          <div class="form-group">
            <p>Notifikasi:</p>
            <button id="subscribe-push" class="btn-secondary">Aktifkan Notifikasi</button>
          </div>
          
          <img src="images/logo.png" alt="Logo resmi Story App" style="width: 150px; margin-top: 1rem;">
        </article>
      </section>
    `;
  }

async afterRender() {
  const btnNotification = document.querySelector('#subscribe-push'); // Sesuaikan dengan ID di render()
  const registration = await navigator.serviceWorker.ready;

  btnNotification.onclick = async () => {
    try {
      const status = await Notification.requestPermission();
      
      if (status === 'granted') {
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // WAJIB: Gunakan Key dari reviewer
          applicationServerKey: urlBase64ToUint8Array('BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'),
        });

        // POIN KRUSIAL: Kirim ke API agar server tahu keberadaanmu
        await sendSubscriptionToServer(newSubscription);
        
        alert('Notifikasi Aktif! Silakan coba tambah story baru.');
        location.reload(); 
      } else {
        alert('Izin notifikasi ditolak.');
      }
    } catch (error) {
      console.error('Gagal mengaktifkan notifikasi:', error);
      alert('Terjadi kesalahan. Pastikan kamu sudah login dan internet aktif.');
    }
  };
}

  async _initialButtonState(button) {
    if (Notification.permission === 'granted') {
      this._setButtonState(button, true);
    } else {
      this._setButtonState(button, false);
    }
  }

  _setButtonState(button, isSubscribed) {
    if (isSubscribed) {
      button.innerText = 'Matikan Notifikasi';
      button.style.backgroundColor = '#ff4d4d';
      button.style.color = 'white';
      button.setAttribute('data-subscribed', 'true');
    } else {
      button.innerText = 'Aktifkan Notifikasi';
      button.style.backgroundColor = '#f0f0f0';
      button.style.color = 'black';
      button.setAttribute('data-subscribed', 'false');
    }
  }

  async _subscribe(button) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      this._setButtonState(button, true);
      alert('Notifikasi berhasil diaktifkan!');
    } else {
      alert('Izin notifikasi ditolak oleh pengguna.');
    }
  }

  async _unsubscribe(button) {
    this._setButtonState(button, false);
    alert('Notifikasi telah dimatikan.');
  }
}