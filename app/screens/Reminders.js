import React, {useContext, useState, useEffect} from 'react';
import PushNotification from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// https://dev-yakuza.posstree.com/en/react-native/react-native-push-notification/
// https://docs.wonderpush.com/docs/mobile-push-notifications-react-native
// https://www.npmjs.com/package/react-native-push-notification

export const IsAndroid = Platform.OS === 'android' ? true : false;

class ReminderAlerts {
    constructor() {
        if(IsAndroid) {
            PushNotification.configure({
                onRegister: function(token) {
                    console.log("REMINDER ALERT TOKEN: ", token);
                },
                onNotification: function(notification) {
                    console.log("REMINDER ALERT NOTIFICATION", notification);
                },
                popInitialNotification: true,
                requestPermissions: true,
            });

            PushNotification.createChannel({
                channelId: 'reminders',
                channelName: 'Medicine Reminders',
                channelDescription: 'Reminder for Prescribed medicine reminders'
            },() => {});

            PushNotification.getScheduledLocalNotifications(rn => {
                console.log("LOCAL NOTIFICATION ADR:", rn);
            });
        } else {

            // const type = 'notification';
            // PushNotificationIOS.addEventListener(type, onRemoteNotification);
            // // return () => {
            // //     PushNotificationIOS.removeEventListener(type);
            // // };

            // const onRemoteNotification = (notification) => {
            //     const isClicked = notification.getData().userInteraction === 1;
            
            //     if (isClicked) {
            //       // Navigate user to another screen
            //     } else {
            //       // Do something else with push notification
            //     }
            //     // Use the appropriate result based on what you needed to do for this notification
            //     const result = PushNotificationIOS.FetchResult.NoData;
            //     notification.finish(result);
            // };
            // // PushNotificationIOS.configure({
            // //     onRegister: function(token) {
            // //         console.log("REMINDER ALERT TOKEN: ", token);
            // //     },
            // //     onNotification: function(notification) {
            // //         console.log("REMINDER ALERT NOTIFICATION", notification);
            // //     },
            // //     popInitialNotification: true,
            // //     requestPermissions: true,
            // // });

            // // PushNotificationIOS.createChannel({
            // //     channelId: 'reminders',
            // //     channelName: 'Medicine Reminders',
            // //     channelDescription: 'Reminder for Prescribed medicine reminders'
            // // },() => {});

            // PushNotificationIOS.getPendingNotificationRequests(rn => {
            //     console.log("LOCAL NOTIFICATION IOS:", rn);
            // });
        }
    }

    testNotification() {
        if(IsAndroid) {
            PushNotification.cancelAllLocalNotifications();
            
            var testDate = new Date();
            testDate.setHours(15,2,0);

            // PushNotification.localNotification({
            //     channelId:'reminders', //his must be same with channelid in createchannel
            //     title:'hello',
            //     message:'test message'
            //   })
            PushNotification.localNotificationSchedule({
                channelId: 'reminders',
                title: 'Test Medicine Reminder B',
                foreground: true,
                priority: 'high',
                visibility: 'public',
                importance: 'high',
                message: 'Please take your medicines without forget',
                allowWhileIdle:true,
                date: new Date(Date.now() + 15000),
                repeatTime: 1,
                repeatType: "day",
            });
            PushNotification.getScheduledLocalNotifications(rn => {
                console.log("SCHEDULED NOTIFICATIONS!!", rn);
            });
        } else {
            PushNotificationIOS.addNotificationRequest({
                title: "Test Medicine Reminder",
                subtitle: "Test Notification",
                body: "Please take your medicines without forget",
                fireDate: new Date(Date.now() + 10000),
                repeats: false,
                repeatsComponent:{ day: true },
                isCritical: true,
                isTimeZoneAgnostic: true,
            });
        }
    }

    async scheduleAlert(prescr, alertId, doStart = true, timings) {
        // console.log(prescr.prescriptionDate);
        // var prescrDate = new Date(prescr.prescriptionDate.toString().replace("T", " "));
        console.log('TIMINGS RECEIVED', timings);
        var currentDt = new Date();
        //console.log(prescr?.medications);
        if(prescr?.medications?.length > 0) {
            var afterBreakfast = new Date();
            var afterLunch = new Date();
            var afterDinner = new Date();
            var beforeBreakfast = new Date();
            var beforeLunch = new Date();
            var beforeDinner = new Date();
            
            afterBreakfast.setHours(Number(timings.afterBreakfast.slot.split(":")[0]),Number(timings.afterBreakfast.slot.split(":")[1]),0);
            if(currentDt > afterBreakfast) { afterBreakfast.setDate(currentDt.getDate() + 1); }
            
            afterLunch.setHours(Number(timings.afterLunch.slot.split(":")[0]),Number(timings.afterLunch.slot.split(":")[1]),0);
            if(currentDt > afterLunch) { afterLunch.setDate(currentDt.getDate() + 1); }
            
            afterDinner.setHours(Number(timings.afterDinner.slot.split(":")[0]),Number(timings.afterDinner.slot.split(":")[1]),0);
            if(currentDt > afterDinner) { afterDinner.setDate(currentDt.getDate() + 1); }
            
            beforeBreakfast.setHours(Number(timings.beforeBreakfast.slot.split(":")[0]),Number(timings.beforeBreakfast.slot.split(":")[1]),0);
            if(currentDt > beforeBreakfast) { beforeBreakfast.setDate(currentDt.getDate() + 1); }
            
            beforeLunch.setHours(Number(timings.beforeLunch.slot.split(":")[0]),Number(timings.beforeLunch.slot.split(":")[1]),0);
            if(currentDt > beforeLunch) { beforeLunch.setDate(currentDt.getDate() + 1); }
            
            beforeDinner.setHours(Number(timings.beforeDinner.slot.split(":")[0]),Number(timings.beforeDinner.slot.split(":")[1]),0);
            if(currentDt > beforeDinner) { beforeDinner.setDate(currentDt.getDate() + 1); }

            // console.log("BREAKFAST", beforeBreakfast, afterBreakfast);
            // console.log("LUNCH", beforeLunch, afterLunch);
            // console.log("DINNER", beforeDinner, afterDinner);

            if(doStart) { // SCHEDULE NOTIFICATIONS
                prescr?.medications?.forEach(async (medi, indx) => {
                    // Breakfast time : 9.30am
                    if(medi.intervalSession.session_1 !== "") {
                        var isBefore = String(medi.intervalSession.session_1).includes("Before");
                        if(IsAndroid) {
                            await PushNotification.localNotificationSchedule({
                                //id: prescr._id+"_"+medi._id+"_1",
                                id: alertId+(indx).toString()+"1",
                                channelId: 'reminders',
                                title: 'Medicine Reminder',
                                foreground: true,
                                priority: 'high',
                                visibility: 'public',
                                importance: 'high',
                                message: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_1,
                                allowWhileIdle:true,
                                date: isBefore ? beforeBreakfast : afterBreakfast,
                                repeatTime: medi.period_value,
                                repeatType: (medi.period == "Weeks" ? "week" : medi.period == "Months" ? "month" : "day")
                            });
                        } else {
                            PushNotificationIOS.addNotificationRequest({
                                //id: prescr._id+"_"+medi._id+"_1",
                                id: alertId+(indx).toString()+"1",
                                title: 'Medicine Reminder',
                                subtitle: medi.intervalSession.session_1,
                                body: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_1,
                                fireDate: isBefore ? beforeBreakfast : afterBreakfast,
                                repeats: true,
                                repeatsComponent:{
                                    day: (medi.period == "Daily" || medi.period == "Day" ? true : false),
                                    month: (medi.period == "Months" || medi.period == "Month" ? true : false),
                                    dayOfWeek: (medi.period == "Weeks" || medi.period == "Week" ? true : false),
                                },
                                isCritical: true,
                                isTimeZoneAgnostic: true,
                            });
                        }
                    }
                    // lunch : 2.30pm
                    if(medi.intervalSession.session_2 !== "") {
                        var isBefore = String(medi.intervalSession.session_2).includes("Before");
                        if(IsAndroid) {
                            await PushNotification.localNotificationSchedule({
                                //id: prescr._id+"_"+medi._id+"_2",
                                id: alertId+(indx).toString()+"2",
                                channelId: 'reminders',
                                title: 'Medicine Reminder',
                                foreground: true,
                                priority: 'high',
                                visibility: 'public',
                                importance: 'high',
                                message: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_2,
                                allowWhileIdle:true,
                                date: isBefore ? beforeLunch : afterLunch,
                                repeatTime: medi.period_value,
                                repeatType: (medi.period == "Weeks" ? "week" : medi.period == "Months" ? "month" : "day")
                            });
                        } else {
                            PushNotificationIOS.addNotificationRequest({
                                //id: prescr._id+"_"+medi._id+"_2",
                                id: alertId+(indx).toString()+"2",
                                title: 'Medicine Reminder',
                                subtitle: medi.intervalSession.session_2,
                                body: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_2,
                                fireDate: isBefore ? beforeLunch : afterLunch,
                                repeats: true,
                                repeatsComponent:{
                                    day: (medi.period == "Daily" || medi.period == "Day" ? true : false),
                                    month: (medi.period == "Months" || medi.period == "Month" ? true : false),
                                    dayOfWeek: (medi.period == "Weeks" || medi.period == "Week" ? true : false),
                                },
                                isCritical: true,
                                isTimeZoneAgnostic: true,
                            });
                        }
                    }
                    // dinner : 9pm
                    if(medi.intervalSession.session_3 !== "") {
                        var isBefore = String(medi.intervalSession.session_3).includes("Before");
                        if(IsAndroid) {
                            await PushNotification.localNotificationSchedule({
                                //id: prescr._id+"_"+medi._id+"_3",
                                id: alertId+(indx).toString()+"3",
                                channelId: 'reminders',
                                title: 'Medicine Reminder',
                                foreground: true,
                                priority: 'high',
                                visibility: 'public',
                                importance: 'high',
                                message: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_3,
                                allowWhileIdle:true,
                                date: isBefore ? beforeDinner : afterDinner,
                                repeatTime: medi.period_value,
                                repeatType: (medi.period == "Weeks" ? "week" : medi.period == "Months" ? "month" : "day")
                            });
                        } else {
                            PushNotificationIOS.addNotificationRequest({
                                //id: prescr._id+"_"+medi._id+"_3",
                                id: alertId+(indx).toString()+"3",
                                title: 'Medicine Reminder',
                                subtitle: medi.intervalSession.session_3,
                                body: 'Please take '+medi.medicineName+' '+medi.intervalSession.session_3,
                                fireDate: isBefore ? beforeDinner : afterDinner,
                                repeats: true,
                                repeatsComponent:{
                                    day: (medi.period == "Daily" || medi.period == "Day" ? true : false),
                                    month: (medi.period == "Months" || medi.period == "Month" ? true : false),
                                    dayOfWeek: (medi.period == "Weeks" || medi.period == "Week" ? true : false),
                                },
                                isCritical: true,
                                isTimeZoneAgnostic: true,
                            });
                        }
                    }
                });
                console.log("ALERTS SET SUCCESSFULLY!");
                // PushNotification.getScheduledLocalNotifications(rn => {
                //     console.log("CURRENT LOCAL NOTIFICATION SCHEDULED!!", rn);
                // });
            } else { // CANCEL NOTIFICATIONS
                prescr?.medications?.forEach(async (medi, indx) => {
                    if(IsAndroid) {
                        //PushNotification.cancelAllLocalNotifications();
                        if(medi.intervalSession.session_1 !== "") {
                            await PushNotification.cancelLocalNotification(alertId+(indx).toString()+"1");
                        }
                        if(medi.intervalSession.session_2 !== "") {
                            await PushNotification.cancelLocalNotification(alertId+(indx).toString()+"2");
                        }
                        if(medi.intervalSession.session_3 !== "") {
                            await PushNotification.cancelLocalNotification(alertId+(indx).toString()+"3");
                        }
                    } else {
                        if(medi.intervalSession.session_1 !== "") {
                            PushNotificationIOS.removeAllPendingNotificationRequests(alertId+(indx).toString()+"1");
                        }
                        if(medi.intervalSession.session_2 !== "") {
                            PushNotificationIOS.removeAllPendingNotificationRequests(alertId+(indx).toString()+"2");
                        }
                        if(medi.intervalSession.session_3 !== "") {
                            PushNotificationIOS.removeAllPendingNotificationRequests(alertId+(indx).toString()+"3");
                        }
                    }
                });
                console.log("ALERTS REMOVED!");
                // PushNotification.getScheduledLocalNotifications(rn => {
                //     console.log("CURRENT LOCAL NOTIFICATION SCHEDULED!!", rn);
                // });
            }
        }
    }

    setReminders() {
        console.log("ALERT FUNCTION CALLED! CLEARED ALL");
        // PushNotification.cancelAllLocalNotifications();
        // PushNotification.localNotificationSchedule({
        //     channelId: 'reminders',
        //     title: 'Reminder',
        //     message: 'Please take your medicine 2',
        //     allowWhileIdle:false,
        //     date: new Date(Date.now() + 5000),
        //     repeatTime: 1,
        //     repeatType: "day"
        // });
    }
}

export default new ReminderAlerts();