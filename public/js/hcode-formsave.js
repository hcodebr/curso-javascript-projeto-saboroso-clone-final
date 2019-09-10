HTMLFormElement.prototype.save = function(){

    let form = this;

    return new Promise((s, f) => {

        let btnSubmit = form.querySelector('[type=submit]');
        let btnSubmitText = btnSubmit.innerHTML;

        let formData = new FormData(form);

        let xhr = new XMLHttpRequest();

        xhr.open(form.method, form.action, true);

        xhr.onloadend = event => {

            btnSubmit.innerHTML = btnSubmitText;
            btnSubmit.disabled = false;

            let response;

            try {
                response = JSON.parse(xhr.responseText);
            } catch (err) {
                response = xhr.responseText;
            }

            if (xhr.status === 200) {
                s(response);
            } else {
                f(response);
            }

        }

        xhr.onerror = () => {

            f(xhr);

        }

        btnSubmit.innerHTML = 'Enviando...';
        btnSubmit.disabled = true;

        xhr.send(formData);

    });

}

HTMLFormElement.prototype.submitAjax = function(config){

    let form = this;

    form.addEventListener('submit', e => {

        e.preventDefault();

        form.save().then((response) => {

            if (typeof config.success) config.success(response);

        }).catch(err => {

            if (typeof config.failure) config.failure(err.error || err);

        });

    });

}