import {Formik} from 'formik';
import React from 'react';

export default function AppForm({
  initialValues,
  onSubmit,
  validationSchema,
  children,
}) {
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {() => <>{children}</>}
    </Formik>
  );
}
