import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop, BottomSheet, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BackHandler, Image, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RFValue } from "react-native-responsive-fontsize";
import { Fonts } from "../../../Utilities/fonts";
import { colors } from "../../../Utilities/colors";
import axios from "axios";
import { Prettylog, backendroutes } from "../../../Actions/constant";
import { deviceheight } from "../../../Utilities/Dimensions";
import { profileSelector } from "../../../Slices/profile";





const Categoryselect = ({ visible, onClose,cate }) => {
    const bottomSheetModalRef = useRef();
    const snapPoints = useMemo(() => ["65%"], []);
    const dispatch = useDispatch()
    useEffect(() => {
        openBottomSheet();
        onClose(false)
        initial()
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

    const initial = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `${backendroutes.getcatgories}`
            })
            if(response?.data?.status){
                setCat(response?.data?.data)
            }
            Prettylog(response?.data, "RESPONSEEEEEEEEEEEEE")
        } catch (error) {
            console.log(error, "CATERRRRRR");
        }
    }
    const [selectedcat, setSelectedcat] = useState(-1)
    const [cat,setCat] = useState([])
    const selectcatfn = (element,index) => {
        setSelectedcat(index)
        bottomSheetModalRef.current.close();
        cate(element)
    }

    const {profiledata} = useSelector(profileSelector)
    useEffect(() => {
     if(profiledata && cat){
       var find = cat?.findIndex((e) => e?._id == profiledata?.professionId)
       if(find > -1){
        setSelectedcat(find)
        var result = cat[find]
        cate(result)
       }
     }
    },[profiledata,cat])
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
                    <Text style={{ fontFamily: Fonts.Bold, fontSize: RFValue(18), color: "#000", marginTop: "5%", paddingHorizontal: "2.5%", marginLeft: "2.5%" }} >Select Profession</Text>

                    <View style={{ marginHorizontal: "5%", height: "85%", paddingHorizontal: "2.5%", }} >

                        <BottomSheetScrollView
                            keyboardDismissMode="on-drag"
                            keyboardShouldPersistTaps="never"
                            showsVerticalScrollIndicator={false}
                            style={{ marginTop: "2.5%" }}
                        >
                            {cat?.map((e, i) => (
                                <Pressable onPress={() => selectcatfn(e,i)} style={{ height: deviceheight * 0.075, alignItems: "center", flexDirection: "row", width: "100%" }} >
                                    <View style={{ width: "10%", justifyContent: "center" }} >
                                        <View style={{ width: 22, height: 22, borderRadius: 100, borderWidth: 1, borderColor: colors.primary, justifyContent: "center", alignItems: "center" }} >
                                            {i == selectedcat &&
                                                <View style={{ width: 12, height: 12, backgroundColor: colors.primary, borderRadius: 100 }} />
                                            }
                                        </View>
                                    </View>

                                    <View style={{ width: "90%", justifyContent: "center", height: "100%", }} >
                                        <Text style={{ marginLeft: "2.5%", fontFamily: Fonts.Regular, color: "#000", fontSize: RFValue(15) }} >{e?.name}</Text>
                                    </View>
                                </Pressable>
                            ))}


                        </BottomSheetScrollView>
                    </View>

                </>

            </BottomSheetModal>
        </BottomSheetModalProvider>

    )
}

export default Categoryselect;