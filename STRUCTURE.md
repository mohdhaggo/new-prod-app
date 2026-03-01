# Application Structure

```text
new-prod-app/
├── LICENSE
├── README.md
├── .gitignore
├── backend/
│   ├── README.md
│   ├── .gitignore
│   ├── config/
│   │   └── config.php
│   ├── logs/
│   ├── src/
│   └── views/
├── database/
└── frontend/
    ├── login.html
    ├── login.css
    ├── login.js
    ├── assets/
    └── dashboard/
        ├── dashboard.html
        ├── dashboard.css
        ├── dashboard.js
        └── pages/
            ├── customers/
            │   ├── customers.html
            │   ├── customers.css
            │   └── customers.js
            ├── department-role/
            │   ├── department-role.html
            │   ├── department-role.css
            │   └── department-role.js
            ├── exit-permit/
            │   ├── exit-permit.html
            │   ├── exit-permit.css
            │   └── exit-permit.js
            ├── inspection/
            │   ├── inspection.html
            │   ├── inspection.css
            │   └── inspection.js
            ├── job-order/
            │   ├── job-order.html
            │   ├── job-order.css
            │   └── job-order.js
            ├── order-history/
            │   ├── order-history.html
            │   ├── order-history.css
            │   └── order-history.js
            ├── payment-invoice/
            │   ├── payment-invoice.html
            │   ├── payment-invoice.css
            │   └── payment-invoice.js
            ├── quality-check/
            │   ├── quality-check.html
            │   ├── quality-check.css
            │   └── quality-check.js
            ├── role-permission/
            │   ├── role-permission.html
            │   ├── role-permission.css
            │   └── role-permission.js
            ├── service-execution/
            │   ├── service-execution.html
            │   ├── service-execution.css
            │   └── service-execution.js
            ├── system-users/
            │   ├── system-users.html
            │   ├── system-users.css
            │   └── system-users.js
            └── vehicles/
                ├── vehicles.html
                ├── vehicles.css
                └── vehicles.js
```

> Note: internal git metadata folders (for example `backend/.git/`) are intentionally omitted from this application-focused view.
