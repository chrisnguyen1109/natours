const $ = document.querySelector.bind(document);

export default (form, btnClass, beforeMsg, actionRequest, type) => {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let data = {};
        switch (type) {
            case "login":
                const email = $("#email").value;
                const password = $("#password").value;
                data = { email, password };
                break;
            case "updateUser":
                const name = $("#name").value.split(" ");
                const [firstName, ...lastName] = name;
                data = { firstName, lastName: lastName.join(" ") || "" };
                break;
            case "updatePassword":
                const currentPassword = $("#password-current").value;
                const newPassword = $("#password").value;
                const confirmPassword = $("#password-confirm").value;
                data = { currentPassword, password: newPassword, confirmPassword };
                break;
            default:
                data = {};
                break;
        }

        const afterMsg = $(`.${btnClass}`).innerHTML;
        $(`.${btnClass}`).innerHTML = beforeMsg;
        $(`.${btnClass}`).disabled = true;

        setTimeout(async () => {
            await actionRequest(data);
            $(`.${btnClass}`).innerHTML = afterMsg;
            $(`.${btnClass}`).disabled = false;
        }, 500);
    });
};
