import { FavoriteDb } from '../../utils/db';

export default class FavoritePage {
  async render() {
    return `
      <section class="container">
        <h2 tabindex="0">Cerita Tersimpan</h2>
        <div id="favorite-container" class="story-list">
          <p>Memuat cerita favorit...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    try {
      const stories = await FavoriteDb.getAllStories();
      const container = document.querySelector('#favorite-container');
      
      if (stories.length === 0) {
        container.innerHTML = '<p>Belum ada cerita yang disimpan.</p>';
        return;
      }

      container.innerHTML = '';
      stories.forEach((story) => {
        container.innerHTML += `
          <article class="story-item" tabindex="0">
            <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" loading="lazy">
            <div class="story-content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <div class="card-actions" style="margin-top: 1rem;">
                 <button class="btn-delete" 
                         style="background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" 
                         data-id="${story.id}">
                    Hapus dari Favorit
                 </button>
              </div>
            </div>
          </article>
        `;
      });

      const deleteButtons = document.querySelectorAll('.btn-delete');
      deleteButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
          const id = event.target.dataset.id;
          await FavoriteDb.deleteStory(id);
          alert('Berhasil dihapus!');
          this.afterRender();
        });
      });

    } catch (error) {
      console.error("Gagal memuat favorit", error);
    }
  }
}