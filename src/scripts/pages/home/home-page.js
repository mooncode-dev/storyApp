import { getAllStories } from '../../data/api';
import { FavoriteDb } from '../../utils/db';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h2 tabindex="0">Eksplorasi Cerita</h2>
        
        <div id="map" style="height: 400px; width: 100%; border-radius: 8px; margin-bottom: 2rem;" aria-label="Peta sebaran cerita"></div>

        <div id="story-container" class="story-list">
          <p>Sedang memuat cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    try {
      const response = await getAllStories();
      const stories = response.listStory;
      const storyContainer = document.querySelector('#story-container');
      storyContainer.innerHTML = ''; 

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`<b>${story.name}</b><br>${story.description}`);
        }

        storyContainer.innerHTML += `
          <article class="story-item" tabindex="0">
            <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" loading="lazy">
            <div class="story-content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <small>${new Date(story.createdAt).toDateString()}</small>
              <div class="card-actions" style="margin-top: 1rem;">
                 <button class="btn-save" 
                         style="background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" 
                         data-id="${story.id}">
                    Simpan Cerita
                 </button>
              </div>
            </div>
          </article>
        `;
      });

      const saveButtons = document.querySelectorAll('.btn-save');
      saveButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
          const storyId = event.target.dataset.id;
          
          const storyToSave = stories.find((s) => s.id === storyId);

          try {
            await FavoriteDb.putStory(storyToSave);
            
            event.target.innerText = 'Tersimpan';
            event.target.style.backgroundColor = '#28a745';
            event.target.disabled = true;
            
            alert('Cerita berhasil disimpan ke Favorit!');
          } catch (err) {
            console.error("Gagal menyimpan ke favorit", err);
            alert('Gagal menyimpan cerita.');
          }
        });
      });

    } catch (error) {
      console.error("Gagal memuat data peta atau list", error);
      document.querySelector('#story-container').innerHTML = '<p>Gagal memuat data. Pastikan Anda sudah login.</p>';
    }
  }
}