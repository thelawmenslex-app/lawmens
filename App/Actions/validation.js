

export const signupvalidation = (value,check,cat) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmpassword
    } = value
    console.log(email);
    var emailcheck = validateEmail(email)
    var passwordcheck = validatePassword(password)
    var firstnamecheck = validatename(firstName)
    var lastnamecheck = validatename(lastName)

    if (!firstName) {
        return "First Name is requried"
    }
    else if(!firstnamecheck){
        return "First Name must be letters"
    }
    else if (!lastName) {
        return "Last Name is requried"
    }
    else if(!lastnamecheck){
        return "Last Name must be letters"
    }
    else if (!phoneNumber) {
        return "Phonenumber is requried"
    }
    else if (!email) {
        return "Email is requried"
    }
    else if (!emailcheck) {
        return "Valid Email is requried"
    }
    else if (!cat) {
        return "Select the Profession"
    } 
    else if (!password) {
        return "Password is requried"
    }
    else if (!passwordcheck) {
        return "Password must be 8 character,one lowercase letter,one uppercase letter, one digit, one special character"
    }
    else if (!confirmpassword) {
        return "Confirm password is requried"
    }
    else if (password != confirmpassword) {
        return "Confirm password mismatch from Entered password"
    }
    else if (!check) {
        return "Accept the terms and condtions"
    } 
   
    else {
        return "success"
    }
}


export const loginvalidation = (email, password) => {

    var emailcheck = validateEmail(email)
    var passwordcheck = validatePassword(password)

    if (!email) {
        return "Email or PhoneNumber is requried"
    }
    else if (!password) {
        return "Password is requried"
    }
    else if (!emailcheck) {
        return "Valid email is requried"
    }
    else if (!passwordcheck) {
        return "Password must be 8 character,one lowercase letter,one uppercase letter, one digit, one special character"
    }
    else {
        return "success"
    }
}


export const forgotmailvalidation = (email) => {

    var emailcheck = validateEmail(email)

    if (!email) {
        return "Email  is requried"
    }
    else if (!emailcheck) {
        return "Valid email is requried"
    }
    else {
        return "success"
    }
}

export const newpassvalidation = (newpass,confirmpass) => {

    var newpasscheck = validatePassword(newpass)

    if (!newpass) {
        return "New pass is requried"
    }
    else if (!confirmpass) {
        return "Confirmpass is requried"
    }
    else if (!newpasscheck) {
        return "New password must be 8 character,one lowercase letter,one uppercase letter, one digit, one special character "
    }
    else if(newpass != confirmpass){
        return "New password is mismatched from confirmpass"
  
    }
    else {
        return "success"
    }
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return re.test(password);
}

function validatename(str) {
    return /^[^0-9]*$/.test(str);
}