const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('./keys');

// console.log(keys);

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secretKey
};

// options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// options.secretKey = keys.secretKey;

module.exports = passport  => {

    passport.use(
        new JwtStrategy(
            options, 
            (jwt_payload, done ) => {
                // console.log('jwt payload', jwt_payload );
            
                User.findById( jwt_payload.id )
                    .then( ( user ) => {
                        if ( user ) {
                            return done(null, user);
                        }
                        return done( null, false );
                    })
                    .catch( (e) => {
                        console.log('find by id catch ', e);
                    });
            }
        )
    );
}