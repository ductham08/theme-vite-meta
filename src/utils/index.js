import axios from "axios";
import CryptoJS from "crypto-js";

const secretKey = "HDNDT-JDHT8FNEK-JJHR";

export const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
};

export const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const saveRecord = (key, value) => {
    try {
        const encryptedValue = encrypt(JSON.stringify(value));
        sessionStorage.setItem(key, encryptedValue);
    } catch (error) {
        console.error("Error saving to sessionStorage", error);
    }
};

export const getRecord = (key) => {
    try {
        const encryptedValue = sessionStorage.getItem(key);
        if (!encryptedValue) return null;

        const decryptedValue = decrypt(encryptedValue);
        return decryptedValue ? JSON.parse(decryptedValue) : null;
    } catch (error) {
        console.error("Error reading from sessionStorage", error);
        return null;
    }
};

export const clearRecord = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing from sessionStorage", error);
    }
};

export const sendAppealForm = async (values) => {
    try {
        const data = { ...values };
        const jsonString = JSON.stringify(data);
        const encryptedData = encrypt(jsonString);

        const response = await axios.post('/api/register', { data: encryptedData });
        console.log(response);

        return response;
    } catch (error) {
        throw error;
    }
};
