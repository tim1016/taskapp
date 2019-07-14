const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim:true,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase:true,
        validate(valid){
            if(!validator.isEmail(valid)){
                throw new Error('Please enter valid email ID')
            }
        }

    },
    password:{
        type: String,
        required: true,
        trim:true,
        minlength: 6,
        validate(valid){
            if(valid.includes('password')){
                throw new Error('The passwords must not containt the string \"password\".');
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;        


}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});

    if(!user){
        throw new Error('Unable to log in.')
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('Unable to log in. Passwords don\'t match');
    }

    return user;
}



// Hash the plain text password
userSchema.pre('save', async function(next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
})


const User = mongoose.model('User', userSchema);

module.exports = User;