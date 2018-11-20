const express = require('express');

const router = express.Router();


//  @route  Get api/posts/test
//  @desc   Tests posts route
//  @access Public
router.get('/test', (request, response) => {

    return response.json({
        message: 'posts works'
    });

});

module.exports = router;