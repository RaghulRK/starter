const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"]
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide a valid email"
        }
    },
    role :{
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: "default.png"
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please reconfirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same"
        }
    },
    passwordChangedAt: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// document middleware to save the password encrypted by making it hasing using bcrypt with 12 as degree for strong hashing

userSchema.pre('save', async function (next) {
    // return to next middleware if password is not modified!
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
})

// update the password changed method if the password is getting updated!
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

// create the instance method, so it will be acccesible across the models where it is defined
// below one is check if the user given password is correct or wrong

userSchema.methods.checkPassword = async function(userPassword, encryptedpassword){
    return await bcrypt.compare(userPassword,encryptedpassword);
}

const User = mongoose.model("User", userSchema);
module.exports = User;
