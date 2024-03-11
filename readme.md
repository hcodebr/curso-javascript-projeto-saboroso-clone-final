# Projeto final Restaurante Saboriso

## Como usar

> ⚠️ Recomendo instalar o docker para subir o mysql e o redis tranquilamente

```sh
# clonando o projeto
git clone https://github.com/hcodebr/curso-javascript-projeto-saboroso-clone-final.git restaurante-saboroso;
cd restaurante-saboroso;

# instalando as dependencias da view
cd public/admin;
export BOWER_REGISTRY=http://registry.bower.io;
bower install;
cd ../..;

# rodando os bancos no docker
docker compose up -d;

# instalando as dependencias e rodando o projeto
npm install --force;
set DEBUG=saboroso:* & npm run dev;
```

> Navegue para [http:127.0.0.1:3000](http:127.0.0.1:3000)