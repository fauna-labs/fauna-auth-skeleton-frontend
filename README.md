## A Fauna authentication skeleton from the frontend.

This repository is a basic Fauna skeleton that implements authentication authentication from the front-end with React. This implementation is keeping access tokens with a lifetime of one hour in browser memory. It is combines functionality from the following [blueprints](https://github.com/fauna-labs/fauna-blueprints): 

- [register-login-logout](https://github.com/fauna-labs/fauna-blueprints/tree/main/official/auth/register-login-logout): basic register, login and logout functionality
- [validation](https://github.com/fauna-labs/fauna-blueprints/tree/main/official/validation): email and password validation
- [rate-limiting](https://github.com/fauna-labs/fauna-blueprints/tree/main/official/rate-limiting): rate-limiting and limiting of the amount of calls a user can do for a specific action plus reset functionality to remove previous logs for that action.
- [password-reset](https://github.com/fauna-labs/fauna-blueprints/tree/main/official/auth/password-reset): the change password function is used to change the password by providing the old password.

### Setup

To use the skeleton, clone it:

```
git@github.com:fauna-labs/faunadb-auth-skeleton-frontend.git
```

Run npm install:

```
npm install
```

Create a database and a Fauna admin key via the shell or Fauna [dashboard](https://dashboard.fauna.com/). Either expose the key as an environment variable (FAUNA_ADMIN_KEY) or keep it somewhere safe to paste in the following steps.

Provision the Fauna resources with the [Fauna Schema Migrate](https://github.com/fauna-labs/fauna-schema-migrate) tool. 

```
npx fauna-schema-migrate apply all
```

Run the frontend: 

```
npm run start
```

### Populate some example data

Run the following query in the Fauna dashboard shell of your database. 

```
Do(
  Create(Collection('dinos'), {
    data: {
      name: 'Skinny Dino',
      icon: 'skinny_dino.png',
      rarity: 'exotic'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Metal Dino',
      icon: 'metal_dino.png',
      rarity: 'common'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Flower Dino',
      icon: 'flower_dino.png',
      rarity: 'rare'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Grumpy Dino',
      icon: 'grumpy_dino.png',
      rarity: 'legendary'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Old Gentleman Dino',
      icon: 'old_gentleman_dino.png',
      rarity: 'legendary'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Old Lady Dino',
      icon: 'old_lady_dino.png',
      rarity: 'epic'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Sitting Dino',
      icon: 'sitting_dino.png',
      rarity: 'common'
    }
  }),
  Create(Collection('dinos'), {
    data: {
      name: 'Sleeping Dino',
      icon: 'sleeping_dino.png',
      rarity: 'uncommon'
    }
  })
)
```

### Features

- Login
- Register
- Logout
- Change password when logged in
- Block calls on 3 faulty logins. 
- Authorization rules for public data, data for regular logged in users and admin users. Give a user admin privileges by changing his document and providing him with a `type: "admin"` field. 
- Identity-based rate-limiting for logged-in users and separate rate-limiting for anonymous users. 
- Validation on the email and password field when registering. 

