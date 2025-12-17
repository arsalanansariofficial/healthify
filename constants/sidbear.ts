export const SIDEBAR = new Map([
  [
    { label: 'Doctors', permission: 'view:doctors' },
    [
      { label: 'View', url: '/doctors', permission: 'view:doctors' },
      { label: 'Add', url: '/doctors/add', permission: 'add:doctor' }
    ]
  ],
  [
    { label: 'Memberships', permission: 'view:memberships' },
    [
      { label: 'View', url: '/memberships', permission: 'view:memberships' },
      { label: 'Add', url: '/memberships/add', permission: 'add:membership' }
    ]
  ],
  [
    { label: 'Subscriptions', permission: 'view:subscriptions' },
    [
      {
        label: 'View',
        url: '/subscriptions',
        permission: 'view:subscriptions'
      },
      {
        label: 'Add',
        url: '/subscriptions/add',
        permission: 'add:subscription'
      }
    ]
  ],
  [
    { label: 'Hospitals', permission: 'view:hospitals' },
    [
      { label: 'View', url: '/hospitals', permission: 'view:hospitals' },
      { label: 'Add', url: '/hospitals/add', permission: 'add:hospital' }
    ]
  ],
  [
    { label: 'Departments', permission: 'view:departments' },
    [
      { label: 'View', url: '/departments', permission: 'view:departments' },
      { label: 'Add', url: '/departments/add', permission: 'add:department' }
    ]
  ],
  [
    { label: 'Facilities', permission: 'view:facilities' },
    [
      { label: 'View', url: '/facilities', permission: 'view:facilities' },
      { label: 'Add', url: '/facilities/add', permission: 'add:facility' }
    ]
  ],
  [
    { label: 'Pharma Brands', permission: 'view:pharma-brands' },
    [
      {
        label: 'View',
        url: '/pharma-brands',
        permission: 'view:pharma-brands'
      },
      {
        label: 'Add',
        url: '/pharma-brands/add',
        permission: 'add:pharma-brand'
      }
    ]
  ],
  [
    { label: 'Pharma Codes', permission: 'view:pharma-codes' },
    [
      {
        label: 'View',
        url: '/pharma-codes',
        permission: 'view:pharma-codes'
      },
      {
        label: 'Add',
        url: '/pharma-codes/add',
        permission: 'add:pharma-code'
      }
    ]
  ],
  [
    { label: 'Pharma Salt', permission: 'view:pharma-salts' },
    [
      {
        label: 'View',
        url: '/pharma-salts',
        permission: 'view:pharma-salts'
      },
      {
        label: 'Add',
        url: '/pharma-salts/add',
        permission: 'add:pharma-salt'
      }
    ]
  ],
  [
    { label: 'Medication Forms', permission: 'view:medication-forms' },
    [
      {
        label: 'View',
        url: '/medication-forms',
        permission: 'view:medication-forms'
      },
      {
        label: 'Add',
        url: '/medication-forms/add',
        permission: 'add:medication-form'
      }
    ]
  ],
  [
    { label: 'Pharma Manufacturers', permission: 'view:pharma-manufacturers' },
    [
      {
        label: 'View',
        url: '/pharma-manufacturers',
        permission: 'view:pharma-manufacturers'
      },
      {
        label: 'Add',
        url: '/pharma-manufacturers/add',
        permission: 'add:pharma-manufacturer'
      }
    ]
  ],
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [{ label: 'View', url: '/appointments', permission: 'view:appointments' }]
  ],
  [
    { label: 'Specialities', permission: 'view:specialities' },
    [
      { label: 'View', url: '/specialities', permission: 'view:specialities' },
      { label: 'Add', url: '/specialities/add', permission: 'add:speciality' }
    ]
  ],
  [
    { label: 'Users', permission: 'view:users' },
    [{ url: '/users', label: 'View', permission: 'view:users' }]
  ],
  [
    { label: 'Roles', permission: 'view:roles' },
    [
      { label: 'Add', url: '/roles/add', permission: 'add:role' },
      { label: 'Assign', url: '/roles/assign', permission: 'assign:roles' }
    ]
  ],
  [
    { permission: 'view:permissions', label: 'Permissions' },
    [
      { label: 'Add', url: '/permissions/add', permission: 'add:permission' },
      {
        label: 'Assign',
        url: '/permissions/assign',
        permission: 'assign:permissions'
      }
    ]
  ]
]);
