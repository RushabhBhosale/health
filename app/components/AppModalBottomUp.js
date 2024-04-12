import React, {forwardRef} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import AppButtonIconInner from './AppButtonIconInner';
import AppStyles from '../config/style';

const IMG_CLOSE = require('../assets/images/close_icon_trans.png');

export default forwardRef((props, forwardedRef) => {
  const {
    children,
    style_wrapper,
    style_container,
    style_dragIcon,
    closeButton = true,
    style_content = {},
    ...restProps
  } = props;
  return (
    <RBSheet
      ref={forwardedRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      height={350}
      customStyles={{
        wrapper: {...styles.bt_modal_wrapper, style_wrapper},
        container: {...styles.bt_modal_container, style_container},
        draggableIcon: {...styles.bt_modal_dragIcon, style_dragIcon},
      }}
      {...restProps}>
      {closeButton ? (
        <AppButtonIconInner
          width={27}
          borderRadius={30}
          style={styles.bt_modal_close}
          btPress={() => forwardedRef.current.close()}>
          <View style={styles.bt_modal_close_wrap}>
            <Image
              style={{
                width: '55%',
                height: '55%',
                resizeMode: 'contain',
              }}
              source={IMG_CLOSE}
            />
          </View>
        </AppButtonIconInner>
      ) : null}
      <View style={[styles.bt_modal_content, style_content]}>{children}</View>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  bt_modal_wrapper: {
    backgroundColor: '#1f66c4cc',
  },
  bt_modal_container: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: AppStyles.colors.lightgrey,
  },
  bt_modal_dragIcon: {
    width: 0,
    height: 0,
  },
  bt_modal_content: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  bt_modal_close: {
    marginLeft: 'auto',
    marginRight: 11,
    marginTop: -10,
  },
  bt_modal_close_wrap: {
    ...AppStyles.centerXY,
    backgroundColor: AppStyles.colors.linkcolor,
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});
