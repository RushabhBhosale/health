import {Alert} from 'react-native';

export default simpleAlert = ({
  title,
  content,
  okText = 'OK',
  okCallback,
  showCancel = false,
  cancelText = 'Cancel',
  cancelCallback,
  cancelable = false,
}) => {
  okCallback =
    okCallback ||
    function () {
      console.log('OK Pressed...');
    };
  cancelCallback =
    cancelCallback ||
    function () {
      console.log('Cancel Pressed...');
    };

  let alert_actions = showCancel
    ? [
        {text: cancelText, onPress: cancelCallback, style: 'cancel'},
        {text: okText, onPress: okCallback},
      ]
    : [{text: okText, onPress: okCallback}];

  Alert.alert(title, content, alert_actions, {
    cancelable,
  });
};

export const ToComePopup = () => {
  simpleAlert({
    title: 'Coming Soon',
    content: 'This feature or functionality is not available yet.',
  });
};
