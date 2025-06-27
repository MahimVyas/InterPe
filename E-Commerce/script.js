const products = [
  {
    id: 1,
    name: "Boult Q Over Ear Bluetooth Headphones",
    price: 1799,
    img: "https://m.media-amazon.com/images/I/71zfpkr4bYL._SX679_.jpg",
    tags: ["headphones", "bluetooth", "over-ear", "boult", "electronics", "audio"]
  },
  {
    id: 2,
    name: "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones",
    price: 3988,
    img: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._SX679_.jpg",
    tags: ["headphones", "wireless", "on-ear", "sony", "electronics", "audio"]
  },
  {
    id: 3,
    name: "boAt Rockerz 551 ANC Pro (2025 Launch)",
    price: 3799,
    img: "https://m.media-amazon.com/images/I/611jYrR3StL._SX679_.jpg",
    tags: ["headphones", "anc", "over-ear", "boat", "electronics", "audio"]
  },
  {
    id: 4,
    name: "boAt Rockerz 450 Wireless On-Ear Headphones",
    price: 1499,
    img: "https://m.media-amazon.com/images/I/61u1VALn6JL._SX679_.jpg",
    tags: ["headphones", "wireless", "on-ear", "boat", "electronics", "audio"]
  },
  {
    id: 5,
    name: "ZEBRONICS Thunder Bluetooth Wireless Over Ear Headphones",
    price: 3999,
    img: "https://m.media-amazon.com/images/I/61i7ivBDe3L._SX679_.jpg",
    tags: ["headphones", "bluetooth", "over-ear", "zebronics", "electronics", "audio"]
  },
  {
    id: 6,
    name: "JBL Tune 510BT On-Ear Wireless Headphones",
    price: 2499,
    img: "https://m.media-amazon.com/images/I/61kWB+uzR2L._SX679_.jpg",
    tags: ["headphones", "wireless", "on-ear", "jbl", "electronics", "audio"]
  },
  {
    id: 7,
    name: "Sony PlayStation5 Gaming Console (Slim)",
    price: 54990,
    img: "https://m.media-amazon.com/images/I/51ljnEaW0pL._SX679_.jpg",
    tags: ["sony", "ps5", "gaming", "console", "electronics"]
  },
  {
    id: 8,
    name: "iPhone 16 Plus 256 GB: 5G Mobile Phone with Camera Control | Ultrmarine",
    price: 92900,
    img: "https://m.media-amazon.com/images/I/71D3JsltoLL._SX679_.jpg",
    tags: ["iphone", "mobile", "smartphone", "apple", "electronics", "5g"]
  },
  {
    id: 9,
    name: "iPhone 16 Plus 256 GB: 5G Mobile Phone with Camera Control | White",
    price: 92900,
    img: "https://m.media-amazon.com/images/I/61d88xzrklL._SX679_.jpg",
    tags: ["iphone", "mobile", "smartphone", "apple", "electronics", "5g"]
  },
  {
    id: 10,
    name: "Nothing Phone (2a) Plus (Grey, 8GB RAM, 256GB Storage)",
    price: 19954,
    img: "https://m.media-amazon.com/images/I/81lRPeeHZgL._SY879_.jpg",
    tags: ["nothing", "mobile", "smartphone", "android", "electronics", "5g"]
  },
  {
    id: 11,
    name: "Amazon Echo Dot (5th Gen)  Blue",
    price: 5499,
    img: "https://m.media-amazon.com/images/I/81hgjKwsdHL._SX679_.jpg",
    tags: ["amazon", "echodot", "smart speaker", "alexa", "electronics", "bluetooth"]
  },
  {
    id: 12,
    name: "Samsung Galaxy S24 Ultra 5G AI Smartphone with Galaxy AI (Titanium Black, 12GB, 256GB Storage)",
    price: 94999,
    img: "https://m.media-amazon.com/images/I/71Nwtop9jtL._SX679_.jpg",
    tags: ["samsung", "mobile", "smartphone", "galaxy", "electronics", "5g"]
  }
];

// Render Products
function renderProducts(list) {
  const container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p style="text-align:center">No products found.</p>';
    return;
  }

  list.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>₹${product.price.toLocaleString()}</p>
      <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    container.appendChild(card);
  });
}

function showHotMsg(msg) {
  const el = document.getElementById('hot-msg');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1800);
}

// Add to Cart
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = products.find(p => p.id === id);
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  showHotMsg(`${item.name} added to cart!`);
}

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    const removed = cart.splice(index, 1)[0];
    localStorage.setItem('cart', JSON.stringify(cart));
    showHotMsg(`${removed.name} removed from cart!`);
    loadCart();
  }
}

// Load Cart
function loadCart() {
  const container = document.getElementById('cart-container');
  const total = document.getElementById('cart-total');
  if (!container || !total) return;
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  container.innerHTML = cart.map((item, idx) => `
    <div class="product-card">
      <img src="${item.img}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button class="btn" onclick="removeFromCart(${item.id})">Remove</button>
    </div>
  `).join('');

  const sum = cart.reduce((acc, cur) => acc + cur.price, 0);
  total.textContent = `Total: ₹${sum.toLocaleString()}`;
  if (cart.length > 0) showHotMsg('Cart loaded!');
}

// Slideshow
let slideIndex = 0;
function showSlides() {
  const slides = document.querySelectorAll(".slide");
  slides.forEach(s => {
    s.style.display = "none";
    s.style.opacity = 0;
    s.style.transform = "translateX(100%)";
  });

  slideIndex++;
  if (slideIndex > slides.length) slideIndex = 1;

  const current = slides[slideIndex - 1];
  current.style.display = "block";
  setTimeout(() => {
    current.style.opacity = 1;
    current.style.transform = "translateX(0)";
  }, 100);

  setTimeout(showSlides, 5000);
}

function changeSlide(n) {
  slideIndex += n - 1;
  showSlides();
}

// Search
document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('.search-bar input');
  const button = document.querySelector('.search-bar button');

  if (input && button) {
    input.disabled = false;
    button.disabled = false;

    const doSearch = () => {
      const query = input.value.toLowerCase();
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.includes(query))
      );
      renderProducts(filtered);
    };

    button.addEventListener('click', doSearch);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') doSearch();
    });
  }

  renderProducts(products);
  loadCart();
  showSlides();
});

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section');
  const reveal = () => {
    const trigger = window.innerHeight * 0.92;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < trigger) sec.classList.add('visible');
    });
  };
  reveal();
  window.addEventListener('scroll', reveal);
});