export async function loginUser(email, password) {
  try {
    const res = await fetch("http://localhost:5051/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.message || "Login failed" };
    }

    // ✅ Store token and user info
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user)); // <-- add this line

    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    console.error("Network error:", err);
    return { success: false, message: "Network error" };
  }
}