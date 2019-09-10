module.exports = (io) => {

    let moment = require('moment');
    let admin = require('./../inc/admin')(io);
    let express = require('express');
    let router = express.Router();

    moment.locale('pt-BR');

    router.use((req, res, next) => {

        if (['/login'].indexOf(req.url) === -1 && (req.session && !req.session.user)) {

            res.redirect('/admin/login');

        } else {

            next();

        }

    });

    router.get('/', (req, res, next) => {

        admin.home().then(data => {

            res.render('admin/index', {
                url: req.url,
                user: req.session.user,
                data
            });

        });

    });

    router.get('/stats', (req, res, next) => {

        admin.home().then(data => {

            res.send(data);

        });

    });

    router.get('/login', (req, res, next) => {

        res.render('admin/login', {
            error: null
        });

    });

    router.post('/login', (req, res, next) => {

        let render = (error) => {

            res.render('admin/login', {
                error
            });

        };

        admin.login(req).then(user => {

            res.redirect('/admin');

        }).catch(err => {

            render(err);

        });

    });

    router.get('/contacts', (req, res, next) => {

        admin.contacts().then(data => {

            res.render('admin/contacts', {
                url: req.url,
                user: req.session.user,
                data
            });

        });

    });

    router.delete('/contacts/:id', (req, res, next) => {

        admin.contactsDelete(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.get('/menu', (req, res, next) => {

        admin.menus().then(data => {

            res.render('admin/menu', {
                url: req.url,
                user: req.session.user,
                data
            });

        });

    });

    router.post('/menu', (req, res, next) => {

        admin.menuSave(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.delete('/menu/:id', (req, res, next) => {

        admin.menuDelete(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.get('/reservations', (req, res, next) => {

        req.query.start = (req.query.start) ? moment(req.query.start).format('YYYY-MM-DD') : moment().subtract(1, 'year').format('YYYY-MM-DD');
        req.query.end = (req.query.end) ? moment(req.query.end).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        admin.reservations(req.query).then(pagination => {

            res.render('admin/reservations', {
                url: req.url,
                user: req.session.user,
                pagination,
                moment,
                date: {
                    start: req.query.start,
                    end: req.query.end
                }
            });

        });

    });

    router.get('/reservations/chart', (req, res, next) => {

        req.query.start = (req.query.start) ? moment(req.query.start).format('YYYY-MM-DD') : moment().subtract(1, 'year').format('YYYY-MM-DD');
        req.query.end = (req.query.end) ? moment(req.query.end).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

        admin.reservationsChart(req.query).then(chartData => {

            res.send(chartData);

        });

    });

    router.post('/reservations', (req, res, next) => {

        admin.reservationSave(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.delete('/reservations/:id', (req, res, next) => {

        admin.reservationsDelete(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.get('/users', (req, res, next) => {

        admin.users().then(data => {

            res.render('admin/users', {
                url: req.url,
                user: req.session.user,
                data,
                moment
            });

        });

    });

    router.post('/users', (req, res, next) => {

        admin.usersSave(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.post('/users/password', (req, res, next) => {

        admin.usersPassword(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.delete('/users/:id', (req, res, next) => {

        admin.usersDelete(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.get('/emails', (req, res, next) => {

        admin.emails().then(data => {

            res.render('admin/emails', {
                url: req.url,
                user: req.session.user,
                data
            });

        });

    });

    router.delete('/emails/:id', (req, res, next) => {

        admin.emailsDelete(req).then(data => {

            res.send(data);

        }).catch(err => {

            res.status(400);
            res.send({
                error: err
            });

        });

    });

    router.get('/logout', (req, res, next) => {

        delete req.session.user;

        res.redirect('/admin/login');

    });

    return router;

};