const express = require('express');

const router = express.Router();

//  @route  Get api/profile/test
//  @desc   Tests profile route
//  @access Public
router.get('/test', (request, response) => {

    return response.json({
        message: 'profile works'
    });

});

module.exports = router;