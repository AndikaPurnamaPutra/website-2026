// Footer "Get in Touch" form (approved proposal): opens the visitor's email app
// addressed to the studio, with the company name in the subject. Without JS the
// form's own mailto: action does the same with a plainer subject.
export function initFooterForm() {
  const form = document.querySelector("[data-footer-form]");
  if (!form) return () => {};

  const onSubmit = (event) => {
    event.preventDefault();
    const company = form.elements.subject.value.trim();
    const subject = encodeURIComponent(`Get in Touch — ${company}`);
    window.location.href = `mailto:owwstudio@gmail.com?subject=${subject}`;
  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}
