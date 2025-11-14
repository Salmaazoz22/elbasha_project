function toggleLanguage() {
  const btn = document.querySelector(".lang-btn");
  const isArabic = btn.innerText === "AR";

  document.querySelectorAll("[data-en]").forEach((el) => {
    el.innerText = isArabic
      ? el.getAttribute("data-ar")
      : el.getAttribute("data-en");
  });

  btn.innerText = isArabic ? "EN" : "AR";
  document.body.dir = isArabic ? "rtl" : "ltr";
}
