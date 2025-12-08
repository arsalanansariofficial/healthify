### User

| Property   | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| ---------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| id         | UUID      |        | NO                          | AUTO    | YES |     |        |
| email      | VARCHAR   | 255    | NO                          |         |     |     | YES    |
| password   | TEXT      |        | NO                          |         |     |     |        |
| verifiedAt | TIMESTAMP |        | YES                         | NULL    |     |     |        |
| name       | VARCHAR   | 255    | NO                          |         |     |     |        |
| createdAt  | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt  | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### Role

| Property  | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| --------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| id        | UUID      |        | NO                          |         | YES |     |        |
| name      | VARCHAR   | 255    | NO                          |         |     |     | YES    |
| createdAt | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### UserRole

COMPOSITE KEY | _roleId_, _userId_

ACTION | `ON DELETE CASCADE` | Deleting User will delete UserRole
ACTION | `ON DELETE CASCADE` | Deleting Role will delete UserRole

| Property  | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| --------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| roleId    | UUID      |        | NO                          |         | YES | YES |        |
| userId    | UUID      |        | NO                          |         | YES | YES |        |
| createdAt | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### UserProfile

GENDER | _MALE_, _FEMALE_

ACTION | `ON DELETE CASCADE` | Deleting User will delete UserProfile

| Property    | Data Type     | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| ----------- | ------------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| userId      | UUID          |        | NO                          |         | YES | YES |        |
| imageUrl    | TEXT          |        | YES                         | NULL    |     |     |        |
| coverUrl    | TEXT          |        | YES                         | NULL    |     |     |        |
| bio         | TEXT          |        | YES                         | NULL    |     |     |        |
| gender      | ENUM (GENDER) |        | NO                          |         |     |     |        |
| phoneNumber | VARCHAR       | 15     | YES                         | NULL    |     |     | YES    |
| address     | TEXT          |        | YES                         | NULL    |     |     |        |
| createdAt   | TIMESTAMP     |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt   | TIMESTAMP     |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### Doctor

ACTION | `ON DELETE CASCADE` | Deleting User will delete Doctor

| Property        | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| --------------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| id              | UUID      |        | NO                          |         | YES | YES |        |
| licenseNumber   | VARCHAR   | 255    | NO                          |         |     |     | YES    |
| experienceYears | INT       |        | NO                          | 0       |     |     |        |
| consultationFee | INT       |        | NO                          | 0       |     |     |        |
| createdAt       | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt       | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### Specialization

| Property  | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| --------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| id        | UUID      |        | NO                          |         | YES |     |        |
| name      | VARCHAR   | 255    | NO                          |         |     |     | YES    |
| createdAt | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### DoctorSpecialization

COMPOSITE KEY | _doctorId_, _specializationId_

ACTION | `ON DELETE CASCADE` | Deleting Doctor will delete DoctorSpecialization
ACTION | `ON DELETE RESTRICT` | Deleting Specialization will restrict DoctorSpecialization

| Property         | Data Type | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| ---------------- | --------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| doctorId         | UUID      |        | NO                          |         | YES | YES |        |
| specializationId | UUID      |        | NO                          |         | YES | YES |        |
| createdAt        | TIMESTAMP |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt        | TIMESTAMP |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### DoctorSchedule

DAY | _SUNDAY_, _MONDAY_, _TUESDAY_, _WEDNESDAY_, _THURSDAY_, _FRIDAY_, _SATURDAY_

RANGE CONSTRAINT | _start_ < _end_
UNIQUE CONSTRAINT | _doctorId_, _day_, _start_, _end_

ACTION | `ON DELETE CASCADE` | Deleting Doctor will delete DoctorSchedule

| Property  | Data Type  | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE |
| --------- | ---------- | ------ | --------------------------- | ------- | --- | --- | ------ |
| id        | UUID       |        | NO                          |         | YES |     |        |
| doctorId  | UUID       |        | NO                          |         |     | YES |        |
| day       | ENUM (DAY) |        | NO                          |         |     |     |        |
| start     | TIME       |        | NO                          |         |     |     |        |
| end       | TIME       |        | NO                          |         |     |     |        |
| createdAt | TIMESTAMP  |        | CURRENT_TIMESTAMP           |         |     |     |        |
| updatedAt | TIMESTAMP  |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |

### Appointment

PRIORITY | _LOW_, _NORMAL_, _HIGH_, _URGENT_
STATUS | _PENDING_, _CONFIRMED_, _CANCELLED_, _COMPLETED_

CHECK CONSTRAINT | _rating_ BETWEEN _1_ and _5_
UNIQUE CONSTRAINT | _patientId_, _doctorId_, _date_, _start_, _end_

ACTION | `ON DELETE RESTRICT` | Deleting Patient(User) will restrict Appointment
ACTION | `ON DELETE RESTRICT` | Deleting Doctor(Doctor) will restrict Appointment

| Property     | Data Type       | Length | NULL                        | DEFAULT | PK  | FK  | UNIQUE | CHECK           |
| ------------ | --------------- | ------ | --------------------------- | ------- | --- | --- | ------ | --------------- |
| id           | UUID            |        | NO                          |         | YES |     |        |                 |
| patientId    | UUID            |        | NO                          |         |     | YES |        |                 |
| doctorId     | UUID            |        | NO                          |         |     | YES |        |                 |
| prescription | TEXT            |        | YES                         | NULL    |     |     |        |                 |
| notes        | TEXT            |        | YES                         | NULL    |     |     |        |                 |
| date         | DATE            |        | NO                          |         |     |     |        |                 |
| start        | TIME            |        | NO                          |         |     |     |        |                 |
| end          | TIME            |        | NO                          |         |     |     |        |                 |
| priority     | ENUM (PRIORITY) |        | NO                          |         |     |     |        |                 |
| rating       | INT             |        | YES                         | NULL    |     |     |        | BETWEEN 1 AND 5 |
| status       | ENUM (STATUS)   |        | NO                          | PENDING |     |     |        |                 |
| createdAt    | TIMESTAMP       |        | CURRENT_TIMESTAMP           |         |     |     |        |                 |
| updatedAt    | TIMESTAMP       |        | ON UPDATE CURRENT_TIMESTAMP |         |     |     |        |                 |
