import { ActivityIndicator, Image, Keyboard, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import MyStatusBar from "../../Utilities/statusbar";
import LinearGradient from "react-native-linear-gradient";
import { borderradius, deviceheight, devicewidth } from "../../Utilities/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../Utilities/fonts";
import Icon from 'react-native-vector-icons/Ionicons'
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Filter from "react-native-vector-icons/MaterialIcons";
import Globe from "react-native-vector-icons/Feather";

import { colors } from "../../Utilities/colors";
import Bookselect from "../../Components/bookselect";
import { profileSelector } from "../../Slices/profile";
import { useSelector } from "react-redux";
import { Images, shownegativemessage } from "../../Utilities/assets";
import { Prettylog, backendroutes } from "../../Actions/constant";
import { helperSelector } from "../../Slices/helper";
import debounce from 'lodash.debounce';


export default function Filtersearch(props) {
    const [search, setSearch] = useState("")
    const [active, setActive] = useState(false)
    const { categories, chapters, selectedcategories, profiledata, currentplan } = useSelector(profileSelector)
    const { authtoken } = useSelector(helperSelector)

    const [loader, setLoader] = useState(false)
    const [selectedindex, setSelectedindex] = useState("")

    useEffect(() => {
        if (categories) {
            // clearsearch()
            initialfn()
            if(categories){
                var data =   (categories?.filter((e) => e?.status))
                if(data?.length == 1){
                    setTabbar(false)
                }
            }
           
        }

    }, [categories])

    const initialfn = async () => {
        try {
            var data = categories?.filter((e) => e.status)
            var result = data.map((e) => {
                 return e?._id
             })
           
            var payload = {
                categoryId: result
            }
            setLoader(true)
            const response = await axios({
                method: "post",
                url: `${backendroutes.casefilter}`,
                data: payload,
                headers: {
                    Authorization: authtoken
                }
            })
            setLoader(false)

            if (response?.data?.status) {
                var local = response.data?.data.map((e) => ({
                    ...e,
                    sections: [],
                    status: false
                }))
                setChapterlist(local)

            }

        } catch (error) {
            console.log("initialfner", error);
            setChapterlist([])
        }
    }

    const [sectionloader, setSectionloader] = useState(false)
    const [chapterlist, setChapterlist] = useState([])

    const [searchresults, setSearchresult] = useState([])

    const seclist = async (value, index) => {
       // if (currentplan?.length || (index == 0 || index == 1 || index == 2)) {
            var local = [...chapterlist]
            if (value?.sections?.length) {
                local[index].status = !local[index].status
                setChapterlist(local)
            }
            else {
                setSelectedindex(index)
                setSectionloader(true)
                const response = await axios({
                    method: "Get",
                    url: `${backendroutes.getSections}` + value?._id,
                    headers: {
                        Authorization: authtoken
                    }
                })
                setSectionloader(false)
                setSelectedindex("")

                if (response?.data?.status) {
                    // setSectionlist(response?.data?.data)
                    var data = [...chapterlist]
                    data[index]["sections"] = response?.data?.data
                    data[index].status = true
                    setChapterlist(data)
                }
                else {
                    shownegativemessage("Not found!", response?.status?.message)
                }
            }
      //  }
        // else {
        //     props?.navigation?.navigate("Subscription")
        //     shownegativemessage("Subscribe!", "Subscribe to get the unlimited content viewing", 4000)
        // }
    }


    const secfn = (element, e, index) => {
        console.log(element);
        console.log(e?._id);
        var detail = {
            "_id": element?.baseId,
            "sectionId": element?._id
        }
        console.log(detail);

        props?.navigation?.navigate("Seclist", { value: detail, chapterid: e?._id, filter: "search" });

        // if (currentplan?.length) {
        //     props?.navigation?.navigate("Seclist", { value: detail, chapterid: e?._id, filter: "search" })
        // }
        // else if ((index == 0 || index == 1 || index == 2)) {
        //     props?.navigation?.navigate("Seclist", { value: detail, chapterid: e?._id, filter: "search" })
        // }
        // else {
        //     props?.navigation?.navigate("Subscription")
        //     shownegativemessage("Subscribe!", "Subscribe to get the unlimited content viewing", 4000)
        // }
    }

    const controllerRef = useRef(null);

    useEffect(() => {
        if (search.length > 0) {
            debouncedSearch(search);
        } else {
            setSearchresult([])
        }
    }, [search,categories]);

    const debouncedSearch = debounce(async (query) => {
        try {
            // var check = isNaN(search)
            // console.log(check);
            // setSearch(search)

            // if ((check && (search.length >= 3)) || !check) {
            //     setLoader(true)
            //     console.log(search);
            setLoader(true)
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            controllerRef.current = new AbortController();
            const signal = controllerRef.current.signal;

            var data = categories?.filter((e) => e.status)
           var result = data.map((e) => {
                return e?._id
            })
        //    alert(JSON.stringify(result,null,2))
            var payload = {
                categoryId: result
            }
            const response = await axios({
                method: "post",
                url: `${backendroutes?.casefilter}` + "?search=" + search,
                data: payload,
                signal:signal,
                headers: {
                    Authorization: authtoken
                }
            })
            if (response?.data?.status) {
                console.log(JSON.stringify(response?.data?.data, null, 2));
                setSearchresult(response?.data?.data)
                setLoader(false)

            }
            // }

        } catch (error) {
            setLoader(false)

            console.log(error, "searchapicall_error");
        }
    }, 300);


    const searchfn = (e) => {
        console.log(profiledata?.count?.total, profiledata?.count?.current);

        props?.navigation?.navigate("Seclist", { value: e, chapterid: e?._id, filter: "search" });
        
        // if (currentplan?.length) {
        //     props?.navigation?.navigate("Seclist", { value: e, chapterid: e?._id, filter: "search" })

        // }
        // else if (profiledata?.count?.current < profiledata?.count?.total) {
        //     props?.navigation?.navigate("Seclist", { value: e, chapterid: e?._id, filter: "search" })
        // }
        // else {
        //     props?.navigation?.navigate("Subscription")
        //     shownegativemessage("Subscribe!", "Subscribe to get the unlimited content viewing", 4000)
        // }
    }
    const [tabbar, setTabbar] = useState(false)
    Prettylog()

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }} >
            <MyStatusBar backgroundColor={"#111111"} barstyle={"light-content"} />

            <LinearGradient colors={["#111111", "#313131"]}  style={{ height: deviceheight * 0.225, borderBottomLeftRadius: borderradius * 1, borderBottomRightRadius: borderradius * 1, paddingHorizontal: deviceheight * 0.025, }} >

                <View style={{ alignItems: "center", marginTop: "2.5%", flexDirection: "row", justifyContent: "center", height: deviceheight * 0.125 }} >
                    <Text style={{ color: colors.primary, fontFamily: Fonts.Extrabold, fontSize: RFValue(20) }} >THE-LAWMEN'S</Text>

                    <Pressable onPress={() => {props?.navigation.goBack()}} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, backgroundColor: colors.primary, justifyContent: "center", borderRadius: borderradius * 2, position: "absolute", left: 0, }} >
                        <Icon name={"arrow-back"} size={devicewidth * 0.06} color={"#000"} style={{ alignSelf: "center" }} />
                    </Pressable>
                    <Pressable onPress={() => setActive(true)} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, backgroundColor: colors.primary, justifyContent: "center", borderRadius: borderradius * 2, position: "absolute", right: 0, }} >
                        <Filter name={"filter-alt"} size={devicewidth * 0.06} color={"#000"} style={{ alignSelf: "center" }} />
                    </Pressable>
                </View>
                <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }} >
                    <View onPress={() => navigation.navigate("Chapterlist")} style={{ width: "85%", alignItems: "center", flexDirection: "row", borderWidth: 0.5, borderColor: "gray", borderRadius: 10 }} >
                        <View style={{ width: "80%", justifyContent: "center", }} >
                            <TextInput
                                style={{ color: "#fff", fontFamily: Fonts.Regular, fontSize: RFValue(15), width: "90%", marginLeft: "2.5%", }}
                                placeholder="Search sections"
                                placeholderTextColor={"gray"}
                                value={search}
                                onChangeText={(text) => setSearch(text)}
                            />
                        </View>
                        {!search?.length ?
                            <View style={{ width: "20%", justifyContent: "center", }} >
                                <Icon size={devicewidth * 0.05} color={"#fff"} name={"search"} style={{ alignSelf: "center" }} />
                            </View> :
                            <Pressable onPress={() => setSearch("")} style={{ width: "20%", justifyContent: "center", }} >
                                <Icon size={devicewidth * 0.05} color={"#fff"} name={"close"} style={{ alignSelf: "center" }} />
                            </Pressable>}
                    </View>
                    <View style={{ width: "20%", alignItems: "center" }} >
                        <Pressable onPress={() => props?.navigation?.navigate("Chapterlist")} style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, backgroundColor: colors.primary, justifyContent: "center", borderRadius: borderradius * 2, }} >
                            {/* <Globe name={"Globe"} size={devicewidth * 0.06} color={"#000"} style={{ alignSelf: "center" }} /> */}
                         <Image style={{width:devicewidth*0.065,height:devicewidth*0.065,tintColor:"#000",alignSelf:"center"}} source={Images.global} />
                        </Pressable>
                    </View>
                </View>
            </LinearGradient>
            {(categories?.filter((e) => e?.status))?.length  == 1 &&
            <View style={{ height: deviceheight * 0.075, flexDirection: "row", alignItems: "center" }} >
                <Pressable onPress={() => setTabbar(!tabbar)} style={{ width: "50%", justifyContent: "center", alignItems: "center", borderBottomWidth: !tabbar ? 3 : 1, borderBottomColor: !tabbar ? colors.primary : "#000", height: "100%" }} >
                    <Text style={{ color: !tabbar ? colors.primary : "#000", fontFamily: tabbar ? Fonts.Regular : Fonts.Bold, fontSize: RFValue(17), width: "90%", textAlign: "center" }} numberOfLines={1} >SECTION</Text>
                </Pressable>
                <Pressable onPress={() => setTabbar(!tabbar)} style={{ width: "50%", justifyContent: "center", alignItems: "center", borderBottomWidth: tabbar ? 3 : 1, borderBottomColor: tabbar ? colors.primary : "#000", height: "100%" }} >
                    <Text style={{ color: tabbar ? colors.primary : "#000", fontFamily: !tabbar ? Fonts.Regular : Fonts.Bold, fontSize: RFValue(17), width: "90%", textAlign: "center" }} numberOfLines={1} >ACT</Text>
                </Pressable>
            </View>}
            <View style={{ height:(categories?.filter((e) => e?.status))?.length  == 1 ? deviceheight * 0.665 : deviceheight * 0.7, marginVertical: 20, paddingHorizontal: 20 }} >
                <ScrollView showsVerticalScrollIndicator={false}  >
                    {!tabbar ?
                        <>
                            {!search?.length ?
                                <>
                                    {/* Filter search ui */}
                                    {!loader ?
                                        <>
                                            {chapterlist?.length ?
                                                chapterlist?.map((e, i) => (
                                                    <>
                                                        <Pressable onPress={() => seclist(e, i)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: borderradius * 0.75, backgroundColor: colors.primary, width: "100%", marginTop: "5%", paddingVertical: 15, }} >
                                                            <View style={{ width: "85%", paddingHorizontal: 10 }} >
                                                                <Text numberOfLines={1} style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", }}>{e?.name}</Text>
                                                            </View>
                                                            <View style={{ width: "15%", alignItems: "center" }} >
                                                                {(selectedindex == i) && (sectionloader) ?
                                                                    <ActivityIndicator size={"small"} color={"#000"} /> :
                                                                    <Icon name={"chevron-down"} size={devicewidth * 0.05} color={"#000"} style={{ transform: [{ rotate: e?.status ? "0deg" : '270deg' }] }} />
                                                                }
                                                            </View>
                                                        </Pressable>
                                                        {((e?.sections?.length) && (e?.status)) ?
                                                            e?.sections?.map((element, index) => (
                                                                <Pressable onPress={() => secfn(element, e, index)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: borderradius * 0.75, backgroundColor: colors.secondary, width: "100%", marginTop: "5%", paddingVertical: 10, borderWidth: 1, borderColor: colors.primary }} >
                                                                    <View style={{ width: "17.5%", justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderColor: "gray" }} >
                                                                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", textAlign: "center" }}>{element?.name}</Text>
                                                                    </View>
                                                                    <View style={{ width: "85%", justifyContent: "center", paddingHorizontal: 15 }} >
                                                                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", }}>{element?.title}</Text>
                                                                    </View>
                                                                </Pressable>
                                                            ))
                                                            : null

                                                        }
                                                    </>
                                                ))
                                                :
                                                <View style={{ height: deviceheight * 0.5, justifyContent: "center" }} >
                                                    <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(14), width: "100%", textAlign: "center" }} >No Chapters Found</Text>
                                                </View>}
                                        </> :
                                        <View style={{ height: deviceheight * 0.5, justifyContent: "center" }} >
                                            <ActivityIndicator size={"small"} color={"#000"} style={{ alignSelf: "center" }} />
                                        </View>}
                                </>
                                :
                                // Search short ui
                                // loader?
                                <>
                                 {!loader ?
                                    searchresults?.length ?
                                        <>
                                            {searchresults?.map((e, i) => (
                                                <Pressable onPress={() => searchfn(e, i)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: borderradius * 0.75, backgroundColor: colors.secondary, width: "100%", marginTop: "5%", paddingVertical: 10, borderWidth: 1, borderColor: colors.primary }} >
                                                    <View style={{ width: "17.5%", justifyContent: "center", alignItems: "center", borderRightWidth: 1, borderColor: "gray" }} >
                                                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", textAlign: "center" }}>{e?.name}</Text>
                                                    </View>
                                                    <View style={{ width: "85%", justifyContent: "center", paddingHorizontal: 15 }} >
                                                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", }}>{e?.title}</Text>
                                                    </View>
                                                </Pressable>
                                            ))
                                            }
                                        </>
                                        :
                                        <View style={{ height: deviceheight * 0.5, justifyContent: "center" }} >
                                            <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(14), width: "100%", textAlign: "center" }} >No Sections Found</Text>
                                        </View>
                                        :
                                        <View style={{ height: deviceheight * 0.5, justifyContent: "center" }} >
                                        <ActivityIndicator size={"small"} color={"#000"} style={{ alignSelf: "center" }} />
                                    </View> 
                                    }
                                </>}
                        </> :
                        <>
                            {(categories?.filter((e) => e?.status))?.length &&
                            <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(13), width: "100%", }}>{(categories?.filter((e) => e?.status))[0]?.act}</Text>
}
                        </>
                                }
                </ScrollView>
            </View>
            <Bookselect visible={active} onClose={setActive} />

        </View>
    )
}