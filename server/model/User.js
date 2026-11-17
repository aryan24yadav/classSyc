import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,'Please provide a name'],
        trim:true,
        maxlength:[50,'Name cannot be more than 50 characters']
    },
    email:{
        type : String,
        required : [true,'Please provide a email'],
        unique:true,
        trim:true,
        lowercase:true,
        match:[
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email'
        ]
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength:[6,'Password must be at least 6 characters long'],
        select:false
    }
},{
    timestamps:true
});


// hash the password before saving in database
userSchema.pre('save', async function() {
    if(!this.isModified('password')){
        return ;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password,salt);
   
})

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

export default mongoose.model('User',userSchema)
