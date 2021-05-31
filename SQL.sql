create database PRTest;
use PRTest;

create table AUTHOR(
    AUID int PRIMARY KEY AUTO_INCREMENT,
    -- Author varchar(20),
    Author text,
    -- Organize varchar(30),
    Organize text,
    unique (Author,Organize)
);

create table ARTICAL(
    ArticalID int PRIMARY KEY AUTO_INCREMENT,
    -- Title varchar(50) not null,
    Title text not null,
    -- Source varchar(50) null,
    Source text null,
    Summary text null,
    link text not null unique
);

create table AUTHORMAP(
    ArticalID int not null,
    AUID int null,
    FOREIGN KEY(ArticalID) REFERENCES ARTICAL(ArticalID) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY(AUID) REFERENCES AUTHOR(AUID) ON DELETE CASCADE ON UPDATE RESTRICT,
    unique(ArticalID,AUID)
);

create table KEYWORDS(
    ArticalID int,
    -- Keyword varchar(10),
    Keyword text,
    FOREIGN key(ArticalID) REFERENCES ARTICAL(ArticalID) ON DELETE CASCADE ON UPDATE RESTRICT
    -- unique(ArticalID,Keyword)
);

create table REFERENCE(
    ArticalID int,
    -- RefTitle varchar(50),
    RefTitle text,
    RefLink text null,
    RefID int null,
    FOREIGN key(ArticalID) REFERENCES ARTICAL(ArticalID) ON DELETE CASCADE ON UPDATE RESTRICT
);

create table USER(
    UID int AUTO_INCREMENT,
    Username text not null unique,
    passwdRSA text not null,
    PRIMARY KEY (UID)
);

create table USERDB(
    UID int,
    ArticalID int,
    FOREIGN KEY (UID) REFERENCES USER(UID) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (ArticalID) REFERENCES ARTICAL(ArticalID) ON DELETE CASCADE ON UPDATE RESTRICT,
    unique (UID,ArticalID)
);