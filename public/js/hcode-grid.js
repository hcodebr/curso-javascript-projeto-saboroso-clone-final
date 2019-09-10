class HcodeGrid {

    constructor(config) {

        config.listeners = Object.assign({
            afterUpdateClick() {

                $(this.options.modalUpdate).modal('show');

            },
            afterDeleteClick() {

                window.location.reload();

            },
            afterFormCreate(){

                window.location.reload();

            },
            afterFormCreateError(){

                alert('Não foi possível enviar o formulário!');

            },
            afterFormUpdate() {

                window.location.reload();

            },
            afterFormUpdateError() {

                alert('Não foi possível enviar o formulário!');

            },
            clickRowButton(btn, row, data, e) {
                console.info('clickRowButton', btn, row, data, e);
            }
        }, config.listeners);

        this.options = Object.assign({}, {
            modalCreate: '#modal-create',
            modalUpdate: '#modal-update',
            btnUpdate: '.btn-update',
            btnDelete: '.btn-delete',
            textDeleteConfirm: 'Deseja realmente excluir?',
            onUpdateLoad: (formUpdate, name, data) => {

                let input = formUpdate.querySelector(`[name=${name}]`);

                if (input) {
                    switch (input.type) {
                        case 'date':
                            input.value = moment(data[name]).format('YYYY-MM-DD');
                            break;
                        default:
                            input.value = data[name];

                    }
                }

            }
        }, config);

        this.rows = [...document.querySelectorAll(`#${this.options.id} tbody tr`)];

        this.formCreate = document.querySelector(this.options.modalCreate + ' form');
        this.formUpdate = document.querySelector(this.options.modalUpdate + ' form');

        this.initForms();
        this.initRowButtons();

    }

    fireEvent(name, args) {

        if (typeof this.options.listeners[name] === 'function') this.options.listeners[name].apply(this, args);

    }

    getTrData(event) {

        let tr = event.path.find(el => {
            return (el.tagName.toUpperCase() === 'TR');
        });

        return JSON.parse(tr.dataset.row);

    }

    initForms() {

        if (this.formCreate) {
            this.formCreate.submitAjax({
                success: response => {
                    this.fireEvent('afterFormCreate', [response]);
                },
                failure: () => {
                    this.fireEvent('afterFormCreateError');
                }
            });
        }

        if (this.formUpdate) {
            this.formUpdate.submitAjax({
                success: response => {
                    this.fireEvent('afterFormUpdate', [response]);
                },
                failure: () => {
                    this.fireEvent('afterFormUpdateError');
                }
            });
        }

    }

    initRowButtons() {

        this.rows.forEach(row => {

            [...row.querySelectorAll('.btn')].forEach(btn => {

                btn.addEventListener('click', e => {

                    if (btn.classList.contains('btn-update')) {

                        this.actionBtnUpdate(e);

                    } else if (btn.classList.contains('btn-delete')) {

                        this.actionBtnDelete(e);

                    } else {

                        this.options.listeners.clickRowButton(btn, this.getTrData(e), row, e);

                    }

                });

            });

        });

    }

    actionBtnUpdate(e) {

        this.fireEvent('beforeUpdateClick');

        let data = this.getTrData(e);

        for (let name in data) {

            this.options.onUpdateLoad(this.formUpdate, name, data);

        }

        this.fireEvent('afterUpdateClick');

    }

    actionBtnDelete(e) {

        this.fireEvent('beforeDeleteClick');

        let data = this.getTrData(e);

        if (confirm(eval("`" + this.options.textDeleteConfirm + "`"))) {

            let xhr = new XMLHttpRequest();

            xhr.open('DELETE', eval("`" + this.options.urlDelete + "`"), true);

            xhr.onreadystatechange = response => {

                if (xhr.readyState === 4 && xhr.status === 200) {

                    this.fireEvent('afterDeleteClick');

                }

            }

            xhr.send();

        }

    }

}