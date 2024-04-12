import React, {useEffect} from 'react';
import {useFormikContext} from 'formik';
import AppButtonPrimary from './AppButtonPrimary';

export default function AppFormButton({
  ButtonElement,
  setFormValid,
  ...otherProps
}) {
  const {
    isValid,
    isSubmitting,
    handleSubmit,
    setSubmitting,
  } = useFormikContext();

  useEffect(() => {
    if (setFormValid) setFormValid(isValid);
  }, [isValid, setFormValid]);

  let btPress = () => {
    console.log('Form isValid ', isValid);
    console.log('Form submitting...', isSubmitting);
    setSubmitting(true);
    if (!isValid) return;
    handleSubmit();
    setSubmitting(false);
    console.log('submitted!');
  };

  return ButtonElement ? (
    <ButtonElement btPress={btPress} />
  ) : (
    <AppButtonPrimary btPress={btPress} {...otherProps} />
  );
}
