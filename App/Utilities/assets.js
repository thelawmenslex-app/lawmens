import { devicewidth } from "./Dimensions";
import Lawtext from '../Assets/Icons/lawapptest.svg'
import Lawtextwhite from '../Assets/Icons/lawappwhite.svg'
import Welcomebg from '../Assets/Icons/welcomebg.svg'
import Star from '../Assets/Icons/star.svg'
import Facebook from '../Assets/Icons/Facebook.svg'
import Google from '../Assets/Icons/Google.svg'
import Apple from '../Assets/Icons/Apple.svg'
import Splash from '../Assets/Icons/splash.svg'
import Homeactive from '../Assets/Icons/homeactive.svg'
import Homeactiveinactive from '../Assets/Icons/homeinactive.svg'
import Bookmarkactive from '../Assets/Icons/bookmarkactive.svg'
import Bookmarkinactive from '../Assets/Icons/bookmarkinactive.svg'
import Historyactive from '../Assets/Icons/historyactive.svg'
import Historyinactive from '../Assets/Icons/historyinactive.svg'
import Menuicon from '../Assets/Icons/menu.svg'
import Userdetail from '../Assets/Icons/userdetails.svg'
import Whitehistory from '../Assets/Icons/whitehistory.svg'
import About from '../Assets/Icons/about.svg'

import Cat1 from '../Assets/Icons/cat1.svg'
import Cat2 from '../Assets/Icons/cat2.svg'
import Cat3 from '../Assets/Icons/cat2.svg'
import Logout from '../Assets/Icons/logout.svg'

import Copy from '../Assets/Icons/copy.svg'
import Bookmark from '../Assets/Icons/Bookmark.svg'
import Share from '../Assets/Icons/share.svg'
import Home from '../Assets/Icons/Home.svg'
import Profile from '../Assets/Icons/profile.svg'
import Payment from '../Assets/Icons/profile.svg'
import { showMessage } from "react-native-flash-message";
import Profilepic from '../Assets/Icons/profile.svg'
import Camera from '../Assets/Icons/camera.svg'
import Contact from '../Assets/Icons/contact.svg'

export const Images = {
      lawtext:<Lawtext width={devicewidth*0.25} height={devicewidth*0.25} />,
      lawtextwhite:<Lawtextwhite width={devicewidth*0.25} height={devicewidth*0.25} />,
      welcomebg:<Welcomebg width={devicewidth*0.7} height={devicewidth*0.7} style={{alignSelf:"center"}} />,
      star:<Star width={devicewidth*0.11} height={devicewidth*0.11} style={{alignSelf:"center"}} />,
      facebook:<Facebook width={devicewidth*0.06} height={devicewidth*0.06} style={{alignSelf:"center"}} />,
      google:<Google width={devicewidth*0.07} height={devicewidth*0.07} style={{alignSelf:"center"}} />,
      apple:<Apple width={devicewidth*0.06} height={devicewidth*0.06} style={{alignSelf:"center"}} />,
      spalsh:<Splash width={devicewidth*0.6} height={devicewidth*0.6} style={{alignSelf:"center"}} />,
      homeactive:<Homeactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      homeactiveinactive:<Homeactiveinactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      bookmarkactive:<Bookmarkactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      bookmarkinactive:<Bookmarkinactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      historyactive :<Historyactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      historyinactive :<Historyinactive width={devicewidth*0.055} height={devicewidth*0.055} style={{alignSelf:"center"}} />,
      menu:<Menuicon width={devicewidth*0.045} height={devicewidth*0.045} style={{alignSelf:"center"}}  />,
      userdetail:<Userdetail width={devicewidth*0.07} height={devicewidth*0.07} style={{alignSelf:"center"}}  />,
      whitehistory:<Whitehistory width={devicewidth*0.06} height={devicewidth*0.06} style={{alignSelf:"center"}}  />,
      About:<About width={devicewidth*0.06} height={devicewidth*0.06} style={{alignSelf:"center"}}  />,
      payment:<Payment width={devicewidth*0.06} height={devicewidth*0.06} style={{alignSelf:"center"}}  />,
      cat1:require("../Assets/Icons/test.png"),
      cat2:require("../Assets/Icons/test1.png"),
      cat3:require("../Assets/Icons/test2.png"),
      logout:<Logout width={devicewidth*0.075} height={devicewidth*0.075}   />,
      copy:<Copy width={devicewidth*0.05} height={devicewidth*0.05}  style={{alignSelf:"center"}} />,
      Bookmark:<Bookmark width={devicewidth*0.05} height={devicewidth*0.05} style={{alignSelf:"center"}}   />,
      share:<Share width={devicewidth*0.05} height={devicewidth*0.05} style={{alignSelf:"center"}}   />,
      home:<Home width={devicewidth*0.05} height={devicewidth*0.05} style={{alignSelf:"center"}}   />,
      profile:<Profile  width={devicewidth*0.185} height={devicewidth*0.185}    />,
      profilepic:<Profilepic  width={"100%"} height={"100%"}     />,
      camera:<Camera  width={devicewidth*0.075} height={devicewidth*0.075} style={{alignSelf:"center"}}    />,
      newprofile:require("../Assets/Icons/newprofile.png"),
      newprofileactive:require("../Assets/Icons/newprofileactive.png"),
      splash1:require("../Assets/Icons/logo.jpeg"),
      subscribe:require("../Assets/Icons/subscribe.png"),
      contactus:require("../Assets/Icons/information.png"),
      discliamer:require("../Assets/Icons/disclaimer.png"),
      privacy:require("../Assets/Icons/privacy.png"),
      search:require("../Assets/Icons/search.png"),
      man:require("../Assets/Icons/man.png"),
      global:require("../Assets/Icons/global.png"),
      contact:<Contact width={devicewidth*0.3} height={devicewidth*0.3} style={{alignSelf:"center"}}   />,
      background:require("../Assets/Icons/background.jpeg"),

}

export const shownegativemessage = (title,description,duration) => {
            showMessage({
                  message:title,
                  description:description,
                  type: "danger",
                  duration:duration
                });
}

export const showpostivemessage = (title,description,duration) => {
      showMessage({
            message:title,
            description:description,
            type: "success",
            duration:duration
          });
}