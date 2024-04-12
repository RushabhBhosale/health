package com.healthnovoindia.healthnovoplus;

import com.facebook.react.ReactActivity;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
// import io.wazo.callkeep.RNCallKeepModule;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class MainActivity extends ReactActivity {

  // @Override
  protected void onCreate(Bundle savedInstanceState) {
    // SplashScreen.show(this);
    super.onCreate(savedInstanceState);
  }

  // public void onBackPressed() {
  //   finish();
  // }
  
  // @Override
  // public void onNewIntent(Intent intent) {
  //     super.onNewIntent(intent);
  // }

  // Permission results
  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);
      // switch (requestCode) {
      //     case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
      //         RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
      //         break;
      // }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "HN Plus";
  }
}
