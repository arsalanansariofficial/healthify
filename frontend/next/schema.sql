drop database if exists healthify;
create database if not exists healthify;
use healthify;
create table if not exists `user` (
  id varchar(16) not null,
  email varchar(255) not null,
  password text not null,
  verifiedAt timestamp null,
  name varchar(255) not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_user primary key (id),
  constraint user_unique_email unique (email)
);
create table if not exists `role` (
  id varchar(16) not null,
  name varchar(255) not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_role primary key (id),
  constraint role_unique_name unique (name)
);
create table if not exists `userRole` (
  userId varchar(16) not null,
  roleId varchar(16) not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_user_role primary key (roleId, userId),
  constraint fk_user_role_user foreign key (userId) references `user`(id) on delete cascade,
  constraint fk_user_role_role foreign key (roleId) references `role`(id) on delete cascade
);
create table if not exists `userProfile` (
  userId varchar(16) not null,
  imageUrl text null,
  coverUrl text null,
  bio text null,
  gender enum('male', 'female') not null,
  phoneNumber varchar(16) null,
  address text null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_user_profile primary key (userId),
  constraint fk_user_profile_user_id foreign key (userId) references `user`(id) on delete cascade,
  constraint user_profile_unique_phone_number unique(phoneNumber)
);
create table if not exists `doctor` (
  id varchar(16) not null,
  licenseNumber varchar(255) not null,
  experienceYears int not null default 0,
  consultationFee int not null default 0,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_doctor primary key (id),
  constraint fk_doctor_id foreign key (id) references `user`(id) on delete cascade,
  constraint doctor_unique_license_number unique (licenseNumber)
);
create table if not exists `specialization` (
  id varchar(16) not null,
  name varchar(255) not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_specialization primary key (id),
  constraint specialization_unique_name unique (name)
);
create table if not exists `doctorSpecialization` (
  doctorId varchar(16) not null,
  specializationId varchar(16) not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_doctor_specialization primary key (doctorId, specializationId),
  constraint fk_doctor_specialization_doctor foreign key (doctorId) references `doctor`(id) on delete cascade,
  constraint fk_doctor_specialization_specialization foreign key (specializationId) references `specialization`(id) on delete restrict
);
create table if not exists `doctorSchedule` (
  id varchar(16) not null,
  doctorId varchar(16) not null,
  day enum(
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ) not null,
  `start` time not null,
  `end` time not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_doctor_schedule primary key (id),
  constraint fk_doctor_schedule_doctor_id foreign key (doctorId) references `doctor`(id) on delete cascade
);
create table if not exists `appointment` (
  id varchar(16) not null,
  patientId varchar(16) not null,
  doctorId varchar(16) not null,
  prescription text null,
  notes text null,
  `date` date not null,
  `start` time not null,
  `end` time not null,
  priority enum('LOW', 'NORMAL', 'HIGH', 'URGENT') not null,
  rating tinyint null,
  status enum('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') not null,
  createdAt timestamp not null default current_timestamp,
  updatedAt timestamp not null default current_timestamp on update current_timestamp,
  constraint pk_appointment primary key (id),
  constraint fk_appointment_patient_id foreign key (patientId) references `user`(id) on delete restrict,
  constraint fk_appointment_doctor_id foreign key (doctorId) references `doctor`(id) on delete restrict,
  constraint appointment_valid_rating check (
    rating between 1 and 5
  ),
  constraint appointment_valid_time check (`start` < `end`),
  constraint appointment_unique_appointment unique (patientId, doctorId, `date`, `start`, `end`)
);