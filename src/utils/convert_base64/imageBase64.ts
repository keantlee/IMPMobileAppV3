import RNFS from 'react-native-fs';

export const converImageToBase64 = async (fileObj: any) => {
    console.log('test');
    if (!fileObj?.uri) return null;

    try {
        const cleanPath = fileObj.uri.replace('file://', '');
        const base64    = await RNFS.readFile(cleanPath, 'base64');

        return {
            fileName:   fileObj.fileName,
            type:       fileObj.type,
            uri:        `data:${fileObj.type};base64,${base64}`,
        };
    } catch (error) {
        console.error(`[IMAGE BASE64] Error reading file ${fileObj.fileName}: `, error);
        throw error;
    }
};