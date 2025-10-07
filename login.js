document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");
  const loginBtn = document.getElementById("loginBtn");

  message.textContent = "";
  message.style.color = "#444";
  message.textContent = "Loading...";
  loginBtn.disabled = true;

  try {
    // Cek User ke API
    const res = await fetch("https://dummyjson.com/users");
    if (!res.ok) throw new Error("Gagal terhubung ke server!");
    const data = await res.json();

    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      message.style.color = "red";
      message.textContent = "❌ Username tidak ditemukan!";
      loginBtn.disabled = false;
      return;
    }

    if (!password) {
      message.style.color = "red";
      message.textContent = "⚠️ Password tidak boleh kosong!";
      loginBtn.disabled = false;
      return;
    }

    message.style.color = "green";
    message.textContent = "✅ Login berhasil!";

    localStorage.setItem("firstName", user.firstName);

    setTimeout(() => {
      window.location.href = "recipes.html";
    }, 1000);

  } catch (err) {
    message.style.color = "red";
    message.textContent = "⚠️ Error: " + err.message;
  } finally {
    loginBtn.disabled = false;
  }
});
