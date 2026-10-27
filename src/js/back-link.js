// "Back" on the Privacy Policy bar (user decision): back to the previous page
// when it was on this site; otherwise the link's own target (the homepage).
export function initBackLink() {
  const link = document.querySelector("[data-back-link]");
  if (!link) return () => {};

  const goBack = (event) => {
    let fromSite = false;
    try {
      fromSite = new URL(document.referrer).origin === window.location.origin;
    } catch {
      fromSite = false;
    }
    if (!fromSite || window.history.length < 2) return;
    event.preventDefault();
    window.history.back();
  };
  link.addEventListener("click", goBack);
  return () => link.removeEventListener("click", goBack);
}
