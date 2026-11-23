/* =========================================================
 * 1. 데이터베이스 이관용 기초 데이터 배열 (상품 / 회원등급)
 * ========================================================= */
const PRODUCTS = [
  { id: 1, name: "무지개 사워 젤리 벨트", category: "젤리", price: 4500, stock: 40, image: "./img/prod1.svg", description: "새콤달콤한 과일 파우더가 톡톡! 길게 찢어 먹는 재미가 있는 무지개 벨트 젤리입니다." },
  { id: 2, name: "복숭아 탱글 구미", category: "젤리", price: 3800, stock: 55, image: "./img/prod2.svg", description: "달콤한 백도 과즙을 가득 담아 한입 베어 물면 복숭아 향이 퍼지는 하트 모양 구미입니다." },
  { id: 3, name: "소다맛 곰돌이 젤리팩", category: "젤리", price: 5200, stock: 32, image: "./img/prod3.svg", description: "시원한 하늘색 소다향과 쫀득한 식감이 어우러진 귀여운 곰돌이 모양 젤리입니다." },
  { id: 4, name: "회오리 수제 롤리팝", category: "사탕", price: 3500, stock: 28, image: "./img/prod4.svg", description: "연노랑 레몬과 하늘색 소다 컬러가 어우러진 수제 막대사탕으로 선물용으로도 인기 만점입니다." },
  { id: 5, name: "레몬 허니 드롭 캔디", category: "사탕", price: 4900, stock: 45, image: "./img/prod5.svg", description: "상큼한 레몬 과즙 속에 달콤한 아카시아 꿀을 채워 목까지 부드럽게 감싸주는 캔디입니다." },
  { id: 6, name: "별빛 솜사탕 팝핑 캔디", category: "사탕", price: 4200, stock: 36, image: "./img/prod6.svg", description: "입안에 넣으면 별빛처럼 톡톡 튀는 탄산감과 포근한 솜사탕 맛이 어우러집니다." },
  { id: 7, name: "밀크 헤이즐넛 큐브 초콜릿", category: "초콜릿", price: 8900, stock: 24, image: "./img/prod7.svg", description: "고소하게 구운 헤이즐넛 페이스트와 부드러운 밀크 초콜릿이 조화를 이루는 큐브 초콜릿입니다." },
  { id: 8, name: "딸기 크런치 화이트 초콜릿", category: "초콜릿", price: 7800, stock: 30, image: "./img/prod8.svg", description: "동결건조 딸기 다이스와 바삭한 크런치가 화이트 초콜릿 속에 콕콕 박혀 있습니다." }
];

const MEMBER_GRADES = [
  { level: 1, name: "캔디 새싹", minSpent: 0, earnRate: 0.01, label: "1%" },
  { level: 2, name: "젤리 친구", minSpent: 20000, earnRate: 0.03, label: "3%" },
  { level: 3, name: "슈가 마스터", minSpent: 50000, earnRate: 0.05, label: "5%" },
  { level: 4, name: "스위트 VIP", minSpent: 100000, earnRate: 0.07, label: "7%" }
];

const STORAGE_KEYS = {
  USERS: "candyshop_users_v1",
  CURRENT_USER: "candyshop_current_user_v1",
  CART: "candyshop_cart_v1",
  ORDERS: "candyshop_orders_v1"
};

let state = {
  selectedCategory: "전체",
  searchKeyword: "",
  currentSlide: 0,
  detailQty: 1,
  cart: JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]")
};

const formatWon = (num) => `${Number(num).toLocaleString("ko-KR")}원`;
const formatPoint = (num) => `${Number(num).toLocaleString("ko-KR")}P`;

function getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]"); }
function saveUsers(users) { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }
function getCurrentUser() {
  const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userId) return null;
  return getUsers().find((u) => u.id === userId) || null;
}
function updateUser(updatedUser) {
  saveUsers(getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u)));
}
function getMemberGrade(totalSpent = 0) {
  let current = MEMBER_GRADES[0];
  for (const grade of MEMBER_GRADES) {
    if (totalSpent >= grade.minSpent) current = grade;
  }
  return current;
}
function saveCart() {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart));
  updateCartBadge();
}
function getOrders() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]"); }
function saveOrders(orders) { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }

let slideTimer = null;
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  const dotsWrap = document.getElementById("sliderDots");
  dotsWrap.innerHTML = "";
  slides.forEach((_, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `dot-btn ${idx === 0 ? "active" : ""}`;
    dot.setAttribute("aria-label", `${idx + 1}번 배너 보기`);
    dot.addEventListener("click", () => { goToSlide(idx); resetSlideTimer(); });
    dotsWrap.appendChild(dot);
  });
  document.getElementById("prevSlideBtn").addEventListener("click", () => {
    goToSlide((state.currentSlide - 1 + slides.length) % slides.length);
    resetSlideTimer();
  });
  document.getElementById("nextSlideBtn").addEventListener("click", () => {
    goToSlide((state.currentSlide + 1) % slides.length);
    resetSlideTimer();
  });
  resetSlideTimer();
}
function goToSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot-btn");
  state.currentSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}
function resetSlideTimer() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    const total = document.querySelectorAll(".slide").length;
    goToSlide((state.currentSlide + 1) % total);
  }, 6000);
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const emptyMsg = document.getElementById("emptyProductMsg");
  const keyword = state.searchKeyword.trim().toLowerCase();
  const filtered = PRODUCTS.filter((item) => {
    const matchCategory = state.selectedCategory === "전체" || item.category === state.selectedCategory;
    const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
  document.getElementById("currentCategoryTitle").textContent = state.selectedCategory === "전체" ? "전체 상품" : `${state.selectedCategory} 상품`;
  if (filtered.length === 0) {
    grid.innerHTML = "";
    emptyMsg.classList.remove("hidden");
    return;
  }
  emptyMsg.classList.add("hidden");
  grid.innerHTML = filtered.map((p) => `
    <article class="product-card">
      <div class="product-thumb" data-detail-id="${p.id}">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="product-info">
        <span class="category-tag">${p.category}</span>
        <h3 class="product-name" data-detail-id="${p.id}">${p.name}</h3>
        <div class="product-meta">
          <span class="product-price">${formatWon(p.price)}</span>
          <span class="product-stock">재고 ${p.stock}개</span>
        </div>
        <div class="card-actions">
          <button type="button" class="sub-btn" data-detail-id="${p.id}">상세보기</button>
          <button type="button" class="primary-btn" data-add-id="${p.id}">장바구니</button>
        </div>
      </div>
    </article>
  `).join("");
}

function setCategory(category) {
  state.selectedCategory = category;
  document.querySelectorAll(".nav-btn, .tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.category === category));
  renderProducts();
}

function openProductDetail(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  state.detailQty = 1;
  document.getElementById("detailBody").innerHTML = `
    <div class="detail-layout">
      <div class="detail-img-box"><img src="${product.image}" alt="${product.name}" /></div>
      <div class="detail-info">
        <span class="category-tag">${product.category}</span>
        <h3 id="detailTitle">${product.name}</h3>
        <p class="product-price">${formatWon(product.price)}</p>
        <p class="detail-desc">${product.description}</p>
        <p class="product-stock" style="margin-bottom:10px;">남은 재고: ${product.stock}개</p>
        <div class="qty-selector">
          <button type="button" id="detailMinusBtn">-</button>
          <span id="detailQtyVal">1</span>
          <button type="button" id="detailPlusBtn">+</button>
        </div>
        <button type="button" class="primary-btn full-btn" id="detailAddCartBtn">장바구니에 담기</button>
      </div>
    </div>
  `;
  document.getElementById("detailMinusBtn").addEventListener("click", () => {
    if (state.detailQty > 1) { state.detailQty -= 1; document.getElementById("detailQtyVal").textContent = state.detailQty; }
  });
  document.getElementById("detailPlusBtn").addEventListener("click", () => {
    if (state.detailQty < product.stock) { state.detailQty += 1; document.getElementById("detailQtyVal").textContent = state.detailQty; }
  });
  document.getElementById("detailAddCartBtn").addEventListener("click", () => { addToCart(product.id, state.detailQty); closeModal("detailModal"); });
  openModal("detailModal");
}

function renderGradeGuide() {
  document.getElementById("gradeGuideGrid").innerHTML = MEMBER_GRADES.map((g) => `
    <div class="grade-card">
      <span class="grade-badge">Lv.${g.level} ${g.name}</span>
      <div class="grade-rate">${g.label} 적립</div>
      <p class="grade-cond">누적 구매 ${formatWon(g.minSpent)} 이상</p>
    </div>
  `).join("");
}

function updateCartBadge() {
  document.getElementById("cartCount").textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
}
function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) existing.qty = Math.min(product.stock, existing.qty + qty);
  else state.cart.push({ productId, qty: Math.min(product.stock, qty) });
  saveCart();
  alert(`'${product.name}' 상품이 장바구니에 담겼습니다.`);
}

function renderCartModal() {
  const container = document.getElementById("cartItemsContainer");
  const checkoutBox = document.getElementById("checkoutBox");
  const user = getCurrentUser();
  if (state.cart.length === 0) {
    container.innerHTML = `<p class="empty-message">장바구니가 비어 있습니다. 달콤한 간식을 담아보세요!</p>`;
    checkoutBox.classList.add("hidden");
    return;
  }
  checkoutBox.classList.remove("hidden");
  container.innerHTML = state.cart.map((item) => {
    const p = PRODUCTS.find((prod) => prod.id === item.productId);
    if (!p) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-left">
          <img src="${p.image}" alt="${p.name}" />
          <div>
            <div class="cart-item-title">${p.name}</div>
            <div class="cart-item-price">${formatWon(p.price * item.qty)} (${formatWon(p.price)} × ${item.qty})</div>
          </div>
        </div>
        <div class="cart-item-controls">
          <button type="button" class="mini-btn" data-cart-dec="${p.id}">-</button>
          <span>${item.qty}</span>
          <button type="button" class="mini-btn" data-cart-inc="${p.id}">+</button>
          <button type="button" class="del-btn" data-cart-del="${p.id}">삭제</button>
        </div>
      </div>
    `;
  }).join("");
  const availablePoints = user ? user.points : 0;
  document.getElementById("availablePointText").textContent = user ? `(보유: ${formatPoint(availablePoints)})` : `(로그인 시 포인트 사용/적립 가능)`;
  const pointInput = document.getElementById("usePointInput");
  pointInput.disabled = !user;
  if (!user) pointInput.value = 0;
  if (user && !document.getElementById("orderNameInput").value) document.getElementById("orderNameInput").value = user.name;
  recalculateCheckout();
}

function recalculateCheckout() {
  const subtotal = state.cart.reduce((sum, item) => {
    const p = PRODUCTS.find((prod) => prod.id === item.productId);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const user = getCurrentUser();
  const pointInput = document.getElementById("usePointInput");
  let usePoints = Math.max(0, parseInt(pointInput.value, 10) || 0);
  const maxUsable = user ? Math.min(user.points, subtotal) : 0;
  if (usePoints > maxUsable) { usePoints = maxUsable; pointInput.value = usePoints; }
  const finalAmount = subtotal - usePoints;
  const grade = user ? getMemberGrade(user.totalSpent) : MEMBER_GRADES[0];
  const earnPoints = user ? Math.floor(finalAmount * grade.earnRate) : 0;
  document.getElementById("subtotalPrice").textContent = formatWon(subtotal);
  document.getElementById("discountPrice").textContent = `-${formatWon(usePoints)}`;
  document.getElementById("finalPrice").textContent = formatWon(finalAmount);
  document.getElementById("earnRateText").textContent = user ? `${grade.name} ${grade.label}` : "비회원 0%";
  document.getElementById("earnPointText").textContent = `+${formatPoint(earnPoints)}`;
}

function processDemoCheckout() {
  if (state.cart.length === 0) return;
  const user = getCurrentUser();
  if (!user) {
    alert("체험 결제 및 포인트 적립을 위해 먼저 로그인해주세요.");
    closeModal("cartModal");
    openModal("authModal");
    return;
  }
  const receiver = document.getElementById("orderNameInput").value.trim();
  const address = document.getElementById("orderAddressInput").value.trim();
  if (!receiver || !address) { alert("수령인 이름과 배송지 주소를 입력해주세요."); return; }
  const subtotal = state.cart.reduce((sum, item) => {
    const p = PRODUCTS.find((prod) => prod.id === item.productId);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
  const usePoints = Math.min(user.points, subtotal, Math.max(0, parseInt(document.getElementById("usePointInput").value, 10) || 0));
  const finalAmount = subtotal - usePoints;
  const gradeBefore = getMemberGrade(user.totalSpent);
  const earnPoints = Math.floor(finalAmount * gradeBefore.earnRate);
  user.points = user.points - usePoints + earnPoints;
  user.totalSpent += finalAmount;
  updateUser(user);
  const orderItems = state.cart.map((item) => {
    const p = PRODUCTS.find((prod) => prod.id === item.productId);
    return { productId: p.id, name: p.name, price: p.price, qty: item.qty };
  });
  const orders = getOrders();
  orders.unshift({
    orderId: `ORD-${Date.now()}`, userId: user.id, receiver, address, items: orderItems,
    subtotal, usedPoints: usePoints, finalAmount, earnedPoints: earnPoints,
    createdAt: new Date().toLocaleString("ko-KR")
  });
  saveOrders(orders);
  state.cart = [];
  saveCart();
  document.getElementById("usePointInput").value = 0;
  alert(`체험 결제가 완료되었습니다!\n결제금액: ${formatWon(finalAmount)}\n적립 포인트: +${formatPoint(earnPoints)} (현재 보유: ${formatPoint(user.points)})`);
  closeModal("cartModal");
  updateAuthUI();
}

function updateAuthUI() {
  const user = getCurrentUser();
  const authBtn = document.getElementById("openAuthBtn");
  const mypageBtn = document.getElementById("openMypageBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (user) {
    const grade = getMemberGrade(user.totalSpent);
    authBtn.classList.add("hidden");
    mypageBtn.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    mypageBtn.textContent = `${user.name}님 (${grade.name} · ${formatPoint(user.points)})`;
  } else {
    authBtn.classList.remove("hidden");
    mypageBtn.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const id = document.getElementById("signupId").value.trim();
  const pw = document.getElementById("signupPw").value.trim();
  const msg = document.getElementById("signupMsg");
  if (id.length < 4) { msg.textContent = "아이디는 4자 이상 입력해주세요."; return; }
  const users = getUsers();
  if (users.some((u) => u.id === id)) { msg.textContent = "이미 사용 중인 아이디입니다."; return; }
  const newUser = { id, pw, name, points: 3000, totalSpent: 0, joinedAt: new Date().toLocaleDateString("ko-KR") };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
  msg.textContent = "";
  e.target.reset();
  updateAuthUI();
  closeModal("authModal");
  alert(`${name}님 환영합니다! 회원가입 축하 3,000P가 지급되었습니다.`);
}

function handleLogin(e) {
  e.preventDefault();
  const id = document.getElementById("loginId").value.trim();
  const pw = document.getElementById("loginPw").value.trim();
  const msg = document.getElementById("loginMsg");
  const found = getUsers().find((u) => u.id === id && u.pw === pw);
  if (!found) { msg.textContent = "아이디 또는 비밀번호가 일치하지 않습니다."; return; }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
  msg.textContent = "";
  e.target.reset();
  updateAuthUI();
  closeModal("authModal");
}

function renderMypage() {
  const user = getCurrentUser();
  if (!user) return;
  const grade = getMemberGrade(user.totalSpent);
  const nextGrade = MEMBER_GRADES.find((g) => g.level === grade.level + 1);
  const nextInfo = nextGrade ? `다음 등급(${nextGrade.name})까지 ${formatWon(nextGrade.minSpent - user.totalSpent)} 남음` : "최고 등급 달성!";
  document.getElementById("mypageProfile").innerHTML = `
    <div><strong>${user.name}</strong> (${user.id}) · 가입일 ${user.joinedAt}</div>
    <p style="font-size:0.84rem; color:#5c6f7e; margin-top:4px;">${nextInfo}</p>
    <div class="profile-stats">
      <div class="stat-box"><span>회원 등급</span><strong>${grade.name} (${grade.label})</strong></div>
      <div class="stat-box"><span>보유 포인트</span><strong>${formatPoint(user.points)}</strong></div>
      <div class="stat-box"><span>누적 결제액</span><strong>${formatWon(user.totalSpent)}</strong></div>
    </div>
  `;
  const myOrders = getOrders().filter((o) => o.userId === user.id);
  const ordersContainer = document.getElementById("mypageOrders");
  if (myOrders.length === 0) {
    ordersContainer.innerHTML = `<p class="empty-message">아직 체험 주문 내역이 없습니다.</p>`;
    return;
  }
  ordersContainer.innerHTML = myOrders.map((order) => `
    <div class="order-card">
      <div class="order-card-head"><span>${order.orderId}</span><span>${order.createdAt}</span></div>
      <div>상품: ${order.items.map((i) => `${i.name} (${i.qty}개)`).join(", ")}</div>
      <div>배송지: ${order.receiver} / ${order.address}</div>
      <div style="margin-top:4px; font-weight:700; color:#389ee6;">결제금액 ${formatWon(order.finalAmount)} (사용 -${formatPoint(order.usedPoints)} / 적립 +${formatPoint(order.earnedPoints)})</div>
    </div>
  `).join("");
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", () => {
  initSlider(); renderProducts(); renderGradeGuide(); updateCartBadge(); updateAuthUI();
  document.querySelectorAll(".nav-btn, .tab-btn").forEach((btn) => btn.addEventListener("click", () => setCategory(btn.dataset.category)));
  document.getElementById("logoLink").addEventListener("click", (e) => { e.preventDefault(); state.searchKeyword = ""; document.getElementById("searchInput").value = ""; setCategory("전체"); });
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => { state.searchKeyword = e.target.value; renderProducts(); });
  document.getElementById("searchClearBtn").addEventListener("click", () => { searchInput.value = ""; state.searchKeyword = ""; renderProducts(); });
  document.getElementById("productGrid").addEventListener("click", (e) => {
    const detailBtn = e.target.closest("[data-detail-id]");
    const addBtn = e.target.closest("[data-add-id]");
    if (detailBtn) openProductDetail(Number(detailBtn.dataset.detailId));
    if (addBtn) addToCart(Number(addBtn.dataset.addId), 1);
  });
  document.getElementById("openCartBtn").addEventListener("click", () => { renderCartModal(); openModal("cartModal"); });
  document.getElementById("cartItemsContainer").addEventListener("click", (e) => {
    const decId = e.target.dataset.cartDec;
    const incId = e.target.dataset.cartInc;
    const delId = e.target.dataset.cartDel;
    if (decId) { const item = state.cart.find((c) => c.productId === Number(decId)); if (item && item.qty > 1) item.qty -= 1; saveCart(); renderCartModal(); }
    if (incId) { const item = state.cart.find((c) => c.productId === Number(incId)); const prod = PRODUCTS.find((p) => p.id === Number(incId)); if (item && prod && item.qty < prod.stock) item.qty += 1; saveCart(); renderCartModal(); }
    if (delId) { state.cart = state.cart.filter((c) => c.productId !== Number(delId)); saveCart(); renderCartModal(); }
  });
  document.getElementById("usePointInput").addEventListener("input", recalculateCheckout);
  document.getElementById("useAllPointBtn").addEventListener("click", () => {
    const user = getCurrentUser();
    if (!user) return;
    const subtotal = state.cart.reduce((sum, item) => { const p = PRODUCTS.find((prod) => prod.id === item.productId); return sum + (p ? p.price * item.qty : 0); }, 0);
    document.getElementById("usePointInput").value = Math.min(user.points, subtotal);
    recalculateCheckout();
  });
  document.getElementById("checkoutBtn").addEventListener("click", processDemoCheckout);
  document.getElementById("openAuthBtn").addEventListener("click", () => openModal("authModal"));
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isLogin = tab.dataset.tab === "login";
      document.getElementById("loginForm").classList.toggle("hidden", !isLogin);
      document.getElementById("signupForm").classList.toggle("hidden", isLogin);
    });
  });
  document.getElementById("signupForm").addEventListener("submit", handleSignup);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("openMypageBtn").addEventListener("click", () => { renderMypage(); openModal("mypageModal"); });
  document.getElementById("logoutBtn").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); updateAuthUI(); alert("로그아웃 되었습니다."); });
  document.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (e) => { if (e.target === backdrop) backdrop.classList.add("hidden"); }));
});
