import {PermissionsAndroid} from 'react-native'

/**
 * @name requestCameraAndAudioPermission
 * @description Function to request permission for Audio and Camera
 */
export default async function requestCameraAndAudioPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ])
        if (
            granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
            && granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
            && granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
            && granted['android.permission.CALL_PHONE'] === PermissionsAndroid.RESULTS.GRANTED
            && granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
            && granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
            console.log('You can use the cameras, mic, location, phone, storage');
        } else {
            console.log('Permission denied');
        }
    } catch (err) {
        console.warn(err)
    }
}
