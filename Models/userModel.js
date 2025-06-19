const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a user name']
    },
    email: {
        type: String,
        requied: [true, "Please provide your email!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String
    },
    role :{
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false // will never show in the output
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            message: "Passwords are not the same",
            // this will work on save or create !!
            validator: function (el) {
                return el === this.password;
            }
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select : false
    }
});

// npm package to decrpyt the password and save it in the db -  npm i bcryptjs

userSchema.pre('save', async function (next) {
    // return if the password is unmoddified
    if (!this.isModified('password')) return next();

    // import the decrypt method and call the hash method and save with cost 12 which is storing efficiently
    // hash yields promise, so async is given
    this.password = await bcrypt.hash(this.password, 12);

    // if a field to be deleted while saving in DB, give undefined
    this.passwordConfirm = undefined;
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})
userSchema.pre(/^find/, function(next) {
    this.find( { active : { $ne: false}})
    next();
})

// create an instance method for the document, so the this method will accesible across all the usermodel defined or document being used
userSchema.methods.correctPassword = async function (userPassword, encrtptedDbPassword) {
    return await bcrypt.compare(userPassword, encrtptedDbPassword);
}
userSchema.methods.CheckPasswordChangedAfter = function (tokenIssueAt) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );   
        return tokenIssueAt < changedTimestamp;
    }
    // False means NOT changed
    return false;
}
userSchema.methods.createPasswordResetToken = function(){
    const token =  crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash("sha256").update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return token;
}
const User = mongoose.model("User", userSchema);

module.exports = User;


// JWT token - Json Web Token arhitecture

// first when user logs in request send to server - server has a secret key with header + payload and secret key , it forms JWT token
// sends to user and stored in localstorage or session.
// later whenever a request or resource is being sent - JWT is passed - later it takes the header + payload and secret key from server and generates a test signature
// it later compares with original signature and sends the response.
// if the header or payload is changed, the signature matching will fail - leads to unauthorized data access.