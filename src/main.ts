import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('#app element not found');
}

app.innerHTML = `
  <main class="page">
    <section class="hero">
      <p class="eyebrow">My Best Photos</p>

      <h1>Share your best photos.</h1>

      <p class="intro">
        A simple public gallery for your favorite photos.
      </p>

      <a class="button" href="#gallery">
        View gallery
      </a>
    </section>

    <section id="gallery" class="gallery">
      <article class="photo-card"></article>
      <article class="photo-card"></article>
      <article class="photo-card"></article>
    </section>
  </main>
`;