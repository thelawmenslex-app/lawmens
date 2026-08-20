import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheet, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BackHandler, Image, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { helperSelector, update_helper } from "../Slices/helper";
import { borderradius, deviceheight, devicewidth } from "../Utilities/Dimensions";
import { Fonts } from "../Utilities/fonts";
import { RFValue } from "react-native-responsive-fontsize";
import CheckBox from 'react-native-check-box'
import { profileSelector, update_profile } from "../Slices/profile";
import { colors } from "../Utilities/colors";
import { Prettylog } from "../Actions/constant";





const Bookselect = ({ visible, onClose }) => {
    const bottomSheetModalRef = useRef();
    const snapPoints = useMemo(() => ["65%"], []);
    const dispatch = useDispatch()
    const { categories, chapters, selectedcategories } = useSelector(profileSelector)
    useEffect(() => {
        openBottomSheet();
        onClose(false)
    }, [visible]);

    const openBottomSheet = () => {
        if (visible) {
            bottomSheetModalRef.current.present();
        }
    };

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={1}
                animatedIndex={{
                    value: 1,
                }}
                opacity={Platform.OS == "android" ? 0.9 : 0.4}
            />
        ),
        []
    )


    const [dummy, setDummy] = useState([])
    const onchnage = (element, index) => {
        // var data = [...dummy]
        // data.push(index)
        // setDummy()
        dispatch(update_profile({ key: "selectcatfn", value: index }))
        
        // setSelectedindex(index)
        // dispatch(update_profile({ key: "Updateselectedcat", value: element }))
        // bottomSheetModalRef.current.close()
    }



    const [all, setAll] = useState(false)

    const allselect = () => {
        setAll(!all)
        dispatch(update_profile({ key: "updateAllcategories", value: !all }))
    }

    const [cat, setCat] = useState([])
    // useEffect(() => {
    //     if (selectedcategories) {
    //         const find = categories?.map((e) => {
    //             if (e?.status) {
    //                 return e
    //             }
    //             else
    //                 return ({
    //                   ...e,
    //                   status : false
    //                 })
    //         })
    //         Prettylog(find)
    //         setCat(find)
    //     }

    // }, [selectedcategories, categories])
    console.log(JSON.stringify(selectedcategories, null, 2));
    const [selectedindex, setSelectedindex] = useState("")
    // useEffect(() => {
    //    return () => {
    //         onClose(false)
    //     }
    // },[])

    const applyfn = async () => {

    }
    return (
        <BottomSheetModalProvider >

            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                shouldMeasureContentHeight={true}
                backgroundStyle={{ backgroundColor: "#fff" }}
                enableOverDrag={true}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: 'gray' }}


            >
                <>
                    <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(18), color: "#000", marginTop: "5%", paddingHorizontal: "2.5%", marginLeft: "2.5%" }} >Select Categories</Text>

                    <View style={{ marginHorizontal: "5%", height: "85%", paddingHorizontal: "2.5%", }} >

                        <BottomSheetScrollView
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="never"
                            showsVerticalScrollIndicator={false}
                            style={{ marginTop: "2.5%" }}
                        >


                            {/* <Pressable onPress={() => allselect()} style={{ width: "47.5%", height: deviceheight * 0.075, alignItems: "center", marginTop: "2%", flexDirection: "row", }} >
                                <View style={{ width: "25%", justifyContent: "center" }} >
                                    <CheckBox
                                        style={{ width: devicewidth * 0.1, height: devicewidth * 0.1, justifyContent: "center", alignItems: "center" }}
                                        isChecked={all}
                                        onClick={() => allselect()}
                                        checkBoxColor={colors.primary}
                                        uncheckedCheckBoxColor={"#000"}
                                    />
                                </View>

                                <View style={{ width: "90%", justifyContent: "center", height: "100%", }} >
                                    <Text style={{ marginLeft: "2.5%", fontFamily: Fonts.Regular, color: "#000", fontSize: RFValue(15) }} >All</Text>
                                </View>
                            </Pressable> */}

                            {/* <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }} > */}

                            {categories?.map((e, i) => (
                                <Pressable onPress={() => onchnage(e, i)} style={{ height: deviceheight * 0.075, alignItems: "center", flexDirection: "row", width: "100%" }} >
                                    <View style={{ width: "10%", justifyContent: "center" }} >
                                        <View style={{ width: 22, height: 22, borderRadius: 100, borderWidth: 1, borderColor: colors.primary, justifyContent: "center", alignItems: "center" }} >
                                            {e?.status &&
                                                <View style={{ width: 12, height: 12, backgroundColor: colors.primary, borderRadius: 100 }} /> 
                                                
                                            }
                                        </View>
                                    </View>

                                    <View style={{ width: "90%", justifyContent: "center", height: "100%", }} >
                                        <Text style={{ marginLeft: "2.5%", fontFamily: Fonts.Regular, color: "#000", fontSize: RFValue(15) }} >{e?.name}</Text>
                                    </View>
                                </Pressable>
                            ))}
                            {/* </View> */}

                        </BottomSheetScrollView>
                    </View>
                    {/* <View style={{ flexDirection: "row", alignItems: "center", height: "12.5%", position: "absolute", bottom: 0, right: 0, left: 0, }} >
                        <Pressable onPress={() => bottomSheetModalRef.current.close()} style={{ justifyContent: "center", alignItems: "center", width: "50%", backgroundColor: "#000", height: "100%", borderTopLeftRadius: borderradius * 0.75, }} >
                            <Text style={{ color: "#fff", fontFamily: Fonts.Medium, fontSize: RFValue(16), textAlign: "center" }}  >Cancel</Text>
                        </Pressable>
                        <Pressable onPress={() => bottomSheetModalRef.current.close()} style={{ justifyContent: "center", alignItems: "center", width: "50%", backgroundColor: colors.primary, height: "100%", borderTopRightRadius: borderradius * 0.75, }} >
                            <Text style={{ color: "#fff", fontFamily: Fonts.Medium, fontSize: RFValue(16), textAlign: "center" }}  >Apply</Text>
                        </Pressable>
                    </View> */}

                    {/* <Pressable onPress={() => bottomSheetModalRef.current.close()} style={{ justifyContent: "center", alignItems: "center", width: "100%", backgroundColor: colors.primary, borderTopLeftRadius: borderradius * 0.75,borderTopRightRadius: borderradius * 0.75,height: "12.5%", position: "absolute", bottom: 0, right: 0, left: 0, }} >
                        <Text style={{ color: "#fff", fontFamily: Fonts.Medium, fontSize: RFValue(16), textAlign: "center" }}  >Close</Text>
                    </Pressable> */}
                </>
                <Pressable onPress={() => bottomSheetModalRef.current.close()} style={{ width: "100%", height: 60, position: "absolute", bottom: 0,borderTopLeftRadius:10,borderTopRightRadius:10,backgroundColor:colors.primary,justifyContent:"center"}} >
                <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(14), textAlign: "center" }}  >Submit</Text>

                    {/* <Pressable onPress={() => bottomSheetModalRef.current.close()} style={{ width: "50%", height: "100%", borderTopLeftRadius: borderradius * 1, backgroundColor: colors.secondary, justifyContent: "center" }} >
                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(14), textAlign: "center" }}  >cancel</Text>
                    </Pressable>
                    <Pressable onPress={() => applyfn()} style={{ width: "50%", height: "100%", borderTopRightRadius: borderradius * 1, backgroundColor: colors.primary, justifyContent: "center" }} >
                        <Text style={{ color: "#000", fontFamily: Fonts.Medium, fontSize: RFValue(14), textAlign: "center" }}  >Apply</Text>
                    </Pressable> */}
                </Pressable>
            </BottomSheetModal>
        </BottomSheetModalProvider>

    )
}

export default Bookselect;