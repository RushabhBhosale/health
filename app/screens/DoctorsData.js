export const FILTERS = {
  consult_type: [
    {
      id: 1,
      keyword: "video",
      label: 'Video',
      icon: 'video-outline',
    },
    {
      id: 2,
      keyword: "visit_clinic",
      label: 'Visit Clinic',
      icon: 'hospital-building',
    },
  ],
  availability: [
    {
      id: 1,
      keyword: 'today',
      label: 'Today',
    },
    {
      id: 2,
      keyword: 'tomorrow',
      label: 'Tomorrow',
    },
    {
      id: 3,
      keyword: 'next-7-days',
      label: 'Next 7 Days',
    },
  ],
  gender: [
    {
      id: 1,
      label: 'Male',
      icon: 'user',
    },
    {
      id: 2,
      label: 'Female',
      icon: 'user-female',
    },
  ],
  consult_fees: [
    {
      id: 1,
      min: 50,
      max: 200,
    },
    {
      id: 2,
      min: 201,
      max: 500,
    },
    {
      id: 3,
      min: 500,
      max: 'infinity',
    },
  ],
  distance: [
    {
      id: 1,
      min: 1,
      max: 5,
    },
    {
      id: 2,
      min: 6,
      max: 10,
    },
    {
      id: 3,
      min: 11,
      max: 50,
    },
    {
      id: 4,
      min: 50,
      max: 'infinity',
    },
  ],
};

export const USER_NOTES = [
  {
    _id: 1,
    title: 'Before Appointment, keep your previous medical reports ready',
  },
  {_id: 2, title: 'Have a good internet connection'},
  {_id: 3, title: 'Switch on your notifications'},
];

export const GENDERS = ['Male', 'Female'];

export const BLOOD_GROUPS = [
  {_id: 1, name: 'A-'},
  {_id: 2, name: 'A+'},
  {_id: 3, name: 'B-'},
  {_id: 4, name: 'B+'},
  {_id: 5, name: 'AB-'},
  {_id: 6, name: 'AB+'},
  {_id: 7, name: 'O-'},
  {_id: 8, name: 'O+'},
];
