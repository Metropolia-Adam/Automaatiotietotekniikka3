// Haetaan HTML-elementit muuttujiin
const form = document.getElementById('add-product-form');
const nameInput = document.getElementById('product-name');
const amountInput = document.getElementById('product-amount');
const dateInput = document.getElementById('product-date');
const errorMessage = document.getElementById('error-message');
const fridgeList = document.getElementById('fridge-list');

// 1. Ladataan tallennetut tuotteet LocalStoragesta (tai aloitetaan tyhjällä listalla)
let products = JSON.parse(localStorage.getItem('fridgeProducts')) || [];

// Tallennusfunktio: muuttaa taulukon tekstiksi ja tallentaa selaimeen
function saveProducts() {
  localStorage.setItem('fridgeProducts', JSON.stringify(products));
}

// Virheilmoituksen näyttäminen ja piilotus (V4)
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

// 2. Tuotteiden piirtäminen ruudulle
function renderFridge() {
  fridgeList.innerHTML = ''; // Tyhjennetään vanha näkymä

  products.forEach((product) => {
    const li = document.createElement('li');
    li.className = 'product-item';

    // Luodaan tekstisisältö
    li.innerHTML = `
      <div class="product-info">
        <strong>${product.name}</strong> (${product.amount || '1 kpl'})
        <span class="days-left">Parasta ennen: ${product.expiryDate}</span>
      </div>
      <button class="btn-delete" data-id="${product.id}" title="Poista">✕</button>
    `;

    fridgeList.appendChild(li);
  });
}

// 3. Tuotteen lisäys lomakkeelta (V1 & V4)
form.addEventListener('submit', function(event) {
  event.preventDefault(); // Estää sivun uudelleenlatauksen
  clearError();

  const name = nameInput.value.trim().toLowerCase(); // Pienet kirjaimet vertailua varten
  const amount = amountInput.value.trim();
  const expiryDate = dateInput.value;

  // Tarkistukset (V4)
  if (name === '') {
    showError('Tuotteen nimi ei voi olla tyhjä.');
    return;
  }

  if (expiryDate === '') {
    showError('Valitse parasta ennen -päivämäärä.');
    return;
  }

  // Tarkistetaan, ettei päivämäärä ole menneisyydessä
  const today = new Date().toISOString().split('T')[0];
  if (expiryDate < today) {
    showError('Et voi lisätä jo vanhentunutta tuotetta.');
    return;
  }

  // Luodaan uusi tuote-objekti
  const newProduct = {
    id: Date.now().toString(), // Uniikki tunniste aikaleimasta
    name: name,
    amount: amount,
    expiryDate: expiryDate
  };

  // Lisätään listaan, tallennetaan ja päivitetään ruutu
  products.push(newProduct);
  saveProducts();
  renderFridge();

  // Tyhjennetään lomake seuraavaa tuotetta varten
  form.reset();
});

// 4. Tuotteen poistaminen listalta (Event Delegation)
fridgeList.addEventListener('click', function(event) {
  if (event.target.classList.contains('btn-delete')) {
    const idToDelete = event.target.getAttribute('data-id');
    
    // Suodatetaan pois tuote, jolla on kyseinen id
    products = products.filter(product => product.id !== idToDelete);
    
    saveProducts();
    renderFridge();
  }
});

// Piirretään lista heti, kun sivu avataan
renderFridge();
