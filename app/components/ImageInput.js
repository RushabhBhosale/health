import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import colors from "../config/colors";

import * as ImagePicker from "expo-image-picker";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ImageInput({ imageUri, onChangeImage }) {
  useEffect(() => {
    requestPermission();
  }, []);
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestCameraRollPermissionsAsync();
    if (!granted) alert("You need to enable permission to access the library");
  };

  const handlePress = () => {
    if (!imageUri) selectImage();
    else
      Alert.alert("Delete", "Are you sure you want to delete this image", [
        {
          text: "Yes",
          onPress: () => onChangeImage(imageUri),
        },
        { text: "No" },
      ]);
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        opacity: 0.5,
      });
      if (!result.cancelled) onChangeImage(result.uri);
    } catch (error) {
      console.log("Error reading image");
    }
  };
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        {!imageUri && (
          <MaterialCommunityIcons
            name="camera"
            size={40}
            color={colors.mediumgrey}
          />
        )}
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightgrey,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    height: 100,
    width: 100,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
