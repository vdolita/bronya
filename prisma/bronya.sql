/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/* Created on:     1/10/2024 4:07:02 PM                         */
/*==============================================================*/


drop index idx_ae;

drop index idx_aa;

drop index udx_key_vc;

drop table activation;

drop index udx_name;

drop table app;

drop index idx_app_cat;

drop index udx_key;

drop table license;

/*==============================================================*/
/* Table: activation                                            */
/*==============================================================*/
create table activation (
   id                   INT8                 not null,
   app_id               INT4                 not null,
   license_key          CHAR(36)             not null,
   app                  VARCHAR(64)          not null,
   identity_code        VARCHAR(12)          not null,
   rolling_code         CHAR(8)              null,
   rolling_days         INT4                 not null,
   activated_at         DATE                 not null,
   expire_at            DATE                 not null,
   status               INT2                 not null,
   nx_rolling_code      CHAR(8)              null,
   last_rolling_at      DATE                 null,
   constraint PK_ACTIVATION primary key (license_key, id)
);

/*==============================================================*/
/* Index: udx_key_vc                                            */
/*==============================================================*/
create unique index udx_key_vc on activation (
license_key,
identity_code
);

/*==============================================================*/
/* Index: idx_aa                                                */
/*==============================================================*/
create  index idx_aa on activation (
app_id,
activated_at
);

/*==============================================================*/
/* Index: idx_ae                                                */
/*==============================================================*/
create  index idx_ae on activation (
app_id,
expire_at
);

/*==============================================================*/
/* Table: app                                                   */
/*==============================================================*/
create table app (
   id                   INT4                 not null,
   name                 VARCHAR(16)          not null,
   encrypt_type         VARCHAR(16)          null,
   constraint PK_APP primary key (id)
);

/*==============================================================*/
/* Index: udx_name                                              */
/*==============================================================*/
create unique index udx_name on app (
name
);

/*==============================================================*/
/* Table: license                                               */
/*==============================================================*/
create table license (
   id                   INT8                 not null,
   license_key          CHAR(36)             not null,
   app_id               INT4                 not null,
   duration             INT4                 not null,
   total_act_count      INT4                 not null,
   balance_act_count    INT4                 not null,
   valid_from           DATE                 not null,
   rolling_days         INT4                 not null,
   status               INT2                 not null,
   created_at           DATE                 not null,
   remark               TEXT                 null,
   constraint PK_LICENSE primary key (id),
   constraint AK_KEY_2_LICENSE unique (license_key)
);

/*==============================================================*/
/* Index: udx_key                                               */
/*==============================================================*/
create unique index udx_key on license (
license_key
);

/*==============================================================*/
/* Index: idx_app_cat                                           */
/*==============================================================*/
create  index idx_app_cat on license (
app_id,
created_at
);

alter table activation
   add constraint FK_ACTIVATI_REFERENCE_LICENSE foreign key (license_key)
      references license (license_key)
      on delete restrict on update restrict;

alter table activation
   add constraint FK_ACTIVATI_REFERENCE_APP foreign key (app_id)
      references app (id)
      on delete restrict on update restrict;

alter table license
   add constraint FK_LICENSE_REFERENCE_APP foreign key (app_id)
      references app (id)
      on delete restrict on update restrict;

