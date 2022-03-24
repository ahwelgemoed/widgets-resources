// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the code between BEGIN USER CODE and END USER CODE
// Other code you write will be lost the next time you deploy the project.

import { AsyncStorageStatic } from "@react-native-community/async-storage";

/**
 * Store a string value in the device storage, identified by a unique key. Can be accessed by the GetStorageItemObject action. Please note that users can clear the device storage.
 * @param {string} key - This field is required.
 * @param {string} value - This field is required.
 * @returns {Promise.<void>}
 */
export async function SetStorageItemString(key?: string, value?: string): Promise<void> {
    // BEGIN USER CODE

    if (!key) {
        return Promise.reject(new Error("Input parameter 'Key' is required"));
    }

    if (!value) {
        return Promise.reject(new Error("Input parameter 'Value' is required"));
    }

    return setItem(key, value);

    function setItem(key: string, value: string): Promise<void> {
        if (navigator && navigator.product === "ReactNative") {
            const AsyncStorage: AsyncStorageStatic = require("@react-native-community/async-storage").default;
            return AsyncStorage.setItem(key, value);
        }

        if (window) {
            window.localStorage.setItem(key, value);
            return Promise.resolve();
        }

        return Promise.reject(new Error("No storage API available"));
    }
    // END USER CODE
}