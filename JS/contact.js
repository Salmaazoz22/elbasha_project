document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("successMsg");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // 🛑 يمنع التحويل لصفحة تانية

      const formData = new FormData(form);

      try {
        const response = await fetch("https://formspree.io/f/mjkeplye", {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          if (successMsg) successMsg.style.display = "block"; // ✅ أظهر رسالة نجاح
          form.reset();
        } else {
          alert("❌ حصل خطأ، حاول تاني.");
        }
      } catch (error) {
        alert("⚠️ مشكلة في الاتصال.");
      }
    });
  }
});
