export const SIDEBAR = new Map([
  [
    { label: 'Doctors', permission: 'view:doctors' },
    [
      { label: 'View', permission: 'view:doctors', url: '/doctors' },
      { label: 'Add', permission: 'add:doctor', url: '/doctors/add' }
    ]
  ],
  [
    { label: 'Memberships', permission: 'view:memberships' },
    [
      { label: 'View', permission: 'view:memberships', url: '/memberships' },
      { label: 'Add', permission: 'add:membership', url: '/memberships/add' }
    ]
  ],
  [
    { label: 'Subscriptions', permission: 'view:subscriptions' },
    [
      {
        label: 'View',
        permission: 'view:subscriptions',
        url: '/subscriptions'
      },
      {
        label: 'Add',
        permission: 'add:subscription',
        url: '/subscriptions/add'
      }
    ]
  ],
  [
    { label: 'Hospitals', permission: 'view:hospitals' },
    [
      { label: 'View', permission: 'view:hospitals', url: '/hospitals' },
      { label: 'Add', permission: 'add:hospital', url: '/hospitals/add' }
    ]
  ],
  [
    { label: 'Departments', permission: 'view:departments' },
    [
      { label: 'View', permission: 'view:departments', url: '/departments' },
      { label: 'Add', permission: 'add:department', url: '/departments/add' }
    ]
  ],
  [
    { label: 'Facilities', permission: 'view:facilities' },
    [
      { label: 'View', permission: 'view:facilities', url: '/facilities' },
      { label: 'Add', permission: 'add:facility', url: '/facilities/add' }
    ]
  ],
  [
    { label: 'Pharma Brands', permission: 'view:pharma-brands' },
    [
      {
        label: 'View',
        permission: 'view:pharma-brands',
        url: '/pharma-brands'
      },
      {
        label: 'Add',
        permission: 'add:pharma-brand',
        url: '/pharma-brands/add'
      }
    ]
  ],
  [
    { label: 'Pharma Codes', permission: 'view:pharma-codes' },
    [
      {
        label: 'View',
        permission: 'view:pharma-codes',
        url: '/pharma-codes'
      },
      {
        label: 'Add',
        permission: 'add:pharma-code',
        url: '/pharma-codes/add'
      }
    ]
  ],
  [
    { label: 'Pharma Salt', permission: 'view:pharma-salts' },
    [
      {
        label: 'View',
        permission: 'view:pharma-salts',
        url: '/pharma-salts'
      },
      {
        label: 'Add',
        permission: 'add:pharma-salt',
        url: '/pharma-salts/add'
      }
    ]
  ],
  [
    { label: 'Medication Forms', permission: 'view:medication-forms' },
    [
      {
        label: 'View',
        permission: 'view:medication-forms',
        url: '/medication-forms'
      },
      {
        label: 'Add',
        permission: 'add:medication-form',
        url: '/medication-forms/add'
      }
    ]
  ],
  [
    { label: 'Pharma Manufacturers', permission: 'view:pharma-manufacturers' },
    [
      {
        label: 'View',
        permission: 'view:pharma-manufacturers',
        url: '/pharma-manufacturers'
      },
      {
        label: 'Add',
        permission: 'add:pharma-manufacturer',
        url: '/pharma-manufacturers/add'
      }
    ]
  ],
  [
    { label: 'Appointments', permission: 'view:appointments' },
    [{ label: 'View', permission: 'view:appointments', url: '/appointments' }]
  ],
  [
    { label: 'Specialities', permission: 'view:specialities' },
    [
      { label: 'View', permission: 'view:specialities', url: '/specialities' },
      { label: 'Add', permission: 'add:speciality', url: '/specialities/add' }
    ]
  ],
  [
    { label: 'Users', permission: 'view:users' },
    [{ label: 'View', permission: 'view:users', url: '/users' }]
  ],
  [
    { label: 'Roles', permission: 'view:roles' },
    [
      { label: 'Add', permission: 'add:role', url: '/roles/add' },
      { label: 'Assign', permission: 'assign:roles', url: '/roles/assign' }
    ]
  ],
  [
    { label: 'Permissions', permission: 'view:permissions' },
    [
      { label: 'Add', permission: 'add:permission', url: '/permissions/add' },
      {
        label: 'Assign',
        permission: 'assign:permissions',
        url: '/permissions/assign'
      }
    ]
  ]
]);
