# Projeto final Restaurante Saboriso

## Como usar

> ⚠️ Recomendo instalar o docker para subir o mysql e o redis tranquilamente

### Clonando o projeto
```sh
git clone https://github.com/hcodebr/curso-javascript-projeto-saboroso-clone-final.git restaurante-saboroso;
cd restaurante-saboroso;
```

### Instalando as dependencias da view

```sh
cd public/admin;
export BOWER_REGISTRY=http://registry.bower.io;
bower install;
cd ../..;
```

### Subindo os bancos no [👉 docker](https://class.hcode.com.br/?course=docker)

```sh
docker compose up -d;
```

### Configure o [👉 banco de dados mysql](https://class.hcode.com.br/?course=mysql-8-fundamentos) seguindo o passo a passo da aula 8.3 - MY03- Instalando e Configurando o MySQL

> Os scripts sql estão aqui no projeto:

- `public/db/mysql.sql`
- `public/db/menu_inserts.sb.sql`

### Instalando as dependencias e rodando o projeto
npm install --force;
npm run dev;
```

> Navegue para [http:127.0.0.1:3000](http:127.0.0.1:3000)