import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
  Modal,
  Button,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import defaultStyles from "../config/style";
import AppText from "./AppText";
import Screen from "./Screen";
import PickerItem from "./PickerItem";

export default function AppPicker({
  icon,
  items,
  placeholder,
  selectedItem,
  onSelectItem,
  numOfColumns,
  width = "100%",
  PicketItemComponent = PickerItem,
}) {
  const [modalVisible, setmodalVisible] = useState(false);
  return (
    <React.Fragment>
      <TouchableWithoutFeedback onPress={() => setmodalVisible(true)}>
        <View style={[styles.container, { width }]}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={defaultStyles.colors.mediumgrey}
              style={styles.icon}
            />
          )}

          {selectedItem ? (
            <AppText style={styles.text}>{selectedItem.label}</AppText>
          ) : (
            <AppText style={styles.placeholder}>{placeholder}</AppText>
          )}

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={defaultStyles.colors.mediumgrey}
          />
        </View>
      </TouchableWithoutFeedback>
      <Modal visible={modalVisible} animationType="slide">
        <Screen>
          <Button title="Close" onPress={() => setmodalVisible(false)} />
          <FlatList
            data={items}
            keyExtractor={(item) => item.value.toString()}
            numColumns={numOfColumns}
            renderItem={({ item }) => (
              <PicketItemComponent
                item={item}
                label={item.label}
                onPress={() => {
                  setmodalVisible(false);
                  onSelectItem(item);
                }}
              />
            )}
          />
        </Screen>
      </Modal>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.lightgrey,
    borderRadius: 25,
    flexDirection: "row",
    padding: 15,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
  },
  placeholder: {
    color: defaultStyles.colors.mediumgrey,
    flex: 1,
  },
});
