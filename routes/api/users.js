const express = require('express');

const router = express.Router();


//  @route  Get api/users/test
//  @desc   Tests users route
//  @access Public
router.get('/test', (request, response) => {

    return response.json({
        message: 'Users works'
    });

});

module.exports = router;