import { addStory } from '../../data/api';
import Swal from 'sweetalert2';
import { StoryDb } from '../../utils/db';

export default class AddStoryPage {
  #stream = null;

  async render() {
    return `
      <section class="container">
        <h2 tabindex="0">Tambah Cerita Baru</h2>
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <h3><label for="description">Deskripsi Cerita</label></h3>
            <textarea id="description" name="description" required aria-required="true"></textarea>
          </div>

          <div class="form-group">
            <h3>Pilih Lokasi (Klik pada peta)</h3>
            <div id="map-add" style="height: 300px; margin-bottom: 10px;" aria-label="Peta pemilihan lokasi"></div>
            <div class="location-inputs">
              <h4><label for="lat">Latitude</label></h4>
              <input type="text" id="lat" name="lat" placeholder="Latitude" readonly required>
              <h4><label for="lon">Longitude</label><h4>
              <input type="text" id="lon" name="lon" placeholder="Longitude" readonly required>
            </div>
          </div>

          <div class="form-group">
            <h3><label for="photo">Unggah Foto</label></h3>
            <input type="file" id="photo" name="photo" accept="image/*" required>
            <p>Atau ambil dari kamera:</p>
            <video id="video" width="100%" autoplay playsinline style="display: none; border-radius: 8px;"></video>
            <canvas id="canvas" style="display: none;"></canvas>
            <button type="button" id="start-camera" class="btn-secondary">Aktifkan Kamera</button>
            <button type="button" id="capture-photo" class="btn-secondary" style="display: none;">Ambil Foto</button>
            <button type="button" id="cancel-camera" class="btn-secondary" style="display: none; background-color: #ff4d4d; color: white;">Batal Kamera</button>
          </div>

          <button type="submit" id="submit-btn" class="btn-primary">Kirim Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#add-story-form');
    const video = document.querySelector('#video');
    const canvas = document.querySelector('#canvas');
    const photoInput = document.querySelector('#photo');
    const startCameraButton = document.querySelector('#start-camera');
    const captureButton = document.querySelector('#capture-photo');
    const cancelButton = document.querySelector('#cancel-camera');

    const map = L.map('map-add').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (marker) marker.setLatLng(e.latlng);
      else marker = L.marker(e.latlng).addTo(map);

      document.querySelector('#lat').value = lat;
      document.querySelector('#lon').value = lng;
    });

    startCameraButton.addEventListener('click', async () => {
      try {
        this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = this.#stream;
        video.style.display = 'block';
        startCameraButton.style.display = 'none';
        captureButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
      } catch (err) {
        Swal.fire('Error', 'Gagal mengakses kamera: ' + err.message, 'error');
      }
    });

    captureButton.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
        Swal.fire('Sukses', 'Foto berhasil diambil!', 'success');
      }, 'image/jpeg');
      
      this._stopCamera(); 
    });

    cancelButton.addEventListener('click', () => {
      this._stopCamera(); 
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);

      if (!navigator.onLine) {
        const storyData = {
          id: Date.now(),
          description: formData.get('description'),
          photo: formData.get('photo'), 
          lat: formData.get('lat'),
          lon: formData.get('lon'),
        };

        try {
          await StoryDb.putStory(storyData); 
          Swal.fire({
            icon: 'info',
            title: 'Mode Offline',
            text: 'Cerita disimpan di perangkat. Akan otomatis ter-upload saat internet kembali!',
          }).then(() => {
            window.location.hash = '#/';
          });
        } catch (err) {
          Swal.fire('Error', 'Gagal menyimpan data lokal', 'error');
        }
        return; 
      }

      Swal.fire({
        title: 'Mengirim Cerita...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      try {
        const response = await addStory(formData);
        Swal.close();

        if (!response.error) {
          Swal.fire('Berhasil!', 'Cerita berhasil ditambahkan!', 'success').then(() => {
            window.location.hash = '#/';
          });
        } else {
          Swal.fire('Gagal!', response.message, 'error');
        }
      } catch (error) {
        Swal.close();
        Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error');
      }
    });
  }

  _stopCamera() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
      this.#stream = null;
    }

    const video = document.querySelector('#video');
    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }

    document.querySelector('#start-camera').style.display = 'inline-block';
    document.querySelector('#capture-photo').style.display = 'none';
    document.querySelector('#cancel-camera').style.display = 'none';
  }
}