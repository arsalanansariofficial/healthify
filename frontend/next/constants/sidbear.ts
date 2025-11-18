import {
  faKey,
  faFlask,
  faPills,
  faUsers,
  faIdCard,
  faRepeat,
  faBarcode,
  faHospital,
  faIndustry,
  faTrademark,
  faUserDoctor,
  faUserShield,
  faStethoscope,
  faBuildingUser,
  faHouseMedical,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

export const SIDEBAR = new Map([
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [
      {
        icon: faCalendarCheck,
        label: 'Appointments',
        permission: 'view:appointments',
        url: '/appointments'
      }
    ]
  ],
  [
    { label: 'Memberships & Billing', permission: 'view:billing' },
    [
      {
        icon: faIdCard,
        label: 'Memberships',
        permission: 'view:memberships',
        url: '/memberships'
      },
      {
        icon: faRepeat,
        label: 'Subscriptions',
        permission: 'view:subscriptions',
        url: '/subscriptions'
      }
    ]
  ],
  [
    { label: 'Healthcare', permission: 'view:healthcare' },
    [
      {
        icon: faUserDoctor,
        label: 'Doctors',
        permission: 'view:doctors',
        url: '/doctors'
      },
      {
        icon: faHouseMedical,
        label: 'Hospitals',
        permission: 'view:hospitals',
        url: '/hospitals'
      },
      {
        icon: faBuildingUser,
        label: 'Departments',
        permission: 'view:departments',
        url: '/departments'
      },
      {
        icon: faStethoscope,
        label: 'Specialities',
        permission: 'view:specialities',
        url: '/specialities'
      },
      {
        icon: faHospital,
        label: 'Facilities',
        permission: 'view:facilities',
        url: '/facilities'
      }
    ]
  ],
  [
    { label: 'Pharmacy', permission: 'view:pharmacy' },
    [
      {
        icon: faTrademark,
        label: 'Pharma Brands',
        permission: 'view:pharma-brands',
        url: '/pharma-brands'
      },
      {
        icon: faIndustry,
        label: 'Pharma Manufacturers',
        permission: 'view:pharma-manufacturers',
        url: '/pharma-manufacturers'
      },
      {
        icon: faBarcode,
        label: 'Pharma Codes',
        permission: 'view:pharma-codes',
        url: '/pharma-codes'
      },
      {
        icon: faFlask,
        label: 'Pharma Salts',
        permission: 'view:pharma-salts',
        url: '/pharma-salts'
      },
      {
        icon: faPills,
        label: 'Medication Forms',
        permission: 'view:medication-forms',
        url: '/medication-forms'
      }
    ]
  ],
  [
    { label: 'User & Access Management', permission: 'view:access-control' },
    [
      {
        icon: faUsers,
        label: 'Users',
        permission: 'view:users',
        url: '/users'
      },
      {
        icon: faUserShield,
        label: 'Roles',
        permission: 'view:roles',
        url: '/roles'
      },
      {
        icon: faKey,
        label: 'Permissions',
        permission: 'view:permissions',
        url: '/permissions'
      }
    ]
  ]
]);
