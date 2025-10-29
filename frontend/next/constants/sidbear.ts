export const SIDEBAR = new Map([
  [
    { label: 'Healthcare Management', permission: 'view:healthcare' },
    [
      { label: 'Doctors', permission: 'view:doctors', url: '/doctors' },
      { label: 'Hospitals', permission: 'view:hospitals', url: '/hospitals' },
      {
        label: 'Departments',
        permission: 'view:departments',
        url: '/departments'
      },
      {
        label: 'Specialities',
        permission: 'view:specialities',
        url: '/specialities'
      },
      { label: 'Facilities', permission: 'view:facilities', url: '/facilities' }
    ]
  ],
  [
    { label: 'Pharmacy & Medication', permission: 'view:pharmacy' },
    [
      {
        label: 'Pharma Brands',
        permission: 'view:pharma-brands',
        url: '/pharma-brands'
      },
      {
        label: 'Pharma Manufacturers',
        permission: 'view:pharma-manufacturers',
        url: '/pharma-manufacturers'
      },
      {
        label: 'Pharma Codes',
        permission: 'view:pharma-codes',
        url: '/pharma-codes'
      },
      {
        label: 'Pharma Salts',
        permission: 'view:pharma-salts',
        url: '/pharma-salts'
      },
      {
        label: 'Medication Forms',
        permission: 'view:medication-forms',
        url: '/medication-forms'
      }
    ]
  ],
  [
    { label: 'Memberships & Billing', permission: 'view:billing' },
    [
      {
        label: 'Memberships',
        permission: 'view:memberships',
        url: '/memberships'
      },
      {
        label: 'Subscriptions',
        permission: 'view:subscriptions',
        url: '/subscriptions'
      }
    ]
  ],
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [
      {
        label: 'Appointments',
        permission: 'view:appointments',
        url: '/appointments'
      }
    ]
  ],
  [
    { label: 'User & Access Management', permission: 'view:access-control' },
    [
      { label: 'Users', permission: 'view:users', url: '/users' },
      { label: 'Roles', permission: 'view:roles', url: '/roles/add' },
      {
        label: 'Permissions',
        permission: 'view:permissions',
        url: '/permissions/add'
      }
    ]
  ]
]);
