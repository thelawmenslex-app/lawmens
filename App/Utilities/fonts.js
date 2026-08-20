import Toast from 'react-native-simple-toast';


export const Fonts = {
    Regular: "Poppins-Regular",
    Medium: "Poppins-Medium",
    Light: "Poppins-Light",
    Bold: "Poppins-Bold",
    Semibold: "Poppins-SemiBold",
    Extrabold: "Poppins-ExtraBold"
}

export const Toastfn = (message) => {
    Toast.show(message,Toast.SHORT);
}