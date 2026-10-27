const KEY = "voltix_demo_v1";
const STATUSES = ["Order Placed", "To Ship", "To Receive", "Completed / Received", "Cancelled"];
const seedProducts = [
 {id:"p1",name:"Nova X Smartphone",category:"Smartphones",price:12999,description:"A bright display and dependable everyday performance.",emoji:"📱",rating:4.8},
 {id:"p2",name:"VortexBook 14",category:"Laptops",price:32999,description:"A lightweight laptop for study and productivity.",emoji:"💻",rating:4.7},
 {id:"p3",name:"Pulse Wireless Headphones",category:"Audio",price:2499,description:"Comfortable wireless audio for music and calls.",emoji:"🎧",rating:4.6},
 {id:"p4",name:"FitSync Smartwatch",category:"Wearables",price:1899,description:"A simple wearable for everyday activity.",emoji:"⌚",rating:4.4},
 {id:"p5",name:"Phantom Gaming Mouse",category:"Gaming",price:999,description:"Responsive controls for gaming and daily use.",emoji:"🖱️",rating:4.5},
 {id:"p6",name:"Mechanical RGB Keyboard",category:"Gaming",price:2199,description:"Tactile keys with colorful backlighting.",emoji:"⌨️",rating:4.6},
 {id:"p7",name:"Volt 20K Power Bank",category:"Accessories",price:1499,description:"Portable charging for compatible devices.",emoji:"🔋",rating:4.3},
 {id:"p8",name:"Mini Bluetooth Speaker",category:"Audio",price:1299,description:"Compact speaker for your desk or travel.",emoji:"🔊",rating:4.4}
];
let state = loadState(), currentUser = null, cart = {}, activeView = "shop", authMode = "login";
function loadState(){
 try { const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw); } catch(e){}
 const initial={products:seedProducts,users:[],orders:[],nextOrder:1001};
 localStorage.setItem(KEY,JSON.stringify(initial)); return initial;
}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(n){return "₱"+Number(n).toLocaleString("en-PH",{maximumFractionDigits:2});}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2400);}
function isAdmin(){return currentUser?.role==="admin";}
function openModal(html){document.getElementById("modal-content").innerHTML=html;document.getElementById("modal-backdrop").classList.remove("hidden");}
function closeModal(){document.getElementById("modal-backdrop").classList.add("hidden");}
function setView(view){
 if(view==="admin"&&!isAdmin()){toast("Please log in with an admin account.");return;}
 if(view==="orders"&&!currentUser){toast("Please log in to view your orders.");showAuth("login");return;}
 activeView=view;
 document.querySelectorAll(".view").forEach(el=>el.classList.add("hidden"));
 document.getElementById(view+"-view").classList.remove("hidden");
 document.querySelectorAll(".navbtn").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
 renderAll(); window.scrollTo({top:0,behavior:"smooth"});
}
function showAuth(mode="login"){
 authMode=mode;
 openModal(`<h2 id="modal-title">${mode==="login"?"Welcome back":"Create customer account"}</h2>
 <div class="tabs"><button class="${mode==="login"?"active":""}" data-auth-mode="login">Login</button><button class="${mode==="register"?"active":""}" data-auth-mode="register">Register</button></div>
 <form id="auth-form" class="stack">
 ${mode==="register"?'<label>Full name<input name="name" required maxlength="80" autocomplete="name"></label>':''}
 <label>Username<input name="username" required minlength="3" maxlength="40" autocomplete="username"></label>
 <label>Password<input name="password" required minlength="4" type="password" autocomplete="${mode==="login"?"current-password":"new-password"}"></label>
 <button class="btn" type="submit">${mode==="login"?"Login":"Create account"}</button>
 </form>
 <p class="form-note">Demo only: customer accounts are saved in this browser. Do not use a real or reused password.</p>`);
}
function loginUser(user){currentUser={username:user.username,name:user.name||user.username,role:user.role||"customer"};cart={};closeModal();updateHeader();toast("Welcome, "+currentUser.name+"!");setView(currentUser.role==="admin"?"admin":"shop");}
function updateHeader(){
 document.getElementById("session-label").textContent=currentUser?`${currentUser.name}${isAdmin()?" · Admin":""}`:"Guest";
 document.getElementById("login-open").classList.toggle("hidden",!!currentUser);
 document.getElementById("logout-btn").classList.toggle("hidden",!currentUser);
 document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!isAdmin()));
 document.getElementById("cart-count").textContent=Object.values(cart).reduce((a,b)=>a+b,0);
}

function productImage(p){
 const name=(p.name||"").toLowerCase(),cat=(p.category||"").toLowerCase();
 if(name.includes("laptop")||name.includes("book")||cat==="laptops")return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85";
 if(name.includes("headphone")||name.includes("earbud")||cat==="audio")return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85";
 if(name.includes("watch")||cat==="wearables")return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85";
 if(name.includes("mouse")||name.includes("keyboard")||cat==="gaming")return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=85";
 if(name.includes("power bank")||name.includes("charger")||cat==="accessories"||cat==="computer accessories")return "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=700&q=85";
 if(name.includes("speaker"))return "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85";
 return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85";
}

function renderProducts(){
 let q=document.getElementById("search").value.toLowerCase(), cat=document.getElementById("category-filter").value, sort=document.getElementById("sort-filter").value;
 let list=state.products.filter(p=>(cat==="All"||p.category===cat)&&(p.name+" "+p.category+" "+p.description).toLowerCase().includes(q));
 if(sort==="low")list.sort((a,b)=>a.price-b.price); if(sort==="high")list.sort((a,b)=>b.price-a.price); if(sort==="rating")list.sort((a,b)=>(b.rating||0)-(a.rating||0));
 const grid=document.getElementById("product-grid");
 grid.innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-art"><img src="${productImage(p)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.insertAdjacentText('beforeend','${esc(p.emoji||"📦")}')"></div><div class="product-info"><small>${esc(p.category)} · ★ ${p.rating||"New"}</small><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="small-btn" data-add="${esc(p.id)}">＋ Add</button></div></div></article>`).join(""):'<div class="empty" style="grid-column:1/-1">No products match your search.</div>';
}
function addToCart(id){cart[id]=(cart[id]||0)+1;updateHeader();toast("Added to cart.");}
function cartTotal(){return Object.entries(cart).reduce((sum,[id,qty])=>sum+(state.products.find(p=>p.id===id)?.price||0)*qty,0);}
function showCart(){
 const items=Object.entries(cart).filter(([id,qty])=>qty>0&&state.products.some(p=>p.id===id));
 openModal(`<h2>Your cart</h2>${items.length?items.map(([id,qty])=>{let p=state.products.find(x=>x.id===id);return `<div class="cart-row"><div><strong>${esc(p.name)}</strong><div class="muted">${money(p.price)} each</div></div><div class="qty"><button data-qty="${id}" data-delta="-1">−</button><span>${qty}</span><button data-qty="${id}" data-delta="1">＋</button></div></div>`}).join(""):`<div class="empty">Your cart is empty.</div>`}
 <div class="total-row"><span>Subtotal</span><span>${money(cartTotal())}</span></div><p class="form-note">Shipping cost is shown at checkout. This demo does not process actual payments.</p>
 ${items.length?'<button id="checkout-open" class="btn" style="width:100%">Continue to checkout</button>':''}`);
}
function showCheckout(){
 if(!currentUser){closeModal();showAuth("login");toast("Log in before checkout.");return;}
 if(!Object.keys(cart).length){toast("Your cart is empty.");return;}
 openModal(`<h2>Checkout</h2><form id="checkout-form" class="stack">
 <label>Recipient name<input name="recipient" required value="${esc(currentUser.name)}"></label>
 <label>Contact number<input name="phone" required inputmode="tel" placeholder="09XX XXX XXXX"></label>
 <label>Delivery address<textarea name="address" required rows="3" style="background:var(--panel);border:1px solid var(--line);border-radius:9px;color:white;padding:11px"></textarea></label>
 <label>Payment choice<select name="payment"><option>Cash on Delivery (COD)</option><option>GCash / Maya (demo selection only)</option><option>Card (demo selection only)</option></select></label>
 <div class="total-row"><span>Total (incl. demo shipping ₱100)</span><span>${money(cartTotal()+100)}</span></div>
 <button class="btn" type="submit">Place order</button></form>
 <p class="form-note">Payment options are selections only. No payment is charged or verified.</p>`);
}
function placeOrder(form){
 const data=new FormData(form), items=Object.entries(cart).map(([id,qty])=>{const p=state.products.find(x=>x.id===id);return p?{id:p.id,name:p.name,price:p.price,qty}:null}).filter(Boolean);
 if(!items.length)return;
 const order={id:"VX-"+state.nextOrder++,username:currentUser.username,customerName:String(data.get("recipient")),phone:String(data.get("phone")),address:String(data.get("address")),payment:String(data.get("payment")),items,subtotal:cartTotal(),shipping:100,total:cartTotal()+100,status:"Order Placed",createdAt:new Date().toISOString()};
 state.orders.unshift(order);save();cart={};updateHeader();closeModal();toast("Order placed: "+order.id);setView("orders");
}
function renderCustomerOrders(){
 const el=document.getElementById("customer-orders");if(!currentUser){el.innerHTML='<div class="empty">Log in to view your orders.</div>';return;}
 const orders=state.orders.filter(o=>o.username===currentUser.username);
 el.innerHTML=orders.length?orders.map(o=>`<article class="order-card"><div class="order-head"><div><h3>${esc(o.id)}</h3><div class="muted">${new Date(o.createdAt).toLocaleString()}</div></div><span class="status ${statusClass(o.status)}">${esc(o.status)}</span></div><p class="order-items">${o.items.map(i=>`${esc(i.name)} × ${i.qty}`).join("<br>")}</p><div class="order-head"><span class="muted">Payment: ${esc(o.payment)}</span><strong>${money(o.total)}</strong></div><p class="form-note">Status is updated manually by VOLTIX admin. No live location tracking.</p></article>`).join(""):'<div class="empty">You have no orders yet. Visit the shop to place a demo order.</div>';
}
function statusClass(s){if(s==="Completed / Received")return "Completed";if(s==="Cancelled")return "Cancelled";return s.replaceAll(" ","-");}
function renderAdmin(){
 if(!isAdmin())return;
 document.getElementById("admin-stats").innerHTML=`<div class="stat"><span class="muted">Products</span><strong>${state.products.length}</strong></div><div class="stat"><span class="muted">Orders</span><strong>${state.orders.length}</strong></div><div class="stat"><span class="muted">Customer accounts</span><strong>${state.users.filter(u=>u.role!=="admin").length}</strong></div>`;
 document.getElementById("admin-products").innerHTML=state.products.length?`<div class="table-wrap"><table><thead><tr><th>Product</th><th>Price</th><th></th></tr></thead><tbody>${state.products.map(p=>`<tr><td>${esc(p.emoji)} ${esc(p.name)}<br><small class="muted">${esc(p.category)}</small></td><td>${money(p.price)}</td><td><button class="small-btn" data-delete-product="${esc(p.id)}">Delete</button></td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">No products.</div>';
 document.getElementById("admin-orders").innerHTML=state.orders.length?`<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead><tbody>${state.orders.map(o=>`<tr><td><strong>${esc(o.id)}</strong><br><small class="muted">${new Date(o.createdAt).toLocaleDateString()}</small></td><td>${esc(o.customerName)}<br><small class="muted">${esc(o.username)}</small></td><td>${money(o.total)}</td><td><span class="status ${statusClass(o.status)}">${esc(o.status)}</span></td><td><select class="status-select" data-order-status="${esc(o.id)}">${STATUSES.map(s=>`<option ${s===o.status?"selected":""}>${esc(s)}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>`:'<div class="empty">No customer orders yet.</div>';
}
function renderAll(){renderProducts();renderCustomerOrders();if(isAdmin())renderAdmin();updateHeader();}
document.addEventListener("click",e=>{
 const view=e.target.closest("[data-view]");if(view){e.preventDefault();setView(view.dataset.view);return;}
 const add=e.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return;}
 const mode=e.target.closest("[data-auth-mode]");if(mode){showAuth(mode.dataset.authMode);return;}
 const qty=e.target.closest("[data-qty]");if(qty){let id=qty.dataset.qty;cart[id]=Math.max(0,(cart[id]||0)+Number(qty.dataset.delta));if(!cart[id])delete cart[id];showCart();updateHeader();return;}
 const del=e.target.closest("[data-delete-product]");if(del){if(!confirm("Delete this product from the catalog?"))return;state.products=state.products.filter(p=>p.id!==del.dataset.deleteProduct);save();renderAll();toast("Product deleted.");return;}
 if(e.target.id==="login-open")showAuth("login");
 if(e.target.id==="logout-btn"){currentUser=null;cart={};updateHeader();setView("shop");toast("Logged out.");}
 if(e.target.id==="cart-open")showCart();
 if(e.target.id==="modal-close"||e.target.id==="modal-backdrop")closeModal();
 if(e.target.id==="checkout-open")showCheckout();
});
document.addEventListener("submit",e=>{
 if(e.target.id==="auth-form"){
  e.preventDefault();const d=new FormData(e.target),username=String(d.get("username")).trim(),password=String(d.get("password"));
  if(authMode==="login"){
   // Prototype-only admin credentials. Replace with server-side authentication before deployment.
   if(username==="admin"&&password==="VoltixAdmin123!"){loginUser({username:"admin",name:"VOLTIX Admin",role:"admin"});return;}
   const user=state.users.find(u=>u.username.toLowerCase()===username.toLowerCase()&&u.password===password);
   if(!user){toast("Invalid username or password.");return;}loginUser(user);
  }else{
   const name=String(d.get("name")).trim();
   if(username.toLowerCase()==="admin"||state.users.some(u=>u.username.toLowerCase()===username.toLowerCase())){toast("That username is already taken.");return;}
   state.users.push({username,password,name,role:"customer"});save();loginUser(state.users[state.users.length-1]);
  }
 }
 if(e.target.id==="checkout-form"){e.preventDefault();placeOrder(e.target);}
 if(e.target.id==="product-form"){
  e.preventDefault();if(!isAdmin())return;
  const d=new FormData(e.target),p={id:"p"+Date.now(),name:String(d.get("name")).trim(),category:String(d.get("category")),price:Number(d.get("price")),description:String(d.get("description")).trim(),emoji:String(d.get("emoji")||"📦"),rating:null};
  if(!p.name||!p.price||p.price<1){toast("Enter a valid product and price.");return;}
  state.products.unshift(p);save();e.target.reset();renderAll();toast("Product added.");
 }
});
document.addEventListener("change",e=>{
 if(e.target.matches("[data-order-status]")){
  if(!isAdmin())return;const order=state.orders.find(o=>o.id===e.target.dataset.orderStatus);if(order){order.status=e.target.value;save();renderAll();toast("Order status updated.");}
 }
});
document.getElementById("search").addEventListener("input",renderProducts);
document.getElementById("category-filter").addEventListener("change",renderProducts);
document.getElementById("sort-filter").addEventListener("change",renderProducts);
document.getElementById("modal-backdrop").addEventListener("click",e=>{if(e.target.id==="modal-backdrop")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
renderAll();setView("shop");
