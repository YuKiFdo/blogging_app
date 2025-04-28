
# Blog App

A full-stack blog application built with Next.js, PostgreSQL, and Prisma. This app features authentication, content management, comments, likes, categories, and tags.

## Setup Instructions

### Prerequisites
- **Node.js** (>= 14.x.x)
- **NPM** (>= 6.x.x) or **Yarn**
- **PostgreSQL** (you have a database URL set)
- **Azure Storage** for file storage (you have the environment variables for Azure Storage)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YuKiFdo/blogging_app.git
   cd blog-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory and add your environment variables. You can use `.env.example` as a reference.

4. Set up the PostgreSQL database schema using Prisma:

    ```bash
    npx prisma migrate dev --name init
    ```

5. Seed the database with initial data (optional):

    ```bash
    npx prisma db seed
    ```

6. Start the development server:

    ```bash
    npm run dev
    ```

   or

   ```bash
   yarn dev
   ```

## Database Schema Overview

The database schema is defined in `prisma/schema.prisma`. It includes the following models:
- **User**: Represents a user in the system.
- **Post**: Represents a blog post.
- **Comment**: Represents a comment on a blog post.
- **Like**: Represents a like on a blog post.
- **Category**: Represents a category for blog posts.
- **Tag**: Represents a tag for blog posts.
- **PostTag**: Represents the many-to-many relationship between posts and tags.
- **PostCategory**: Represents the many-to-many relationship between posts and categories.
- **SavedPost**: Represents a saved post for a user.

### User Roles Explanation

1. **Admin**
   - Full access to all features.
   - Can create, edit, delete posts.
   - Publish or unpublish posts.
   - Can manage users, assign roles, and permissions.

2. **Editor**
   - Can create, edit, and delete posts.
   - Can perform all Reader actions.

3. **Reader**
   - Can read and comment on posts.
   - Can like posts.
   - Can save posts for later reading.

### API Endpoints

#### Admin API
- **`GET /api/admin/users`** - Retrieve a list of all users.
- **`GET /api/admin/users/:id`** - Retrieve details of a specific user by ID.
- **`PUT /api/admin/users/"id`** - Update user detailes of specific user by ID

#### Authentication API
- **`POST /api/auth`** - Handle authentication (login, register, etc.).

#### Categories API
- **`GET /api/categories`** - Retrieve a list of all categories.

#### Tags API
- **`GET /api/tags`** - Retrieve a list of all tags.

#### Posts API
- **`GET /api/posts`** - Retrieve a list of all blog posts.
- **`POST /api/posts`** - Create a new blog post.
- **`GET /api/posts/:slug`** - Retrieve details of a specific post by its slug.
- **`POST /api/posts/:slug/comments`** - Add a new comment to a post.
- **`GET /api/posts/:slug/comments/:id`** - Retrieve a specific comment by ID.
- **`POST /api/posts/:slug/likes`** - Like a post.
- **`POST /api/posts/:slug/publish`** - Publish a post.
- **`POST /api/posts/:slug/save`** - Save a post for later reading.
 - **`PUT /api/posts/:slug`** - Update Post detailes of specific post by slug


#### Stats API
- **`GET /api/stats`** - Retrieve general statistics for the blog (e.g., total posts, users, etc.).
- **`GET /api/stats/top-posts`** - Retrieve the top-performing posts based on views, likes, etc.

#### File Upload API
- **`POST /api/upload`** - Upload files (e.g., images) for posts.


