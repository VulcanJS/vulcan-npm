---
title: Groups & Permissions
---

## Groups

Vulcan permissions work through user groups. There are two types of groups, **default groups** and **custom groups**. 

### Default Groups

Default groups exist out of the box for any Vulcan app, and they are *dynamic* in nature. In other words, a user is considered as belonging to these four groups based on a range of different factors. These groups are:

- `anyone`: any user. In other words, any client connecting to your app, whether they are authentified or not. The only permissions usually assigned to this group are usually `read` permissions. 
- `visitors`: any **non logged-in** user. This excludes logged in members. Typically used for the login page for example.
- `members`: any **logged-in** user. This group will typically be able to `create` documents. 
- `owners`: any logged-in user that **is the owner of the current document** (which is determined by comparing a document's `userId` property with the current user's own `_id`).
- `admins`: any user with its `isAdmin` property set to `true`. **In Vulcan, admins are really admins, they can do anything.** See next section on how to define intermediate custom roles such as "moderators".



🗝️*If you come from Vulcan Meteor: the old deprecated group `guests` could mean anyone, or only non-logged in users, excluding `members`, depending on the context.*
*We replaced it by 2 non-ambiguous groups, `anyone` (literally anyone, it behaves like "guests" used to do) and `visitors` (not logged-in only).* 
*You can safely replace "guests" by "anyone" everywhere in your code.*

### Custom Groups

If you use any other custom group in your app, it will act as a custom groups.

You can then assign a group to a user by modifying their `groups` property (an array of group name strings), either through your app itself or in the database directly. 

Out of the box, custom groups don't do anything. You can check if a user belongs to any given group with:

```js
import { isMemberOf } from "@vulcanjs/permissions"

const user = { _id: "42", groups: ["moderators", "accessDashboard", "premiums"]}

isMemberOf(currentUser, 'moderators') // true
isMemberOf(currentUser, 'accessDashboard') // true

const myDocument =  { userId: "42", foo: "bar"}
isMemberOf(currentUser, 'owners', myDocument) // true

isMemberOf(currentUser, 'admins') // false
isMemberOf(currentUser, 'product-owners') // false
```

And then act based on the result. 

There is no rule on how to define custom groups. They can be group of persons (Role Based Access Control, RBAC) or
type of features a person can access (feature flagging), depending on the requirements of your project.

### Combining Groups

Note that a user can belong to more than one group. For example, a logged-in user from the `staff` group with the `isAdmin` set to true that is also the creator of the document being edited would be considered as belonging to the `members`, `owners`, `admins`, and `staff` groups at the same time. 

### The Admin Group

Note that the admin role will always make any permission check return `true`, and will also automatically be assigned to the first user that signs up on any new Vulcan app. 

## Document-level Permissions

The main way to define permissions in your app is through the `createModel` function:

```ts
const Movie = createModel({
  name: 'Movie',
  schema,
  permissions: {
    canCreate: ['members'],
    canRead: ['members'],
    canUpdate: ['owners', 'admins'],
    canDelete: ['owners', 'admins'],
  },
});
```

The `createModel` object takes a `permissions` property that itself takes four `canRead`, `canCreate`, `canUpdate`, and `canDelete` properties corresponding to the four basic CRUD operations. 

These properties can take either an array of group names that will be allowed to perform the operation as in the example above; or a function that returns `true` or `false`:

```js
const Movie = createModel({

  //...

  permissions: {
    canCreate: options => { return true/false },
    canRead: options => { return true/false },
    canUpdate: options => { return true/false },
    canDelete: options => { return true/false },
  },

});
```

The `options` object has the following properties, from type `PermissionChecker`:

- `user`
- `document` (except for `canCreate`)
- `context` (Request context, only available when permission check is called from server)
- `operationName`: an optional field that tells where the permission check is ran

### The Owners Group

The `owners` group is a little special in that it's the only group that acts on specific documents. In other words, whereas defining `canRead: ['staff']` will allow access to *any* document in the collection to the `staff` group wholesale, specifying `canRead: ['owners']` will filter document one by one to check their ownership relative to the current user. 

Also note that a document can only have one owner. If you need more granular permissions, you can use your own custom permission functions instead of relying on groups. 

### Checking Permissions

If you need to test if a user passes a permission check, you can do so using the following shortcuts:

- `canCreateDocument({ model, user, context })`
- `canUpdateDocument({ model, user, document, context })`
- `canDeleteDocument({ model, user, document, context })`

They are exposed by `@vulcanjs/permissions`.

🗝️*If you come from Vulcan Meteor: those functions were previously named `Users.canCreate`, `Users.canUpdate` and `Users.canDelete`.*


## Field-level Permissions

Vulcan has two levels of permission checks: the document level, and the field level. 

Consider a scenario where a user can edit their own posts, but an admin can edit anybody's post. Now let's add the requirement that a user can only edit a post's `title` property, but an admin can also edit a post's `status`. 

First, as explained above, we'll need a **document-level** check to see if the current user can edit a given document. Next comes the second check: is the user trying to modify fields they don't have access to? This check lives at the field level, in the schema:

```js
// in your schema
title: {
  type: String,
  canRead: ['anyone'],
  canCreate: ['members'],
  canUpdate: ['owners'],
},
status: {
  type: Number,
  canRead: ['anyone'],
  canCreate: ['admins'],
  canUpdate: ['admins'],
},
```

The `canUpdate` property takes an array of the names of the groups that can edit a given field. For more fine-grained permissions `canRead`, `canCreate`, and `canUpdate` can also take a function that returns a boolean as argument.

Note that there is no `canDelete` field-level check because any user who has the ability to modify a field's value also has the ability to erase its contents.

Also, field-level checks will only proceed if the document-level check first passes. This means that while you can make them more restrictive (“regular users can edit their own posts, but only admins can edit a post's status”) you can't do the opposite (“only admins can edit posts, but regular users can edit a post's title”).

The `@vulcanjs/permissions` package exposes `canCreateField`, `canUpdateField` and `canDeleteField` functions similarly to their document counterpart.

## Route Access

Since we started developing Vulcan Meteor years ago, routing systems evolved a lot in the JS ecosystem.

For example, Next.js provides multiple way of redirecting a user, client-side or server-side, in a middleware... you can check [this StackOverflow post for more details](https://stackoverflow.com/a/60616536/5513532).

Therefore, you can reuse `@vulcanjs/permissions` functions such as `isMemberOf` to check if a user belongs to a certain group or owns a certain document. The final implementation of route access checking depends on the technology/router you are using.