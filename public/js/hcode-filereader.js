class HcodeFileReader {

    constructor(inputEl, imgEl){

        inputEl.addEventListener('change', e=> {

            let reader = new FileReader();

            reader.onload = e => {

                imgEl.src = reader.result;

            }

            if (!inputEl.files.length) {
                console.error('Nenhum arquivo foi selecionado.');
                return false;
            }

            let file = inputEl.files[0];

            if (['image/jpeg', 'image/gif', 'image/png'].indexOf(file.type) === -1) {
                console.error('Apenas arquivos de imagem são permitidos.');
                return false;
            }

            reader.readAsDataURL(file);

        });

    }

}