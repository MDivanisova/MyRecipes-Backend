const gender={
    MALE: "male",
    FEMALE: "female"
}

const visibility={
    PUBLIC: "public",
    PRIVATE: "private"
}

const permission = {
  ADMIN: [
    "recipe:create",
    "recipe:delete:any",

    "comment:delete:any",

    "review:delete:any",

    "user:create:any",
    "user:view:any",
    "user:delete:any",
  
    "role:view",
    "role:assign",
  ],

  USERADMINISTRATOR: [
    "user:create:any",
    "user:view:any",
    "user:delete:any",

    "role:view",
    "role:assign",
  ],

  CONTENTMANAGER: [
    "recipe:delete:any",

    "comment:delete:any",

    "review:delete:any",
  ],

  CHIEF: [
    "recipe:create",
  ],

  REGULARUSER: [

  ],
};

const role={
    ADMIN: {
        roleName:"admin",
        permissions: permission.ADMIN
    },
    USERADMINISTRATOR: {
        roleName: "userAdministrator",
        permissions: permission.USERADMINISTRATOR
    },
    CONTENTMANAGER: {
        roleName: "contentManager",
        permissions: permission.CONTENTMANAGER
    },
    CHIEF: {
        roleName: "chief",
        permissions: permission.CHIEF
    },
    REGULARUSER: {
        roleName: "regularUser",
        permissions: permission.REGULARUSER
    }
}

export {
    gender,
    role,
    visibility
}