import { MMKV } from "react-native-mmkv"


export const storage = new MMKV(
    {
        id: `Lawapp2024`,
        encryptionKey: 'Lawapp007'
    }
)



export const SetItem = (key, value) => {
    try {
        var result = GetLocal()
        console.log(result, "hehehe");
        if (result) {
            result[key] = value
            storage.set("Lawapp", JSON.stringify(result))
        }
        else {
            var result = {}
            result[key] = value
            storage.set("Lawapp", JSON.stringify(result))
        }

    } catch (error) {
        console.log("LOGERORRRRRRRRRRRRRRR", error);
    }
}

export const GetLocal = () => {
    try {
        var result = storage.getString("Lawapp")
        console.log("Data from getlocal")
        return JSON.parse(result)

    } catch (error) {
        console.log("geterrorrrrrrrrrrrrrrr", error);
    }
}


export const GetItem = (key) => {
    try {
        var result = storage.getString("Lawapp")
        var final = JSON.parse(result)
        console.log("Data from getItem")
        return final[key]
    } catch (error) {
        console.log("geterrorrrrrrrrrrrrrrr", error);
    }
}

export const RemoveItem = (key) => {
    try {
        var result = storage.getString("Lawapp")
        var final = JSON.parse(result)
        delete final[key]
        storage.set("Lawapp", JSON.stringify(final))


    } catch (error) {
        console.log("geterrorrrrrrrrrrrrrrr", error);
    }
} 