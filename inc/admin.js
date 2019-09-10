let conn = require('./db');
let formidable = require('formidable');
let path = require('path');
let Pagination = require('./Pagination');
let moment = require('moment');

module.exports = (io) => {

    return {
        login(req) {

            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT * FROM tb_users WHERE email = ?
                `,
                    [
                        req.body.email
                    ],
                    (err, results) => {

                        if (err) {
                            f(err);
                        } else if (results.length === 0) {
                            f('Usuário e/ou senha incorretos.');
                        } else if (results[0].password !== req.body.password) {
                            f('Usuário e/ou senha incorretos.');
                        } else {

                            let user = results[0];

                            req.session.user = user;

                            s(user);

                        }

                    }
                );

            });

        },
        home() {

            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT
                        (SELECT COUNT(*) FROM tb_contacts) AS nrcontacts,
                        (SELECT COUNT(*) FROM tb_menus) AS nrmenus,
                        (SELECT COUNT(*) FROM tb_reservations) AS nrreservations,
                        (SELECT COUNT(*) FROM tb_users) AS nrusers
                `,
                    (err, results) => {

                        if (err) {

                            f(err);

                        } else {

                            s(results[0]);

                        }

                    }
                );

            });

        },
        menus() {

            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT * FROM tb_menus ORDER BY title
                `,
                    (err, results) => {

                        if (err) {
                            f(err);
                        } else {
                            s(results);
                        }

                    }
                );

            });

        },
        menuSave(req) {

            return new Promise((s, f) => {

                let form = new formidable.IncomingForm({
                    uploadDir: path.join(__dirname, `../public/images`),
                    keepExtensions: true
                });

                form.parse(req, function (err, fields, files) {

                    if (err) {
                        f(err);
                    } else {

                        if (!files.photo) {

                            f('A foto não foi enviada!');

                        } else {

                            fields.photo = 'images/' + path.parse(files.photo.path).base;

                            let query, params;

                            if (parseInt(fields.id) > 0) {

                                query = `
                                UPDATE tb_menus
                                SET title = ?, description = ?, price = ?, photo = ?
                                WHERE id = ?
                            `;
                                params = [
                                    fields.title,
                                    fields.description,
                                    fields.price,
                                    fields.photo,
                                    fields.id
                                ];


                            } else {

                                query = `
                                INSERT INTO tb_menus (title, description, price, photo)
                                VALUES(?, ?, ?, ?)
                            `;
                                params = [
                                    fields.title,
                                    fields.description,
                                    fields.price,
                                    fields.photo
                                ];

                            }

                            conn.query(query, params, (err, results) => {

                                if (err) {
                                    f(err);
                                } else {

                                    io.emit('reservations update', fields);

                                    s(fields, results);

                                }

                            }
                            );

                        }

                    }

                });

            });

        },
        menuDelete(req) {

            return new Promise((s, r) => {

                if (!req.params.id) {
                    f('Informe o ID.');
                } else {

                    conn.query(`
                    DELETE FROM tb_menus WHERE id = ?
                `, [
                            req.params.id
                        ], (err, results) => {

                            if (err) {
                                f(err);
                            } else {
                                io.emit('reservations update');
                                s(results);
                            }

                        });

                }

            });

        },
        reservationSave(req) {

            return new Promise((s, f) => {

                let form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {

                    let query, params;

                    if (parseInt(fields.id) > 0) {

                        query = `
                                UPDATE tb_reservations
                                SET name = ?, email = ?, people = ?, date = ?, time = ?
                                WHERE id = ?
                            `;
                        params = [
                            fields.name,
                            fields.email,
                            fields.people,
                            fields.date,
                            fields.time,
                            fields.id
                        ];


                    } else {

                        query = `
                                INSERT INTO tb_reservations (name, email, people, date, time)
                                VALUES(?, ?, ?, ?, ?)
                            `;
                        params = [
                            fields.name,
                            fields.email,
                            fields.people,
                            fields.date,
                            fields.time,
                        ];

                    }

                    conn.query(query, params, (err, results) => {

                        if (err) {
                            f(err);
                        } else {

                            io.emit('reservations update', fields);

                            s(fields, results);

                        }

                    }
                    );

                });

            });

        },
        reservations(params) {

            return new Promise((s, f) => {

                let pag = new Pagination(
                    "SELECT SQL_CALC_FOUND_ROWS * FROM tb_reservations WHERE date BETWEEN ? AND ? ORDER BY name LIMIT ?, ?",
                    [
                        params.start,
                        params.end
                    ]
                );

                pag.getPage(params.page).then(data => {

                    s({
                        data,
                        total: pag.getTotal(),
                        current: pag.getCurrentPage(),
                        pages: pag.getTotalPages(),
                        nav: pag.getNavigation(params)
                    });

                }).catch(err => {

                    f(f);

                });

            });

        },
        reservationsChart(params) {

            return new Promise((s, f) => {

                conn.query(`
                SELECT CONCAT(YEAR(date), '-', MONTH(date)) AS date, COUNT(*) AS total, SUM(people) / COUNT(*) AS avg_people
                FROM tb_reservations
                WHERE date BETWEEN ? AND ?
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date), MONTH(date)
            `, [
                        params.start,
                        params.end
                    ], (err, results) => {

                        if (err) {
                            f(err);
                        } else {

                            let months = [];
                            let values = [];

                            results.forEach(row => {

                                months.push(moment(row.date).format('MMM YYYY'));
                                values.push(row.total);

                            });

                            s({
                                months,
                                values
                            });

                        }

                    });

            });

        },
        reservationsDelete(req) {

            return new Promise((s, r) => {

                if (!req.params.id) {
                    f('Informe o ID.');
                } else {

                    conn.query(`
                    DELETE FROM tb_reservations WHERE id = ?
                `, [
                            req.params.id
                        ], (err, results) => {

                            if (err) {
                                f(err);
                            } else {

                                io.emit('reservations update');

                                s(results);
                            }

                        });

                }

            });

        },
        users() {
            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT * FROM tb_users ORDER BY name
                `,
                    (err, results) => {

                        if (err) {
                            f(err);
                        } else {
                            s(results);
                        }

                    }
                );

            });
        },
        usersSave(req) {

            return new Promise((s, f) => {

                let form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {

                    let query, params;

                    if (parseInt(fields.id) > 0) {

                        query = `
                                UPDATE tb_users
                                SET name = ?, email = ?
                                WHERE id = ?
                            `;
                        params = [
                            fields.name,
                            fields.email,
                            fields.id
                        ];


                    } else {

                        query = `
                                INSERT INTO tb_users (name, email, password)
                                VALUES(?, ?, ?)
                            `;
                        params = [
                            fields.name,
                            fields.email,
                            fields.password
                        ];

                    }

                    conn.query(query, params, (err, results) => {

                        if (err) {
                            f(err);
                        } else {

                            io.emit('reservations update', fields);

                            s(fields, results);

                        }

                    }
                    );

                });

            });

        },
        usersDelete(req) {

            return new Promise((s, r) => {

                if (!req.params.id) {
                    f('Informe o ID.');
                } else {

                    conn.query(`
                    DELETE FROM tb_users WHERE id = ?
                `, [
                            req.params.id
                        ], (err, results) => {

                            if (err) {
                                f(err);
                            } else {
                                io.emit('reservations update');
                                s(results);
                            }

                        });

                }

            });

        },
        usersPassword(req) {

            return new Promise((s, f) => {

                let form = new formidable.IncomingForm();

                form.parse(req, function (err, fields, files) {

                    if (err) {
                        f(err);
                    } else {

                        if (!fields.password) {
                            f('Preencha a senha.');
                        } else if (fields.password !== fields.passwordConfirm) {
                            f('Confirme a senha corretamente.');
                        } else {

                            conn.query(`
                            UPDATE tb_users SET password = ? WHERE id = ?
                        `, [
                                    fields.password,
                                    fields.id
                                ], (err, results) => {

                                    if (err) {
                                        f(err);
                                    } else {
                                        s(results);
                                    }

                                });

                        }

                    }

                });

            });

        },
        contacts() {
            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT * FROM tb_contacts ORDER BY name
                `,
                    (err, results) => {

                        if (err) {
                            f(err);
                        } else {
                            s(results);
                        }

                    }
                );

            });
        },
        contactsDelete(req) {
            return new Promise((s, r) => {

                if (!req.params.id) {
                    f('Informe o ID.');
                } else {

                    conn.query(`
                    DELETE FROM tb_contacts WHERE id = ?
                `, [
                            req.params.id
                        ], (err, results) => {

                            if (err) {
                                f(err);
                            } else {
                                io.emit('reservations update');
                                s(results);
                            }

                        });

                }

            });
        },
        emails() {
            return new Promise((s, f) => {

                conn.query(
                    `
                    SELECT * FROM tb_emails ORDER BY email
                `,
                    (err, results) => {

                        if (err) {
                            f(err);
                        } else {
                            s(results);
                        }

                    }
                );

            });
        },
        emailsDelete(req) {
            return new Promise((s, r) => {

                if (!req.params.id) {
                    f('Informe o ID.');
                } else {

                    conn.query(`
                    DELETE FROM tb_emails WHERE id = ?
                `, [
                            req.params.id
                        ], (err, results) => {

                            if (err) {
                                f(err);
                            } else {
                                io.emit('reservations update');
                                s(results);
                            }

                        });

                }

            });
        }
    };

}