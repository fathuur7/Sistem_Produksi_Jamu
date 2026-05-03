const express = require('express');
const router = express.Router();

router.use('/auth',     require('./auth'));
router.use('/users',    require('./users'));
router.use('/kota',     require('./kota'));
router.use('/jamu',     require('./jamu'));
router.use('/rempah',   require('./rempah'));
router.use('/khasiat',  require('./khasiat'));
router.use('/search',   require('./search'));

module.exports = router;
