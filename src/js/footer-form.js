// Footer "Get in Touch" form (approved proposal): opens the visitor's email app
// addressed to the studio, with the visitor's email in the subject. Without JS
// the form leads to the Contact page (src/pug/partials/footer.pug).
export function initFooterForm() {
  const form = document.querySelector("[data-footer-form]");
  if (!form) return () => {};

  const onSubmit = (event) => {
    event.preventDefault();
    const email = form.elements.subject.value.trim();
    const subject = encodeURIComponent(`Get in Touch — ${email}`);
    window.location.href = `mailto:owwstudio@gmail.com?subject=${subject}`;
  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}
