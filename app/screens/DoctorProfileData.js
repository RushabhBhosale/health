var DOCTOR_PROFILE = {
  tab_consultation: {
    types: [
      {
        available: true,
        id: 1,
        label: 'Video',
        fees: 500,
        icon: 'video-outline',
      },
      {
        available: true,
        id: 2,
        label: 'Visit Clinic',
        fees: 800,
        icon: 'hospital-building',
      },
    ],
    happening: [
      {
        available: true,
        id: 1,
        label: 'First Time',
      },
      {
        available: true,
        id: 2,
        label: 'As Follow-up',
      },
    ],
  },
  tab_info: {
    languages: {
      icon_image: require('../assets/images/info_langauge.png'),
      title: 'Languages Known',
    },
    education: {
      icon_image: require('../assets/images/info_education.png'),
      title: 'Educational qualifications',
    },
    clinic_details: {
      icon_image: require('../assets/images/info_clinic_details.png'),
      title: 'Clinic Details',
    },
    services: {
      icon_image: require('../assets/images/info_services.png'),
      title: 'Services',
    },
    location: {
      icon_image: require('../assets/images/info_location.png'),
      title: 'Location',
    },
    facilities: {
      icon_image: require('../assets/images/info_facilities.png'),
      title: 'Facilities',
    },
    gallery: {
      icon_image: require('../assets/images/info_services.png'),
      title: 'Gallery',
    },
    awards: {
      icon_image: require('../assets/images/info_awards.png'),
      title: 'Awards',
    },
    registration: {
      icon_image: require('../assets/images/info_registration.png'),
      title: 'Registration',
    },
  },
};
export default DOCTOR_PROFILE;

export const PARENT_SLOT_TYPES = ['online', 'offline'];
export const PARENT_SLOT = {online: 0, offline: 1};

export const SLOT_TYPES = ['online', 'offline'];
export const SLOT = {online: 0, offline: 1};
