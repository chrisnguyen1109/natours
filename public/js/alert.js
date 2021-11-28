const $ = document.querySelector.bind(document);

const hideAlert = () => {
    const el = $(".alert");
    if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    $("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout(hideAlert, 3000);
};

export default showAlert;
